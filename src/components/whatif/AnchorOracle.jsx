import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';
import FutureChatBar from './FutureChatBar';
import OracleResult from './OracleResult';

export default function AnchorOracle({ profile }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [lastQuery, setLastQuery] = useState('');

  if (!profile) return null;

  const totalFixed = (profile.housingCost || 0) +
    (profile.subscriptions || []).reduce((s, x) => s + x.amount, 0) +
    (profile.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);
  const currentMargin = (profile.income || 0) - totalFixed;

  const handleQuery = async (query) => {
    setLoading(true);
    setLastQuery(query);
    setResult(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Du är Oracle-motorn i appen ANCHOR, en kombination av CFO-Analytikern och Skatte-Strategen.
Din uppgift: analysera användarens fritext-scenario och räkna ut den ekonomiska påverkan.

Användarens nuläge:
- Månadsinkomst (netto): ${profile.income?.toLocaleString('sv-SE')} kr
- Fasta kostnader/mån: ${totalFixed.toLocaleString('sv-SE')} kr
- Nuvarande marginal: ${currentMargin.toLocaleString('sv-SE')} kr/mån
- Buffert: ${(profile.buffer || 0).toLocaleString('sv-SE')} kr
- Sparmål: ${profile.savingsGoalName || 'inget'} (${(profile.savingsGoal || 0).toLocaleString('sv-SE')} kr)

Scenario från användaren: "${query}"

Instruktioner:
1. Extrahera ekonomiska variabler (löneavdrag, extra utgifter, tidsperiod, skattepåverkan etc.)
2. Beräkna simulerad månadsmarginal efter scenariot
3. Räkna ut om buffert behöver användas och hur stor andel
4. Bedöm status: "ok" (marginal > 500), "tight" (0–500), "critical" (< 0)
5. Skriv en CFO-sammanfattning på svenska (3-4 meningar) – ärlig, lösningsorienterad, med konkreta siffror
6. Lägg till fjärilseffekten (hur scenariot påverkar 3-årsbilden)
7. Stress-test: vad händer om det blir 20% dyrare än planerat?
8. Om status är "tight" eller "critical" – ge 3 konkreta alternativa vägar
9. Använd aktuell kunskap om A-kassa (~80% av lön, max ~13 200 kr/mån), skattetabeller, etc. om relevant

Svara ENBART med JSON-objektet, inget annat.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          simulatedMargin: { type: 'number', description: 'Beräknad marginal efter scenariot (kr/mån)' },
          bufferImpactPct: { type: 'number', description: 'Andel av buffert som behöver användas (0-100)' },
          status: { type: 'string', enum: ['ok', 'tight', 'critical'] },
          summary: { type: 'string', description: 'CFO-sammanfattning på svenska med konkreta siffror' },
          butterflyEffect: { type: 'string', description: '3-årsanalys av scenariot' },
          stressTest: { type: 'string', description: 'Worst case om kostnader ökar 20%' },
          paths: {
            type: 'array',
            description: 'Max 3 alternativa vägar om status är tight/critical (tom array annars)',
            items: { type: 'string' }
          }
        },
        required: ['simulatedMargin', 'bufferImpactPct', 'status', 'summary', 'paths']
      }
    });

    setResult(res);
    setLoading(false);
  };

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', border: '1px solid rgba(139,92,246,0.3)' }}>
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <p className="text-xs text-purple-400 font-semibold tracking-widest uppercase">Anchor Oracle</p>
            <h3 className="text-base font-bold text-white">Framtids-Chatten</h3>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-4">Beskriv ditt scenario med egna ord – CFO-Analytikern och Skatte-Strategen räknar ut konsekvenserna åt dig.</p>
      </div>

      <div className="p-5 space-y-5">
        <FutureChatBar onSubmit={handleQuery} loading={loading} />

        {/* Last query label */}
        {lastQuery && !loading && (
          <div className="rounded-xl px-4 py-2.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-slate-500">Ditt scenario</p>
            <p className="text-sm text-slate-300 italic mt-0.5">"{lastQuery}"</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-8">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-2 border-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-slate-400">Oracle analyserar ditt scenario…</p>
            <p className="text-xs text-slate-600">Bryter ner variabler, räknar skatt och buffertpåverkan</p>
          </motion.div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && !loading && (
            <OracleResult result={result} currentMargin={currentMargin} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}