import React from 'react';
import { PieChart } from 'lucide-react';
import TechHero from '@/components/ui/TechHero';
import { dashLabel, dashHeroNumber } from '@/lib/appSurface';

export default function BudgetHero({ totalSpent, totalBudgeted, monthName }) {
  const pct = totalBudgeted > 0 ? Math.min(totalSpent / totalBudgeted, 1) : 0;
  const remaining = Math.max(0, totalBudgeted - totalSpent);

  return (
    <TechHero label="Budget" title={<span className="capitalize">{monthName}</span>} accent="violet">
      {totalBudgeted > 0 ? (
        <div className="mt-4 pt-3 border-t border-white/[0.08]">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className={dashLabel}>Spenderat</p>
              <p className={`${dashHeroNumber} text-[2rem] mt-0.5`}>
                {totalSpent.toLocaleString('sv-SE')}
                <span className="text-[16px] text-white/40 ml-1">kr</span>
              </p>
            </div>
            <div className="text-right">
              <p className={dashLabel}>Kvar</p>
              <p className="text-[18px] font-light text-white/75 tabular-nums mt-0.5">
                {remaining.toLocaleString('sv-SE')} kr
              </p>
            </div>
          </div>
          <div className="w-full h-1 rounded-full overflow-hidden bg-white/[0.06] mt-4">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct * 100}%`,
                background:
                  pct >= 1
                    ? '#FF8A9A'
                    : pct >= 0.8
                      ? '#FCD34D'
                      : 'linear-gradient(90deg, #5B8CFF, #9FB5FF)',
              }}
            />
          </div>
        </div>
      ) : (
        <p className="text-[14px] text-white/45 mt-3 font-light">
          Tryck på en kategori nedan för att sätta din första gräns.
        </p>
      )}
      <div className="absolute top-5 right-5 w-10 h-10 rounded-2xl bg-white/[0.06] flex items-center justify-center shadow-[var(--anchor-shadow-1)]">
        <PieChart className="w-5 h-5 text-violet-300/80" />
      </div>
    </TechHero>
  );
}
