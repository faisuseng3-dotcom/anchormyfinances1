import React from 'react';
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
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--color-accent-soft)', border: '1px solid rgba(37,99,235,0.18)' }}>
        <p className="text-[13px] font-semibold text-[var(--color-accent)] mb-1">Lago rekommenderar</p>
        <p className="text-[13.5px] text-[var(--color-text-secondary)] leading-relaxed">
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
      <p className="text-[13px] text-[var(--color-text-muted)] mb-3">
        Andra saker som påverkar din framtid mest just nu:
      </p>
      <div className="grid gap-2.5 sm:grid-cols-3">
        {insights.map((insight) => (
          <button
            key={insight.id}
            type="button"
            onClick={() => onSelect(insight.question)}
            className="text-left rounded-2xl p-4 anchor-pressable"
            style={{ background: '#FFFFFF', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13px] font-medium text-[var(--color-text-secondary)]">{insight.label}</p>
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0" />
            </div>
            <p className="text-[19px] font-bold text-[var(--color-text-primary)] mt-1.5 tabular-nums">{fmt(insight.monthly)} kr/mån</p>
            <p className="text-[11.5px] text-[var(--color-accent)] mt-1">
              {fmt(insight.fiveYearInvested)} kr investerat om 5 år
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
