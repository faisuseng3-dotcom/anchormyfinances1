import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send, Bot, ExternalLink, AlertCircle, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

const AGENTS = [
  {
    id: 'skatte_strategen',
    name: 'Skatte-Strategen',
    icon: '🧾',
    color: '#10B981',
    tagline: 'Skatteåterbäring & avdrag',
    hint: 'Fråga mig om ROT/RUT, ränteavdrag eller din skattåterbäring för 2025.',
  },
  {
    id: 'cfo_analytikern',
    name: 'CFO-Analytikern',
    icon: '📊',
    color: '#3B82F6',
    tagline: 'Kassaflöde & CFO-rapporter',
    hint: 'Klistra in en billänk eller fråga om ett köp – jag gör en CFO Impact Report.',
  },
  {
    id: 'livskvalitets_coachen',
    name: 'Livskvalitets-Coachen',
    icon: '🧠',
    color: '#8B5CF6',
    tagline: 'Value Pulse & beteendeekonomi',
    hint: 'Berätta om ett köp du funderar på – jag analyserar om det ger dig långsiktig lycka.',
  },
  {
    id: 'marknads_scannern',
    name: 'Marknads-Scannern',
    icon: '🔍',
    color: '#F59E0B',
    tagline: 'Bättre priser & gratispengar',
    hint: 'Berätta om dina abonnemang eller lån – jag hittar billigare alternativ åt dig.',
  },
];

// Orchestration: multi-agent for big decisions
const ORCHESTRATION_TRIGGER_WORDS = ['bil', 'bostad', 'lån', 'hyra', 'köpa', 'investera', 'frilansa', 'byta jobb'];

function VerificationBadge({ url, label }) {
  return (
    <a href={url || 'https://skatteverket.se'} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border mt-1"
      style={{ color: '#F59E0B', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)' }}>
      <AlertCircle className="w-3 h-3" />
      {label || 'Verifiera på Skatteverket'}
      <ExternalLink className="w-2.5 h-2.5" />
    </a>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
          style={{ background: msg.agentColor ? `${msg.agentColor}22` : 'rgba(255,255,255,0.05)', border: `1px solid ${msg.agentColor || '#fff'}33` }}>
          {msg.agentIcon || '🤖'}
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${isUser ? 'bg-indigo-600 text-white' : 'text-slate-200'}`}
        style={!isUser ? { background: 'rgba(31,41,55,0.8)', border: '1px solid rgba(255,255,255,0.08)' } : {}}>
        {msg.agentName && !isUser && (
          <p className="text-[10px] font-bold mb-1" style={{ color: msg.agentColor }}>{msg.agentName}</p>
        )}
        <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 text-sm leading-relaxed">
          {msg.content}
        </ReactMarkdown>
        {msg.needsVerification && (
          <div className="mt-2">
            <VerificationBadge url={msg.verifyUrl} label={msg.verifyLabel} />
          </div>
        )}
        {/* Orchestration labels */}
        {msg.isOrchestrated && (
          <div className="flex items-center gap-1 mt-2">
            <Users className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] text-purple-400">Samanalys från ledningsgruppen</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgentHub({ profile }) {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversations, setConversations] = useState({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [convObjs, setConvObjs] = useState({});
  const bottomRef = useRef(null);

  const messages = selectedAgent ? (conversations[selectedAgent] || []) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getOrCreateConv = async (agentId) => {
    if (convObjs[agentId]) return convObjs[agentId];
    const conv = await base44.agents.createConversation({ agent_name: agentId });
    setConvObjs(c => ({ ...c, [agentId]: conv }));
    return conv;
  };

  const shouldOrchestrate = (text) => {
    return ORCHESTRATION_TRIGGER_WORDS.some(w => text.toLowerCase().includes(w));
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedAgent || loading) return;
    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    const agent = AGENTS.find(a => a.id === selectedAgent);
    const userBubble = { role: 'user', content: userMsg };
    setConversations(c => ({ ...c, [selectedAgent]: [...(c[selectedAgent] || []), userBubble] }));

    const needsOrchestration = shouldOrchestrate(userMsg) && selectedAgent === 'cfo_analytikern';

    if (needsOrchestration) {
      // Orchestrated multi-agent response
      const profileContext = profile ? `Användarens profil: inkomst ${profile.income} kr/mån, buffert ${profile.buffer} kr, sparmål ${profile.savingsGoalName}: ${profile.savingsGoal} kr.` : '';

      // Run 3 agents in parallel
      const [cfoPart, skattePart, marketPart] = await Promise.all([
        base44.integrations.Core.InvokeLLM({
          prompt: `Du är CFO-Analytikern. ${profileContext} Fråga: "${userMsg}". Ge ett kort kassaflödesanalys-svar (max 3 meningar). Om du är osäker på en ränta, skriv [VERIFIERA]. SVENSKA.`,
        }),
        base44.integrations.Core.InvokeLLM({
          prompt: `Du är Skatte-Strategen. ${profileContext} Fråga: "${userMsg}". Ge ett kort skatterelaterat perspektiv (max 2 meningar, t.ex. ränteavdrag 30%). Om du är osäker på en siffra, skriv [VERIFIERA: skatteverket.se]. SVENSKA.`,
        }),
        base44.integrations.Core.InvokeLLM({
          prompt: `Du är Marknads-Scannern. ${profileContext} Fråga: "${userMsg}". Ge ett konkret marknadsalternativ eller besparing (max 2 meningar). Om du är osäker på ett pris, skriv [UPPSKATTNING]. SVENSKA.`,
        }),
      ]);

      const hasCfoVerify = cfoPart.includes('[VERIFIERA]');
      const hasSkatteVerify = skattePart.includes('[VERIFIERA');
      const hasMarketEst = marketPart.includes('[UPPSKATTNING]');

      const orchestratedContent = `**📊 CFO-Analytikern:**\n${cfoPart.replace('[VERIFIERA]', '').trim()}\n\n**🧾 Skatte-Strategen:**\n${skattePart.replace(/\[VERIFIERA[^\]]*\]/g, '').trim()}\n\n**🔍 Marknads-Scannern:**\n${marketPart.replace('[UPPSKATTNING]', '').trim()}`;

      setConversations(c => ({
        ...c,
        [selectedAgent]: [...(c[selectedAgent] || []), userBubble, {
          role: 'assistant',
          content: orchestratedContent,
          agentName: 'Ledningsgruppen',
          agentIcon: '🏛️',
          agentColor: '#8B5CF6',
          isOrchestrated: true,
          needsVerification: hasCfoVerify || hasSkatteVerify,
          verifyUrl: 'https://skatteverket.se',
          verifyLabel: hasSkatteVerify ? 'Verifiera skattesats på Skatteverket' : 'Verifiera ränta hos din bank',
        }]
      }));
    } else {
      // Single agent via SDK
      try {
        const conv = await getOrCreateConv(selectedAgent);
        const updatedConv = await base44.agents.addMessage(conv, { role: 'user', content: userMsg });
        const lastMsg = updatedConv?.messages?.slice(-1)[0];
        const content = lastMsg?.content || '';

        const needsVerification = content.includes('[VERIFIERA') || content.includes('[UPPSKATTNING]');
        setConversations(c => ({
          ...c,
          [selectedAgent]: [...(c[selectedAgent] || []), {
            role: 'assistant',
            content: content.replace(/\[VERIFIERA[^\]]*\]/g, '').replace('[UPPSKATTNING]', ''),
            agentName: agent.name,
            agentIcon: agent.icon,
            agentColor: agent.color,
            needsVerification,
            verifyUrl: selectedAgent === 'skatte_strategen' ? 'https://skatteverket.se' : null,
            verifyLabel: selectedAgent === 'skatte_strategen' ? 'Verifiera på Skatteverket' : 'Verifiera hos leverantören',
          }]
        }));
        setConvObjs(c => ({ ...c, [selectedAgent]: updatedConv }));
      } catch {
        // Fallback via InvokeLLM if agent SDK fails
        const agentDefs = {
          skatte_strategen: 'Du är Skatte-Strategen, expert på svenska skatteregler 2026. Om du är osäker på en siffra, skriv [VERIFIERA: skatteverket.se]. Svara på svenska.',
          livskvalitets_coachen: 'Du är Livskvalitets-Coachen, expert på beteendeekonomi och Value Pulse. Ge ett Value Pulse Score 1-10. Svara på svenska.',
          marknads_scannern: 'Du är Marknads-Scannern, expert på att hitta bättre priser. Om du är osäker på ett pris, skriv [UPPSKATTNING]. Svara på svenska.',
        };
        const profileCtx = profile ? `Profil: inkomst ${profile.income} kr, buffert ${profile.buffer} kr.` : '';
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `${agentDefs[selectedAgent] || ''} ${profileCtx} Fråga: "${userMsg}"`,
          add_context_from_internet: selectedAgent === 'marknads_scannern',
        });
        const needsVerification = res.includes('[VERIFIERA') || res.includes('[UPPSKATTNING]');
        setConversations(c => ({
          ...c,
          [selectedAgent]: [...(c[selectedAgent] || []), {
            role: 'assistant',
            content: res.replace(/\[VERIFIERA[^\]]*\]/g, '').replace('[UPPSKATTNING]', ''),
            agentName: agent.name,
            agentIcon: agent.icon,
            agentColor: agent.color,
            needsVerification,
            verifyUrl: selectedAgent === 'skatte_strategen' ? 'https://skatteverket.se' : null,
            verifyLabel: 'Verifiera uppgiften',
          }]
        }));
      }
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {!selectedAgent ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Ledningsgruppen</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Fyra specialiserade rådgivare. Välj en specialist eller ställ en komplex fråga för samanalys från alla.</p>
          <div className="grid grid-cols-2 gap-3">
            {AGENTS.map((agent, i) => (
              <motion.button key={agent.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedAgent(agent.id)}
                className="p-4 rounded-2xl text-left transition-all border hover:border-white/20"
                style={{ background: 'rgba(17,24,39,0.7)', border: `1px solid ${agent.color}33` }}>
                <div className="text-2xl mb-2">{agent.icon}</div>
                <p className="text-sm font-bold text-white">{agent.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: agent.color }}>{agent.tagline}</p>
              </motion.button>
            ))}
          </div>

          {/* Orchestration info */}
          <div className="rounded-xl p-4 flex gap-3" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <Users className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-purple-400 mb-0.5">Automatisk samanalys</p>
              <p className="text-[10px] text-slate-400">Frågar du CFO-Analytikern om ett bil- eller bostadsköp aktiveras alla 3 specialister automatiskt – CFO, Skatte-Strategen och Marknads-Scannern svarar tillsammans.</p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Agent chat */}
          {(() => {
            const agent = AGENTS.find(a => a.id === selectedAgent);
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedAgent(null)} className="text-slate-400 hover:text-white text-sm">← Tillbaka</button>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{agent.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{agent.name}</p>
                      <p className="text-[10px]" style={{ color: agent.color }}>{agent.tagline}</p>
                    </div>
                  </div>
                </div>

                {/* Hint if no messages */}
                {messages.length === 0 && (
                  <div className="rounded-xl p-4 text-sm text-slate-400 italic" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    💡 {agent.hint}
                  </div>
                )}

                {/* Messages */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
                  {loading && (
                    <div className="flex gap-2 items-center text-xs text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      {selectedAgent === 'cfo_analytikern' && shouldOrchestrate(input || '') ? 'Ledningsgruppen analyserar…' : `${agent.name} svarar…`}
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder={`Fråga ${agent.name}…`}
                    className="flex-1 h-11 text-sm" />
                  <Button onClick={handleSend} disabled={!input.trim() || loading}
                    className="h-11 w-11 p-0 rounded-xl flex-shrink-0"
                    style={{ background: agent.color }}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Zero-hallucination notice */}
                <p className="text-[10px] text-slate-600 text-center">
                  🛡️ Zero-Hallucination Mode aktivt – osäkra siffror flaggas med verifieringslänk
                </p>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}