import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { getMonthlyMargin } from '@/lib/financialUtils';
import { sectionMetaClass, sectionSubtitleClass } from '@/lib/anchorTheme';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function PurchaseHero({ profile }) {
  const margin = profile ? getMonthlyMargin(profile) : 0;
  const threshold = profile?.impulseThreshold || 700;

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-4 -mt-2 mb-2">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#6B9FFF]/15 border border-[#6B9FFF]/25 flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-5 h-5 text-[#9FB5FF]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold text-white">Köpråd</p>
          <p className={`${sectionSubtitleClass} mt-1`}>
            Klistra in annonslänk eller ladda upp bild — vi räknar mot din månadsbudget.
          </p>
        </div>
      </div>
      {margin > 0 && (
        <div className="flex gap-4 mt-3 pt-3 border-t border-white/[0.08]">
          <div>
            <p className={sectionMetaClass}>Marginal</p>
            <p className="text-[16px] font-semibold text-white tabular-nums">{fmt(margin)} kr</p>
          </div>
          <div>
            <p className={sectionMetaClass}>Impulsgräns</p>
            <p className="text-[16px] font-semibold text-white tabular-nums">{fmt(threshold)} kr</p>
          </div>
        </div>
      )}
    </div>
  );
}
