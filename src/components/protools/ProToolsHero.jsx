import React from 'react';
import { Calculator } from 'lucide-react';
import { getTotalFixedCosts, getMonthlyMargin } from '@/lib/financialUtils';
import { sectionMetaClass, sectionSubtitleClass } from '@/lib/anchorTheme';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function ProToolsHero({ profile }) {
  const income = profile?.income || 0;
  const margin = income > 0 ? getMonthlyMargin(profile) : 0;
  const fixed = getTotalFixedCosts(profile);

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-4 -mt-2 mb-2">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#6B9FFF]/15 border border-[#6B9FFF]/25 flex items-center justify-center flex-shrink-0">
          <Calculator className="w-5 h-5 text-[#9FB5FF]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold text-white">Räkna och simulera</p>
          <p className={`${sectionSubtitleClass} mt-1`}>
            Verktyg som bygger på din profil — uppdatera siffror under Inställningar.
          </p>
        </div>
      </div>

      {income > 0 ? (
        <div className="flex gap-3 mt-3 pt-3 border-t border-white/[0.08]">
          <div className="flex-1">
            <p className={sectionMetaClass}>Marginal</p>
            <p className="text-[16px] font-semibold text-white tabular-nums mt-0.5">
              {fmt(margin)} kr
            </p>
          </div>
          <div className="w-px bg-white/[0.08]" />
          <div className="flex-1">
            <p className={sectionMetaClass}>Fasta kostnader</p>
            <p className="text-[16px] font-semibold text-white tabular-nums mt-0.5">
              {fmt(fixed)} kr
            </p>
          </div>
        </div>
      ) : (
        <p className={`${sectionMetaClass} mt-3`}>
          Fyll i inkomst i onboarding eller Inställningar för personliga belopp.
        </p>
      )}
    </div>
  );
}
