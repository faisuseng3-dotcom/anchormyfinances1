// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAdvisorContext } from '@/hooks/useAdvisorContext';
import { useAppMemoryContext } from '@/hooks/useAppMemoryContext';
import { rememberInsight } from '@/lib/aiMemory';

const OFF_TOPIC =
  'Jag är Anchors ekonomirådgivare och kan bara hjälpa dig med frågor om din privatekonomi — budget, sparande, lån, prenumerationer eller din månadsekonomi.';

const SUGGESTIONS = [
  'Hur mycket kan jag spara varje månad?',
  'Vilka prenumerationer bör jag avsluta?',
  'Hur snabbt kan jag betala av mina lån?',
  'Räcker min buffert?',
];

function buildPrompt(profile, transactions, appMemory) {
  const income    = profile?.income || 0;
  const housing   = profile?.housingCost || 0;
  const buffer    = profile?.buffer || 0;
  const subTotal  = (profile?.subscriptions || []).reduce((s, x) => s + (x.amount || 0), 0);
  const loanTotal = (profile?.loans || []).reduce((s, l) => s + (l.monthlyPayment || 0), 0);
  const margin    = Math.max(0, income - housing - subTotal - loanTotal);

  const subs = (profile?.subscriptions || [])
    .map((s) => `${s.name}: ${s.amount} kr/mån`).join(', ') || 'inga';

  const loans = (profile?.loans || [])
    .map((l) => `${l.name}: ${l.totalAmount?.toLocaleString('sv-SE')} kr kvar, ${l.interestRate || 0}% ränta, ${l.monthlyPayment || 0} kr/mån`).join('\n  ') || 'inga';

  const recentTx = (transactions || []).slice(0, 15)
    .map((t) => `${t.description || t.vendor || 'Transaktion'} (${t.date || ''}): ${t.amount > 0 ? '+' : ''}${t.amount} kr`)
    .join('\n  ') || 'inga';

  return `Du är Anchor — en personlig ekonomirådgivare inbyggd i appen Anchor. Du pratar alltid svenska och svarar kortfattat.

ANVÄNDARENS EKONOMI:
  Inkomst: ${income.toLocaleString('sv-SE')} kr/mån
  Boende: ${housing.toLocaleString('sv-SE')} kr/mån
  Prenumerationer: ${subTotal.toLocaleString('sv-SE')} kr/mån (${subs})
  Lånekostnader: ${loanTotal.toLocaleString('sv-SE')} kr/mån
  Buffert: ${buffer.toLocaleString('sv-SE')} kr
  Månadsmarginal: ${margin.toLocaleString('sv-SE')} kr

LÅN:
  ${loans}

SENASTE TRANSAKTIONER:
  ${recentTx}

${appMemory ? `AKTIVITET I APPEN:\n${appMemory}\n` : ''}
REGLER — följ dessa utan undantag:
1. Svara BARA på frågor om privatekonomi: budget, sparande, lån, räntor, prenumerationer, skatteplanering, investeringar, konsumtion, ekonomiska beslut.
2. Om frågan INTE handlar om ekonomi — svara exakt: "${OFF_TOPIC}" — inget annat.
3. Max 3 meningar om inget annat krävs. Inga emojis.
4. Basera alltid råd på siffrorna ovan.
5. Använd app-aktiviteten (köpanalyser, resor, minnen) när det är relevant.`;
}

const AnchorIcon = () => (
  <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
    style={{ background: 'linear-gradient(135deg,#6B9FFF,#4FFFB0)' }}>
    <svg width="12" height="12" viewBox="0 0 32 32" fill="none">
      <path d="M8 22V10h4.2c2.8 0 4.6 1.5 4.6 3.9 0 1.6-.8 2.8-2.1 3.4l3.1 4.7h-2.9l-2.7-4.2H10.2V22H8zm2.2-6h1.9c1.4 0 2.2-.7 2.2-1.8S13.5 12 12 12h-1.8v4z" fill="#040814"/>
      <circle cx="22" cy="16" r="5" stroke="#040814" strokeWidth="2"/>
    </svg>
  </div>
);

export default function AnchorChat() {
  const { profile, transactions } = useAdvisorContext();
  const [pendingQuery, setPendingQuery] = useState('');
  const appMemory = useAppMemoryContext(pendingQuery);

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hej! Jag är Anchor. Ställ mig en fråga om din ekonomi.',
  }]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = useCallback(async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');
    setPendingQuery(userText);

    const userMsg = { role: 'user', content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg]
        .map((m) => `${m.role === 'user' ? 'Användare' : 'Anchor'}: ${m.content}`)
        .join('\n');

      const systemPrompt = buildPrompt(profile, transactions, appMemory);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nSAMTALSHISTORIK:\n${history}\n\nAnchor:`,
      });

      const reply = typeof result === 'string'
        ? result.trim()
        : result?.message?.trim() || result?.text?.trim() || OFF_TOPIC;

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);

      // Spara fråga + svar i semantiskt minne för framtida sessioner
      rememberInsight({ text: `Fråga: ${userText} — Svar: ${reply}`, type: 'chat' });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Något gick fel. Försök igen om en stund.' },
      ]);
    } finally {
      setLoading(false);
      setPendingQuery('');
    }
  }, [input, loading, messages, profile, transactions, appMemory]);

  return (
    <div className="flex flex-col" style={{ height: '100%' }}>

      {/* Meddelanden */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && <AnchorIcon />}
              <div
                className="max-w-[78%] px-4 py-2.5 text-[14px] leading-relaxed"
                style={msg.role === 'user' ? {
                  background: 'rgba(107,159,255,0.16)',
                  color: '#fff',
                  borderRadius: '18px 18px 4px 18px',
                } : {
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.82)',
                  borderRadius: '18px 18px 18px 4px',
                }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-end gap-2">
              <AnchorIcon />
              <div className="px-4 py-3 rounded-[18px] rounded-bl-[4px]"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="flex gap-1">
                  {[0,1,2].map((i) => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-white/40"
                      animate={{ opacity: [0.3,1,0.3] }}
                      transition={{ duration: 1.1, delay: i * 0.18, repeat: Infinity }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Förslag — bara vid start */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => send(s)}
                className="px-3 py-2 rounded-xl text-[12px] text-white/55 touch-manipulation"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Inmatningsfält */}
      <div className="flex items-center gap-2 px-4 py-3 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Fråga om din ekonomi..."
          className="flex-1 h-11 rounded-full px-4 text-[14px] text-white outline-none placeholder-white/25"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <button
          type="button"
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 touch-manipulation transition-opacity"
          style={{ background: '#6B9FFF' }}
        >
          <Send size={16} className="text-[#040814]" />
        </button>
      </div>
    </div>
  );
}
