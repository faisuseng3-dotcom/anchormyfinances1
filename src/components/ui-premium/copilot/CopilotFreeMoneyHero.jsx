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
      className={`anchor-hero-open ${className}`}
    >
      <p className="text-[15px] font-medium text-white/50 tracking-tight">
        Säkert att spendera
      </p>

      <p className="anchor-hero-amount text-white tabular-nums tracking-tight mt-3">
        {fmt(free)}
        <span className="anchor-hero-currency">kr</span>
      </p>

      <div className="mt-5 space-y-1.5">
        {context.trendLine && (
          <p
            className={`text-[15px] font-medium tabular-nums ${
              context.trendPositive ? 'text-[#22d97a]' : 'text-white/55'
            }`}
          >
            {context.trendPositive ? '↑ ' : '↓ '}
            {context.trendLine}
          </p>
        )}
        {context.paydayLine && (
          <p className="text-[15px] text-white/45">{context.paydayLine}</p>
        )}
        {!context.trendLine && context.budgetLine && (
          <p className="text-[15px] text-white/45">{context.budgetLine}</p>
        )}
      </div>
    </motion.header>
  );
}
