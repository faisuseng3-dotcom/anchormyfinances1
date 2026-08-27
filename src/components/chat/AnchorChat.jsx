// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAdvisorContext } from '@/hooks/useAdvisorContext';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useAppMemoryContext } from '@/hooks/useAppMemoryContext';
import { askCoachChat } from '@/lib/coachChat';
import { COACH_SUGGESTIONS } from '@/lib/coachSuggestions';
import { getRecentConversations, MEMORY_UX_NOTICE, isMemoryEnabled } from '@/lib/anchorMemory';
import { AI_FEATURES } from '@/lib/anchorMemory/types';

export default function AnchorChat({ hideSuggestions = false }) {
  const { profile, transactions } = useAdvisorContext();
  const { updateProfile } = useFinancialProfile();
  const [pendingQuery, setPendingQuery] = useState('');
  const appMemory = useAppMemoryContext(pendingQuery);

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Jag kan svara på allt om din ekonomi — och ändra budget, inkomst, lån och prenumerationer om du ber mig. Välj en fråga eller skriv själv.',
  }]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!profile || historyLoaded) return;
    let cancelled = false;
    (async () => {
      if (!isMemoryEnabled(profile)) {
        setHistoryLoaded(true);
        return;
      }
      const chats = await getRecentConversations(profile, { limit: 20, feature: AI_FEATURES.COACH });
      if (cancelled || !chats.length) {
        setHistoryLoaded(true);
        return;
      }
      const restored = chats.flatMap((c) => {
        const pair = [];
        if (c.message) pair.push({ role: 'user', content: c.message });
        if (c.response) pair.push({ role: 'assistant', content: c.response });
        return pair;
      }).slice(-16);
      if (restored.length) {
        setMessages((prev) => [prev[0], ...restored]);
      }
      setHistoryLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [profile, historyLoaded]);

  const buildHistory = useCallback((msgs, userMsg) => {
    return [...msgs, userMsg]
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-12)
      .map((m) => `${m.role === 'user' ? 'Användare' : 'Lago'}: ${m.content}`)
      .join('\n');
  }, []);

  const send = useCallback(async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');
    setPendingQuery(userText);

    const userMsg = { role: 'user', content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = buildHistory(messages, userMsg);
      const { answer, profileUpdated, actions } = await askCoachChat({
        question: userText,
        profile,
        transactions,
        history,
        appMemory,
        updateProfile,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: answer,
          profileUpdated,
          actions,
        },
      ]);
    } catch (err) {
      console.error('coachChat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err?.message === 'coach_unavailable'
            ? 'Coachen svarar inte just nu. Försök igen om en stund — budgetändringar som "sätt matbudget till 500 kr" fungerar oftast direkt.'
            : 'Kunde inte nå Coachen just nu. Kontrollera nätverket och försök igen.',
        },
      ]);
    } finally {
      setLoading(false);
      setPendingQuery('');
    }
  }, [input, loading, messages, profile, transactions, appMemory, updateProfile, buildHistory]);

  useEffect(() => {
    const onPrompt = (e) => {
      const prompt = e.detail?.prompt;
      if (prompt) send(prompt);
    };
    window.addEventListener('anchor:coach-prompt', onPrompt);
    return () => window.removeEventListener('anchor:coach-prompt', onPrompt);
  }, [send]);

  return (
    <div className="flex flex-col" style={{ height: '100%' }}>
      {isMemoryEnabled(profile) && (
        <p className="px-4 pt-3 text-[12px] text-white/40 leading-relaxed shrink-0">
          {MEMORY_UX_NOTICE}
        </p>
      )}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ overscrollBehavior: 'contain' }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={`flex items-end ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[82%]">
                <div
                  className="px-4 py-2.5 text-[14px] leading-relaxed"
                  style={msg.role === 'user' ? {
                    background: 'rgba(79, 174, 130, 0.16)',
                    color: '#fff',
                    borderRadius: '18px 18px 4px 18px',
                  } : {
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.82)',
                    borderRadius: '18px 18px 18px 4px',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {msg.content}
                </div>
                {msg.profileUpdated && (
                  <p className="flex items-center gap-1 text-[11px] text-[#4fae82] mt-1.5 ml-1">
                    <CheckCircle2 size={12} />
                    Profil uppdaterad
                  </p>
                )}
                {msg.actions?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-1">
                    {msg.actions.map((action) => (
                      <Link
                        key={action.href}
                        to={action.href}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium text-[#4fae82] no-underline"
                        style={{ background: 'rgba(79, 174, 130, 0.12)', border: '1px solid rgba(79, 174, 130, 0.3)' }}
                      >
                        {action.label}
                        <ArrowRight size={12} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-end justify-start">
              <div className="px-4 py-3 rounded-[18px] rounded-bl-[4px]"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="flex gap-1">
                  {[0, 1, 2].map((j) => (
                    <motion.span key={j} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--color-accent)' }}
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 1.1, delay: j * 0.18, repeat: Infinity }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.length === 1 && !loading && !hideSuggestions && (
          <div className="flex flex-col gap-2 pt-1">
            {COACH_SUGGESTIONS.filter((s) => !s.navigate).map((s) => (
              <button key={s.id} type="button" onClick={() => send(s.prompt)}
                className="w-full text-left px-4 py-3 rounded-2xl text-[13px] text-white/70 touch-manipulation"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 px-4 py-3 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Fråga eller be mig ändra något…"
          className="flex-1 h-11 rounded-full px-4 text-[14px] text-white outline-none placeholder-white/25"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <button
          type="button"
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 touch-manipulation transition-opacity"
          style={{ background: '#4fae82' }}
        >
          <Send size={16} className="text-[#040814]" />
        </button>
      </div>
    </div>
  );
}
