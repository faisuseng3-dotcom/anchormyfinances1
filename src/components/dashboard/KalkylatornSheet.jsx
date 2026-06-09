import React, { useMemo, useState } from 'react';
import { Wrench, X } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import {
  anchorIconButtonClass,
  anchorInputClass,
  sectionMetaClass,
} from '@/lib/anchorTheme';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import { DashboardListRow } from './DashboardChrome';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function getSafeToSpend(profile) {
  if (!profile) return 0;
  const totalFixed = getTotalFixedCosts(profile);
  const monthlyMargin = (profile.income || 0) - totalFixed;
  const expenses = (profile.monthlyExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  return Math.max(0, monthlyMargin - expenses);
}

export default function KalkylatornSheet({ isOpen, onClose, profile }) {
  const [quickAmount, setQuickAmount] = useState('');

  const safeToSpend = useMemo(() => getSafeToSpend(profile), [profile]);

  const quickInsight = useMemo(() => {
    const amount = parseFloat(String(quickAmount).replace(/\s/g, '').replace(',', '.'));
    if (!amount || amount <= 0) return null;
    if (safeToSpend <= 0) {
      return 'Du har inget utrymme kvar den här månaden enligt din profil.';
    }
    const pct = Math.round((amount / safeToSpend) * 100);
    if (pct >= 100) {
      return `Det överstiger ditt kvarvarande utrymme (${fmt(safeToSpend)} kr).`;
    }
    return `Det är ${pct} % av det du har kvar till lön (${fmt(safeToSpend)} kr).`;
  }, [quickAmount, safeToSpend]);

  const handleClose = () => {
    setQuickAmount('');
    onClose?.();
  };

  return (
    <AnchorSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Snabbräkning"
      subtitle="Kolla om ett belopp ryms i marginalen"
      maxHeight="min(56dvh, 420px)"
      headerRight={
        <AnchorPressable onClick={handleClose} className={anchorIconButtonClass} aria-label="Stäng">
          <X className="w-4 h-4" />
        </AnchorPressable>
      }
    >
      {profile?.income > 0 && (
        <div className="anchor-elev-1 rounded-[var(--anchor-radius-lg)] bg-white/[0.04] shadow-[var(--anchor-shadow-1)] px-4 py-4 mb-5">
          <p className={sectionMetaClass}>Kvar den här månaden</p>
          <p className="text-[26px] font-light text-white tabular-nums mt-1 tracking-tight">
            {fmt(safeToSpend)} kr
          </p>
        </div>
      )}

      {profile && (
        <>
          <p className={sectionMetaClass}>Vad kostar det?</p>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              inputMode="decimal"
              placeholder="Belopp i kronor"
              value={quickAmount}
              onChange={(e) => setQuickAmount(e.target.value)}
              className={`${anchorInputClass} flex-1`}
            />
            <span className="flex items-center text-[15px] text-white/40 pr-1">kr</span>
          </div>
          {quickInsight && (
            <p className="anchor-type-body-sm mt-3">{quickInsight}</p>
          )}
        </>
      )}

      <div className="mt-6">
        <DashboardListRow
          href={createPageUrl('ProTools')}
          onClick={handleClose}
          leading={
            <div className="w-11 h-11 rounded-[var(--anchor-radius-md)] bg-[var(--color-accent)]/12 ring-1 ring-[var(--color-accent)]/20 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
          }
          title="Alla verktyg"
          subtitle="Köp, lån, budget, resa och simuleringar"
        />
      </div>
    </AnchorSheet>
  );
}
