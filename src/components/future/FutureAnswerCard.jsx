import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import FutureMetric from './FutureMetric';
import FutureLineChart from './charts/FutureLineChart';
import FutureBarChart from './charts/FutureBarChart';

/**
 * Ett svar i tråden: fråga, berättande text, nyckeltal som räknas upp,
 * och det diagram som passar frågan bäst. Allt bygger på den riktiga
 * uträkningen i scenarioMath — ingenting här är påhittat av en modell.
 */
export default function FutureAnswerCard({ question, result }) {
  if (!result) return null;
  const { title, narrative, assumption, metrics, chart } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] p-5 sm:p-6"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <p className="text-[13px] text-white/40 mb-1">{question}</p>
      <h3 className="text-[19px] font-bold text-white mb-3">{title}</h3>

      {narrative && (
        <p className="text-[14.5px] text-white/70 leading-relaxed mb-4">{narrative}</p>
      )}

      {assumption && (
        <p className="flex items-start gap-1.5 text-[12px] text-white/40 mb-4 leading-relaxed">
          <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {assumption}
        </p>
      )}

      {metrics?.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-4 mb-5">
          {metrics.map((m) => (
            <FutureMetric key={m.label} {...m} />
          ))}
        </div>
      )}

      {chart?.type === 'line' && (
        <FutureLineChart data={chart.data} lines={chart.lines} />
      )}
      {chart?.type === 'bar' && <FutureBarChart data={chart.data} />}
    </motion.div>
  );
}
