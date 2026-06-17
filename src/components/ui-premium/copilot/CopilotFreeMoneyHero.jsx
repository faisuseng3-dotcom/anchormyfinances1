import React from 'react';
import { motion } from 'framer-motion';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useFreeMoney } from '@/hooks/useFreeMoney';
import { buildHeroContext } from '@/lib/dashboardHeroContext';
import { springPop } from '@/lib/motionPresets';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/**
 * Framåtblickande hero — "Säkert att spendera".
 */
export default function CopilotFreeMoneyHero({
  previewAmount = null,
  isExpensePreview = true,
  className = '',
}) {
  const { profile } = useFinancialProfile();
  const { transactions = [] } = useTransactions({ personalOnly: true, limit: 1000 });
  const { freeMoney: baseFree, margin } = useFreeMoney();

  const free = previewAmount != null && isExpensePreview
    ? Math.max(0, baseFree - Math.abs(Number(previewAmount) || 0))
    : previewAmount != null && !isExpensePreview
      ? baseFree + Math.abs(Number(previewAmount) || 0)
      : baseFree;

  const context = buildHeroContext(profile, transactions);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPop}
      className={`rounded-[28px] overflow-hidden ${className}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="px-6 pt-10 pb-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40">
          Säkert att spendera
        </p>
        <p className="text-[68px] sm:text-[80px] font-bold text-white tabular-nums leading-none mt-4 tracking-tight">
          {fmt(free)}
          <span className="text-[26px] sm:text-[30px] font-medium text-white/40 ml-2">kr</span>
        </p>

        <div className="mt-6 space-y-1.5">
          <p className="text-[14px] text-white/65">{context.budgetLine}</p>
          {context.paydayLine && (
            <p className="text-[14px] text-white/45">{context.paydayLine}</p>
          )}
          {context.trendLine && (
            <p className="text-[14px] font-medium text-[#22d97a]">{context.trendLine}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
