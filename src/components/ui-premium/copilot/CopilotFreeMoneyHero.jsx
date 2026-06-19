import React from 'react';
import { motion } from 'framer-motion';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useFreeMoney } from '@/hooks/useFreeMoney';
import { buildHeroContext } from '@/lib/dashboardHeroContext';
import { springPop } from '@/lib/motionPresets';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/**
 * Öppen hero — beloppet ligger direkt på bakgrunden (Revolut/Copilot Money).
 * Ingen card, border, shadow eller glassmorphism.
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
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPop}
      className={`anchor-hero-open ${className}`.trim()}
    >
      <p className="anchor-hero-label">Säkert att spendera</p>

      <p className="anchor-hero-amount">
        {fmt(free)}
        <span className="anchor-hero-currency">kr</span>
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
    </motion.header>
  );
}
