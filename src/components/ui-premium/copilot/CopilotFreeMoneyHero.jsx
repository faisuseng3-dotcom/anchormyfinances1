import React from 'react';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useFreeMoney } from '@/hooks/useFreeMoney';
import { buildHeroContext } from '@/lib/dashboardHeroContext';

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

  const rootClass = [
    'anchor-sts',
    layout === 'balance' ? 'anchor-sts--balance' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <section className={rootClass}>
      <p className="anchor-sts-label">Säkert att spendera</p>
      <p className="anchor-sts-amount">
        {fmt(free)}
        <span className="anchor-sts-currency">kr</span>
      </p>
      {subline && (
        <p className="anchor-sts-subline">{subline}</p>
      )}
    </section>
  );
}
