import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';
import { getTotalFixedCosts } from '@/lib/financialUtils';

export default function ExpensesCard({ profile }) {
  if (!profile) return null;

  const totalFixedCosts = getTotalFixedCosts(profile);
  const monthlyMargin = profile.income - totalFixedCosts;
  const monthlyExpenseSum = (profile.monthlyExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const usedPercent = Math.min(100, monthlyMargin > 0 ? Math.round((monthlyExpenseSum / monthlyMargin) * 100) : 0);

  const statusColor = usedPercent >= 90 ? 'var(--color-danger)' : usedPercent >= 60 ? 'var(--color-warning)' : 'var(--color-success)';

  return (
    <Link to={createPageUrl('TransactionHistory')}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="rounded-2xl p-5 cursor-pointer"
        style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            Mina utgifter
          </p>
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        </div>

        <p className="text-2xl font-black mb-1" style={{ color: 'var(--color-text-primary)' }}>
          {monthlyExpenseSum.toLocaleString('sv-SE')} <span className="text-base font-medium" style={{ color: 'var(--color-text-muted)' }}>kr</span>
        </p>

        {/* Thin progress bar */}
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${usedPercent}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: statusColor }}
          />
        </div>
        <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
          {usedPercent}% av månadens marginal
        </p>
      </motion.div>
    </Link>
  );
}