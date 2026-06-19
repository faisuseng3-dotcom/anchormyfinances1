import React from 'react';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useFreeMoney } from '@/hooks/useFreeMoney';
import { buildHeroContext } from '@/lib/dashboardHeroContext';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/**
 * Säkert att spendera — beloppet renderas direkt i sidlayouten, utan card.
 */
export default function CopilotFreeMoneyHero({
  previewAmount = null,
  isExpensePreview = true,
  className = '',
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

  return (
    <section className={['anchor-sts', className].filter(Boolean).join(' ')}>
      <p className="anchor-sts-label">Säkert att spendera</p>
      <p className="anchor-sts-amount">
        {fmt(free)}
        <span className="anchor-sts-currency">kr</span>
      </p>

      <div className="anchor-hero-meta">
        {context.trendLine && (
          <p
            className={`anchor-hero-trend ${
              context.trendPositive ? 'anchor-hero-trend--up' : 'anchor-hero-trend--down'
            }`}
          >
            {context.trendPositive ? '↑ ' : '↓ '}
            {context.trendLine}
          </p>
        )}
        {context.paydayLine && (
          <p className="anchor-hero-sub">{context.paydayLine}</p>
        )}
        {!context.trendLine && context.budgetLine && (
          <p className="anchor-hero-sub">{context.budgetLine}</p>
        )}
      </div>
    </section>
  );
}
