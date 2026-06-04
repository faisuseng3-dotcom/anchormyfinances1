import React from 'react';
import { PieChart } from 'lucide-react';
import { sectionMetaClass, sectionSubtitleClass } from '@/lib/anchorTheme';

export default function BudgetHero({ totalSpent, totalBudgeted, monthName }) {
  const pct = totalBudgeted > 0 ? Math.min(totalSpent / totalBudgeted, 1) : 0;
  const remaining = Math.max(0, totalBudgeted - totalSpent);

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-4 -mt-2 mb-2">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#6B9FFF]/15 border border-[#6B9FFF]/25 flex items-center justify-center flex-shrink-0">
          <PieChart className="w-5 h-5 text-[#9FB5FF]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold text-white">Månadsbudget</p>
          <p className={`${sectionSubtitleClass} mt-1 capitalize`}>{monthName}</p>
        </div>
      </div>

      {totalBudgeted > 0 ? (
        <div className="mt-4 pt-3 border-t border-white/[0.08]">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className={sectionMetaClass}>Spenderat</p>
              <p className="text-[26px] font-semibold text-white tabular-nums leading-none mt-0.5">
                {totalSpent.toLocaleString('sv-SE')} kr
              </p>
            </div>
            <div className="text-right">
              <p className={sectionMetaClass}>Kvar</p>
              <p className="text-[17px] font-semibold text-white/80 tabular-nums mt-0.5">
                {remaining.toLocaleString('sv-SE')} kr
              </p>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/[0.08] mt-3">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct * 100}%`,
                background:
                  pct >= 1 ? '#FF8A9A' : pct >= 0.8 ? '#FCD34D' : 'linear-gradient(90deg, #5B8CFF, #9FB5FF)',
              }}
            />
          </div>
        </div>
      ) : (
        <p className={`${sectionMetaClass} mt-3 pt-3 border-t border-white/[0.08]`}>
          Tryck på en kategori nedan för att sätta din första gräns.
        </p>
      )}
    </div>
  );
}
