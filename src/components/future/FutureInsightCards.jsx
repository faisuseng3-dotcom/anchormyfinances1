import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/**
 * Proaktiv analys innan användaren ställt en fråga — de tre saker som
 * påverkar deras framtid mest just nu, beräknat från riktiga transaktioner.
 */
export default function FutureInsightCards({ insights, onSelect }) {
  if (!insights?.length) return null;
  const top = insights[0];

  return (
    <div className="mb-8">
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(79, 174, 130, 0.08)', border: '1px solid rgba(79, 174, 130, 0.2)' }}>
        <p className="text-[13px] font-semibold text-[var(--color-accent)] mb-1">Lago rekommenderar</p>
        <p className="text-[13.5px] text-white/70 leading-relaxed">
          En minskning på {fmt(top.monthly)} kr/mån i {top.label.toLowerCase()} är den förändring som ger mest rimlig effekt just nu, baserat på din senaste ekonomiska historik.
        </p>
        <button
          type="button"
          onClick={() => onSelect(top.question)}
          className="mt-2 text-[12.5px] font-semibold text-[var(--color-accent)]"
        >
          Visa scenario →
        </button>
      </div>
      <p className="text-[13px] text-white/45 mb-3">
        Andra saker som påverkar din framtid mest just nu:
      </p>
      <div className="grid gap-2.5 sm:grid-cols-3">
        {insights.map((insight, i) => (
          <motion.button
            key={insight.id}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onSelect(insight.question)}
            className="text-left rounded-2xl p-4 anchor-pressable"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13px] font-medium text-white/60">{insight.label}</p>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/25 shrink-0" />
            </div>
            <p className="text-[19px] font-bold text-white mt-1.5 tabular-nums">{fmt(insight.monthly)} kr/mån</p>
            <p className="text-[11.5px] text-[var(--color-accent)] mt-1">
              {fmt(insight.fiveYearInvested)} kr investerat om 5 år
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
