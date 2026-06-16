import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Loader2, Check, Zap, Brain, Award } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const PROACTIVE = [
  { a: 'Ny bil', b: 'Frilansa på heltid' },
  { a: 'Byta till större lägenhet', b: 'Spara till Madrid-resan' },
  { a: 'Köpa bostad', b: 'Stanna kvar och investera' },
];

export default function DecisionEngine({ profile }) {
  const [choiceA, setChoiceA] = useState('');
  const [choiceB, setChoiceB] = useState('');
  const [costA, setCostA] = useState('');
  const [costB, setCostB] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [winner, setWinner] = useState(null);

  const income = profile?.income || 30000;
  const totalFixed = (profile?.housingCost || 0) + ((profile?.subscriptions || []).reduce((s, x) => s + x.amount, 0));
  const margin = income - totalFixed;
  const buffer = profile?.buffer || 0;
  const savingsGoalName = profile?.savingsGoalName || 'sparmålet';

  const loadProactive = (p) => {
    setChoiceA(p.a); setChoiceB(p.b);
    setCostA(''); setCostB('');
    setResult(null); setWinner(null);
  };

  const handleBattle = async () => {
    setLoading(true);
    setWinner(null);
    const ai = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
      prompt: `Du är en livs-CFO som hjälper en person att välja mellan två alternativ. Du väger inte bara pengar utan tid, frihet och välmående.

Val A: "${choiceA}"${costA ? ` – kostnad: ${fmt(costA)} kr` : ''}
Val B: "${choiceB}"${costB ? ` – kostnad: ${fmt(costB)} kr` : ''}
Användarens inkomst: ${fmt(income)} kr/mån
Marginal: ${fmt(margin)} kr/mån
Buffert: ${fmt(buffer)} kr
Sparmål: "${savingsGoalName}"

Ge:
1. winner: "A" eller "B" – det ekonomiskt och livsmässigt smartaste valet
2. verdict_a: En auktoritär 1-menings-bedömning av val A (pengar + tid + frihet). SVENSKA.
3. verdict_b: En auktoritär 1-menings-bedömning av val B (pengar + tid + frihet). SVENSKA.
4. months_until_a: Hur många månader behöver användaren jobba/spara för val A (baserat på marginal)?
5. months_until_b: Hur många månader behöver användaren jobba/spara för val B?
6. freedom_score_a: 1-10 – hur mycket frihet ger val A på lång sikt?
7. freedom_score_b: 1-10 – hur mycket frihet ger val B på lång sikt?
8. money_score_a: 1-10 – hur ekonomiskt smart är val A?
9. money_score_b: 1-10 – hur ekonomiskt smart är val B?
10. final_wisdom: 2-3 meningar. Djupare livs-råd bortom pengar. SVENSKA. Känn och personligt.
11. certificate_headline: En kort, inspirerande rubrik för beslutet (max 8 ord). SVENSKA.

Svara ENDAST med JSON.`,
      response_json_schema: {
        type: 'object',
        properties: {
          winner: { type: 'string' },
          verdict_a: { type: 'string' },
          verdict_b: { type: 'string' },
          months_until_a: { type: 'number' },
          months_until_b: { type: 'number' },
          freedom_score_a: { type: 'number' },
          freedom_score_b: { type: 'number' },
          money_score_a: { type: 'number' },
          money_score_b: { type: 'number' },
          final_wisdom: { type: 'string' },
          certificate_headline: { type: 'string' },
        }
      }
    });
    setResult(ai);
    setLoading(false);
  };

  const ScoreBar = ({ label, value, color }) => (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-slate-500">{label}</span>
        <span className="font-bold" style={{ color }}>{value}/10</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value * 10}%` }} transition={{ duration: 0.8 }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Proactive suggestions */}
      {!choiceA && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" aria-hidden /> Vanliga battles – välj ett par att testa</p>
          {PROACTIVE.map((p, i) => (
            <button key={i} onClick={() => loadProactive(p)}
              className="w-full p-3 rounded-xl text-left border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-sm text-slate-300">
              <span className="text-indigo-400 font-bold">{p.a}</span>
              <span className="text-slate-500 mx-2">vs</span>
              <span className="text-purple-400 font-bold">{p.b}</span>
            </button>
          ))}
        </div>
      )}

      {/* Battle arena */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(17,24,39,0.7)', boxShadow: 'var(--anchor-shadow-1)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Swords className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Besluts-Battle</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Choice A */}
          <div className="space-y-2">
            <div className="text-center py-1 rounded-lg text-xs font-bold text-indigo-300" style={{ background: 'rgba(99,102,241,0.15)' }}>VAL A</div>
            <Input value={choiceA} onChange={e => setChoiceA(e.target.value)} placeholder="t.ex. Ny bil" className="h-10 text-sm text-center" />
            <Input type="number" value={costA} onChange={e => setCostA(e.target.value)} placeholder="Kostnad (kr)" className="h-10 text-sm text-center" />
          </div>

          {/* VS divider */}
          <div className="space-y-2">
            <div className="text-center py-1 rounded-lg text-xs font-bold text-purple-300" style={{ background: 'rgba(139,92,246,0.15)' }}>VAL B</div>
            <Input value={choiceB} onChange={e => setChoiceB(e.target.value)} placeholder="t.ex. Frilansa" className="h-10 text-sm text-center" />
            <Input type="number" value={costB} onChange={e => setCostB(e.target.value)} placeholder="Kostnad (kr)" className="h-10 text-sm text-center" />
          </div>
        </div>

        <div className="flex items-center gap-3 text-center">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-2xl font-black text-slate-600">VS</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <Button onClick={handleBattle} disabled={!choiceA || !choiceB || loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 font-bold text-white">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />AI räknar på frihet & pengar…</> : <><Swords className="w-4 h-4 mr-2" aria-hidden /> Starta Battle</>}
        </Button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Side-by-side comparison */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: choiceA, verdict: result.verdict_a, months: result.months_until_a, free: result.freedom_score_a, money: result.money_score_a, isWinner: result.winner === 'A', color: '#6366F1' },
                { label: choiceB, verdict: result.verdict_b, months: result.months_until_b, free: result.freedom_score_b, money: result.money_score_b, isWinner: result.winner === 'B', color: '#A855F7' },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl p-4 relative"
                  style={{ background: s.isWinner ? `${s.color}18` : 'rgba(17,24,39,0.6)', boxShadow: 'var(--anchor-shadow-1)' }}>
                  {s.isWinner && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                      style={{ background: s.color }}>VINNARE</div>
                  )}
                  <p className="text-xs font-bold text-slate-400 mb-2 mt-1 truncate">{s.label}</p>
                  <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">{s.verdict}</p>
                  <div className="space-y-2">
                    <ScoreBar label="Frihet" value={s.free} color="#10B981" />
                    <ScoreBar label="Ekonomi" value={s.money} color={s.color} />
                  </div>
                  {s.months > 0 && (
                    <p className="text-[10px] text-slate-500 mt-2">Redo om ~<span className="text-white font-bold">{Math.round(s.months)} mån</span></p>
                  )}
                </div>
              ))}
            </div>

            {/* Final wisdom */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(139,92,246,0.08)', boxShadow: 'var(--anchor-shadow-1)' }}>
              <p className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" aria-hidden /> Guru-domen</p>
              <p className="text-sm text-slate-300 leading-relaxed">{result.final_wisdom}</p>
            </div>

            {/* Decision certificate */}
            <div className="rounded-2xl p-5 text-center" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', boxShadow: 'var(--anchor-shadow-1)' }}>
              <Award className="w-8 h-8 text-purple-300 mx-auto mb-2" aria-hidden />
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Besluts-certifikat</p>
              <p className="text-lg font-black text-white mb-1">{result.certificate_headline}</p>
              <p className="text-xs text-slate-400">Analyserat av Anchor · {new Date().toLocaleDateString('sv-SE')}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-purple-300"
                style={{ background: 'rgba(139,92,246,0.2)', boxShadow: 'var(--anchor-shadow-1)' }}>
                <Check className="w-3.5 h-3.5" /> Verifierat beslut
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}