import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import { KALKYLATOR_TOOLS, sortTools, toolPageHref } from '@/lib/toolCatalog';
import {
  anchorIconButtonClass,
  anchorInputClass,
  sectionMetaClass,
} from '@/lib/anchorTheme';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import { DashboardDivider, DashboardListRow } from './DashboardChrome';

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
  const calcItems = useMemo(
    () => sortTools(KALKYLATOR_TOOLS, profile?.topConcern),
    [profile?.topConcern],
  );

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
      title="Kalkylator"
      subtitle="Vad vill du räkna på?"
      maxHeight="min(78dvh, 640px)"
      headerRight={
        <AnchorPressable onClick={handleClose} className={anchorIconButtonClass} aria-label="Stäng">
          <X className="w-4 h-4" />
        </AnchorPressable>
      }
    >
      {profile?.income > 0 && (
        <div className="anchor-elev-1 rounded-[var(--anchor-radius-lg)] bg-white/[0.04] ring-1 ring-white/[0.08] px-4 py-4 mb-5">
          <p className={sectionMetaClass}>Kvar den här månaden</p>
          <p className="text-[26px] font-light text-white tabular-nums mt-1 tracking-tight">
            {fmt(safeToSpend)} kr
          </p>
        </div>
      )}

      {profile && (
        <>
          <p className={sectionMetaClass}>Snabbräkning</p>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              inputMode="decimal"
              placeholder="Vad kostar det?"
              value={quickAmount}
              onChange={(e) => setQuickAmount(e.target.value)}
              className={`${anchorInputClass} flex-1`}
            />
            <span className="flex items-center text-[15px] text-white/40 pr-1">kr</span>
          </div>
          {quickInsight && (
            <p className="anchor-type-body-sm mt-3">{quickInsight}</p>
          )}
          <DashboardDivider className="my-5" />
        </>
      )}

      {calcItems.map((item, i) => {
        const Icon = item.icon;
        return (
          <React.Fragment key={item.id}>
            {i > 0 && <DashboardDivider />}
            <DashboardListRow
              href={toolPageHref(item)}
              onClick={handleClose}
              leading={
                <div className="w-11 h-11 rounded-[var(--anchor-radius-md)] bg-[var(--color-accent)]/12 ring-1 ring-[var(--color-accent)]/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[var(--color-accent)]" />
                </div>
              }
              title={item.question}
              subtitle={item.hint}
            />
          </React.Fragment>
        );
      })}

      <DashboardDivider className="my-4" />
      <Link
        to={createPageUrl('ProTools')}
        onClick={handleClose}
        className="flex items-center justify-center gap-1 py-3 text-[14px] font-medium text-white/45 hover:text-white/70 no-underline anchor-pressable"
      >
        Fler verktyg
        <ChevronRight className="w-4 h-4" />
      </Link>
    </AnchorSheet>
  );
}
