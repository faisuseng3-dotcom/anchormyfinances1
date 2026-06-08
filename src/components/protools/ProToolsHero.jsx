import React from 'react';
import { Calculator } from 'lucide-react';
import { getTotalFixedCosts, getMonthlyMargin } from '@/lib/financialUtils';
import { dashLabel } from '@/lib/dashboardTheme';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function ProToolsHero({ profile }) {
  const income = profile?.income || 0;
  const margin = income > 0 ? getMonthlyMargin(profile) : 0;
  const fixed = getTotalFixedCosts(profile);

  return (
    <div className="anchor-premium-hero mb-6 -mt-1">
      <div className="relative z-10 anchor-hero-asymmetric">
        <div className="min-w-0 pr-4">
          <p className={dashLabel}>Verktyg</p>
          <p className="anchor-type-headline mt-1 text-[17px]">
            Räkna och simulera utifrån din profil
          </p>
          {income > 0 ? (
            <div className="flex gap-6 mt-4 pt-3 border-t border-white/[0.08]">
              <div>
                <p className={dashLabel}>Marginal</p>
                <p className="text-[18px] font-light text-white tabular-nums tracking-tight">
                  {fmt(margin)} kr
                </p>
              </div>
              <div>
                <p className={dashLabel}>Fasta</p>
                <p className="text-[18px] font-light text-white tabular-nums tracking-tight">
                  {fmt(fixed)} kr
                </p>
              </div>
            </div>
          ) : (
            <p className="anchor-type-body-sm mt-3">
              Fyll i inkomst under Inställningar för belopp i kronor.
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-[var(--anchor-radius-lg)] bg-white/[0.06] flex items-center justify-center ring-1 ring-white/[0.08] anchor-elev-1 shrink-0">
          <Calculator className="w-5 h-5 text-[var(--color-accent)]" />
        </div>
      </div>
    </div>
  );
}
