import React from 'react';
import { Calculator } from 'lucide-react';
import TechHero from '@/components/ui/TechHero';
import { getTotalFixedCosts, getMonthlyMargin } from '@/lib/financialUtils';
import { dashLabel } from '@/lib/appSurface';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function ProToolsHero({ profile }) {
  const income = profile?.income || 0;
  const margin = income > 0 ? getMonthlyMargin(profile) : 0;
  const fixed = getTotalFixedCosts(profile);

  return (
    <TechHero label="Verktyg" title="Räkna och simulera utifrån din profil" accent="blue">
      {income > 0 ? (
        <div className="flex gap-6 mt-4 pt-3 border-t border-white/[0.08]">
          <div>
            <p className={dashLabel}>Marginal</p>
            <p className="text-[18px] font-light text-white tabular-nums">{fmt(margin)} kr</p>
          </div>
          <div>
            <p className={dashLabel}>Fasta</p>
            <p className="text-[18px] font-light text-white tabular-nums">{fmt(fixed)} kr</p>
          </div>
        </div>
      ) : (
        <p className="text-[14px] text-white/45 mt-3 font-light">
          Fyll i inkomst under Inställningar för belopp i kronor.
        </p>
      )}
      <div className="absolute top-5 right-5 w-10 h-10 rounded-2xl bg-white/[0.06] flex items-center justify-center ring-1 ring-white/[0.08]">
        <Calculator className="w-5 h-5 text-cyan-300/80" />
      </div>
    </TechHero>
  );
}
