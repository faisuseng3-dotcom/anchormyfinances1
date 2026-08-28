import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useFreeMoney } from '@/hooks/useFreeMoney';
import { buildHeroContext } from '@/lib/dashboardHeroContext';
import { useCountUp } from '@/hooks/useCountUp';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/**
 * Säkert att spendera — beloppet renderas direkt i sidlayouten, utan card.
 * layout="balance" → centrerad Revolut-layout (endast dashboard).
 */
export default function CopilotFreeMoneyHero({
  previewAmount = null,
  isExpensePreview = true,
  className = '',
  layout = 'default',
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { profile } = useFinancialProfile();
  const { transactions = [] } = useTransactions({ personalOnly: true, limit: 1000 });
  const { freeMoney: baseFree, safeToSpend } = useFreeMoney();

  const free = previewAmount != null && isExpensePreview
    ? Math.max(0, baseFree - Math.abs(Number(previewAmount) || 0))
    : previewAmount != null && !isExpensePreview
      ? baseFree + Math.abs(Number(previewAmount) || 0)
      : baseFree;

  const context = buildHeroContext(profile, transactions);

  const subline = context.trendLine
    ? (context.trendPositive ? `Du ligger ${context.trendLine}` : context.trendLine)
    : context.paydayLine || context.budgetLine || null;

  const isBalanceHero = layout === 'balance';
  const displayedFree = useCountUp(free, isBalanceHero ? 900 : 0);

  const rootClass = [
    'anchor-sts',
    isBalanceHero ? 'anchor-sts--balance' : '',
    className,
  ].filter(Boolean).join(' ');

  const amount = (
    <p className="anchor-sts-amount">
      {fmt(isBalanceHero ? displayedFree : free)}
      <span className="anchor-sts-currency">kr</span>
    </p>
  );

  return (
    <section className={rootClass}>
      <p className="anchor-sts-label">Säkert att spendera</p>
      {isBalanceHero ? (
        <div className="anchor-sts-glow-wrap">
          <div className="anchor-sts-glow" aria-hidden="true" />
          {amount}
        </div>
      ) : amount}
      {subline && (
        <p className="anchor-sts-subline">{subline}</p>
      )}
      {isBalanceHero && previewAmount == null && safeToSpend?.isReady && safeToSpend.breakdown.length > 0 && (
        <div className="anchor-sts-breakdown-wrap">
          <button
            type="button"
            onClick={() => setShowBreakdown((v) => !v)}
            className="anchor-sts-breakdown-toggle inline-flex items-center gap-1 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Visa beräkning
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform"
              style={{ transform: showBreakdown ? 'rotate(180deg)' : 'none' }}
            />
          </button>
          {showBreakdown && (
            <dl className="anchor-sts-breakdown-list mt-3 w-full max-w-[280px] mx-auto text-left">
              {safeToSpend.breakdown.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1.5 text-[14px] border-b border-[var(--color-border)] last:border-0">
                  <dt className="text-[var(--color-text-secondary)]">{row.label}</dt>
                  <dd className={row.value < 0 ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)]'}>
                    {row.value < 0 ? '−' : ''}{fmt(Math.abs(row.value))} kr
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 mt-1 text-[14px] font-semibold">
                <dt className="text-[var(--color-text-primary)]">Tryggt att spendera</dt>
                <dd className="text-[var(--color-text-primary)]">{fmt(safeToSpend.amount)} kr</dd>
              </div>
            </dl>
          )}
        </div>
      )}
    </section>
  );
}
