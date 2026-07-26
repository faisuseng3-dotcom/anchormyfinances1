import React from 'react';
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
  const { profile } = useFinancialProfile();
  const { transactions = [] } = useTransactions({ personalOnly: true, limit: 1000 });
  const { freeMoney: baseFree } = useFreeMoney();

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
    </section>
  );
}
