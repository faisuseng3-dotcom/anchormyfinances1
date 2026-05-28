import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { sectionSubtitleClass } from '@/lib/anchorTheme';
import FutureChatBar from './FutureChatBar';
import OracleResult from './OracleResult';

export default function AnchorOracle({ profile }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [lastQuery, setLastQuery] = useState('');

  if (!profile) {
    return <p className={sectionSubtitleClass}>Laddar din profil…</p>;
  }

  const totalFixed =
    (profile.housingCost || 0) +
    (profile.subscriptions || []).reduce((s, x) => s + x.amount, 0) +
    (profile.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);
  const currentMargin = (profile.income || 0) - totalFixed;

  const handleQuery = async (query) => {
    setLoading(true);
    setLastQuery(query);
    setResult(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Du är en svensk privatekonom. Analysera scenariot kort och konkret med siffror.

Nuläge:
- Nettoinkomst: ${profile.income?.toLocaleString('sv-SE')} kr/mån
- Fasta kostnader: ${totalFixed.toLocaleString('sv-SE')} kr/mån
- Marginal: ${currentMargin.toLocaleString('sv-SE')} kr/mån
- Buffert: ${(profile.buffer || 0).toLocaleString('sv-SE')} kr

Scenario: "${query}"

Beräkna simulerad marginal, buffertpåverkan (0-100 %), status (ok/tight/critical).
Sammanfattning: max 3 meningar på svenska, utan jargong.
Vid tight/critical: ge max 3 korta handlingsförslag i paths.
butterflyEffect och stressTest: en mening vardera om relevant, annars tom sträng.

Svara ENBART med JSON.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          simulatedMargin: { type: 'number' },
          bufferImpactPct: { type: 'number' },
          status: { type: 'string', enum: ['ok', 'tight', 'critical'] },
          summary: { type: 'string' },
          butterflyEffect: { type: 'string' },
          stressTest: { type: 'string' },
          paths: { type: 'array', items: { type: 'string' } },
        },
        required: ['simulatedMargin', 'bufferImpactPct', 'status', 'summary', 'paths'],
      },
    });

    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <FutureChatBar onSubmit={handleQuery} loading={loading} />

      {lastQuery && !loading && (
        <div className="py-2">
          <p className="text-[13px] text-white/45">Ditt scenario</p>
          <p className="text-[15px] text-white/80 mt-0.5 leading-relaxed">&ldquo;{lastQuery}&rdquo;</p>
        </div>
      )}

      {loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={sectionSubtitleClass}
        >
          Räknar på marginal och buffert…
        </motion.p>
      )}

      <AnimatePresence>
        {result && !loading && (
          <OracleResult result={result} currentMargin={currentMargin} />
        )}
      </AnimatePresence>
    </div>
  );
}
