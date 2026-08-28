import React from 'react';
import { ShoppingBag } from 'lucide-react';
import TechHero from '@/components/ui/TechHero';
import { getMonthlyMargin } from '@/lib/financialUtils';
import { dashLabel } from '@/lib/appSurface';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function PurchaseHero({ profile }) {
  const margin = profile ? getMonthlyMargin(profile) : 0;
  const threshold = profile?.impulseThreshold || 700;

  return (
    <TechHero label="Köpråd" title="Länk, bild eller större köp" accent="blue">
      {margin > 0 && (
        <div className="flex gap-6 mt-4 pt-3 border-t border-[var(--color-border)]">
          <div>
            <p className={dashLabel}>Marginal</p>
            <p className="text-[18px] font-light text-[var(--color-text-primary)] tabular-nums">{fmt(margin)} kr</p>
          </div>
          <div>
            <p className={dashLabel}>Impulsgräns</p>
            <p className="text-[18px] font-light text-[var(--color-text-primary)] tabular-nums">{fmt(threshold)} kr</p>
          </div>
        </div>
      )}
      <div className="absolute top-5 right-5 w-10 h-10 rounded-2xl bg-white border border-[var(--color-border)] flex items-center justify-center shadow-[var(--anchor-shadow-1)]">
        <ShoppingBag className="w-5 h-5 text-[var(--color-accent)]" />
      </div>
    </TechHero>
  );
}
