// @ts-nocheck
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { VERDICT_META, purchaseConsequenceLine, fmtKr as fmt } from '@/lib/purchaseNarratives';
import { createPageUrl } from '@/utils';

/**
 * Gemensam köp-verdikt: 🟢/🟡/🔴 + konsekvens + "bästa datum att köpa".
 * Icke-moraliserande — visar konsekvensen, låter användaren bestämma.
 */
export default function PurchaseVerdictCard({ price, priceLabel, impact, bestDate, className = '' }) {
  if (!impact) return null;
  const meta = VERDICT_META[impact.verdict] || VERDICT_META.yellow;

  return (
    <div
      className={`rounded-2xl p-4 space-y-3 ${className}`}
      style={{ background: `${meta.color}11`, border: `1px solid ${meta.color}44` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {price > 0 && (
            <p className="text-[13px] text-[var(--color-text-secondary)] mb-1">
              {priceLabel ? `${priceLabel}: ` : ''}{fmt(price)} kr
            </p>
          )}
          <p className="text-[15px] font-bold tracking-wide" style={{ color: meta.color }}>
            {meta.emoji} {meta.label}
          </p>
        </div>
      </div>
      <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">{purchaseConsequenceLine(impact)}</p>
      {impact.verdict !== 'green' && (
        bestDate?.found ? (
          <div className="pt-2 border-t border-[var(--color-border)]">
            <p className="text-[12px] text-[var(--color-text-muted)] uppercase tracking-wider font-bold mb-0.5">Bättre datum att köpa</p>
            <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{bestDate.dateLabel}</p>
            <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">Då har bufferten hunnit återhämta sig till minst {fmt(bestDate.balanceThen)} kr.</p>
          </div>
        ) : (
          <div className="pt-2 border-t border-[var(--color-border)]">
            <p className="text-[12px] text-[var(--color-text-secondary)]">
              Även {bestDate?.horizonDays || 90} dagar framåt är det fortfarande tajt — börja med att bygga bufferten innan köpet.
            </p>
          </div>
        )
      )}
      {impact.verdict !== 'green' && (
        <Link
          to={createPageUrl('FuturePulse')}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] no-underline"
        >
          Se påverkan på min framtid
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
