// @ts-nocheck
import React from 'react';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const VERDICT_META = {
  green: { emoji: '🟢', label: 'DU HAR RÅD', color: '#4fae82' },
  yellow: { emoji: '🟡', label: 'DU KAN KÖPA DEN — MEN JAG SKULLE VÄNTA', color: '#F59E0B' },
  red: { emoji: '🔴', label: 'JAG SKULLE INTE KÖPA DEN JUST NU', color: '#e2857a' },
};

function consequenceLine(impact) {
  if (!impact) return '';
  const { verdict, bufferBefore, bufferAfter, monthsToRebuild, goalDelayMonths } = impact;

  if (verdict === 'green') {
    return 'Köpet ryms inom vad du tryggt kan spendera den här månaden — det rör varken bufferten eller sparmålet.';
  }
  if (verdict === 'yellow') {
    let line = `Köpet påverkar ditt sparande. Bufferten går från ${fmt(bufferBefore)} kr till ${fmt(bufferAfter)} kr.`;
    if (goalDelayMonths > 0) line += ` Sparmålet skjuts upp ungefär ${goalDelayMonths} månad${goalDelayMonths === 1 ? '' : 'er'}.`;
    return line;
  }
  let line = `Köpet skulle göra att din buffert hamnar under din säkerhetsgräns (${fmt(bufferBefore)} kr → ${fmt(bufferAfter)} kr).`;
  if (monthsToRebuild > 0) line += ` Det tar ungefär ${monthsToRebuild} månad${monthsToRebuild === 1 ? '' : 'er'} att bygga upp den igen.`;
  return line;
}

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
            <p className="text-[13px] text-white/45 mb-1">
              {priceLabel ? `${priceLabel}: ` : ''}{fmt(price)} kr
            </p>
          )}
          <p className="text-[15px] font-bold tracking-wide" style={{ color: meta.color }}>
            {meta.emoji} {meta.label}
          </p>
        </div>
      </div>
      <p className="text-[14px] text-white/75 leading-relaxed">{consequenceLine(impact)}</p>
      {impact.verdict !== 'green' && (
        bestDate?.found ? (
          <div className="pt-2 border-t border-white/10">
            <p className="text-[12px] text-white/40 uppercase tracking-wider font-bold mb-0.5">Bättre datum att köpa</p>
            <p className="text-[14px] font-semibold text-white">{bestDate.dateLabel}</p>
            <p className="text-[12px] text-white/50 mt-0.5">Då har bufferten hunnit återhämta sig till minst {fmt(bestDate.balanceThen)} kr.</p>
          </div>
        ) : (
          <div className="pt-2 border-t border-white/10">
            <p className="text-[12px] text-white/50">
              Även {bestDate?.horizonDays || 90} dagar framåt är det fortfarande tajt — börja med att bygga bufferten innan köpet.
            </p>
          </div>
        )
      )}
    </div>
  );
}
