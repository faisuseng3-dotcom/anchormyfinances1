import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

/**
 * Validation Engine: varnar om Sparmål + Budget överstiger Månadsinkomst
 * Props: profile (FinancialProfile), totalBudget (number)
 */
export default function SavingsBudgetConflictAlert({ profile, totalBudget }) {
  if (!profile?.income || !profile?.savingsGoal) return null;

  const income = profile.income || 0;
  const monthlySavingsGoalDeposit = profile.savingsGoalMonthlyTarget || 0;
  const fixedCosts = profile.fixedCostItems
    ? profile.fixedCostItems.reduce((s, c) => s + (c.amount || 0), 0)
    : (profile.housingCost || 0);

  const budget = totalBudget || Object.values(profile.budgetLimits || {}).reduce((s, v) => s + v, 0);
  const total = budget + monthlySavingsGoalDeposit + fixedCosts;

  if (total <= income) return null;

  const overshoot = Math.round(total - income);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-5 mb-4 flex items-start gap-3 rounded-2xl px-4 py-4"
      style={{ background: 'rgba(229,62,62,0.07)', border: '1.5px solid rgba(229,62,62,0.25)' }}
    >
      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#E53E3E' }} />
      <div>
        <p className="text-sm font-bold" style={{ color: '#E53E3E' }}>Logisk konflikt — Budget vs Sparmål</p>
        <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>
          Dina planerade kostnader ({total.toLocaleString('sv-SE')} kr) överstiger din månadsinkomst ({income.toLocaleString('sv-SE')} kr) med{' '}
          <strong>{overshoot.toLocaleString('sv-SE')} kr</strong>. Justera din budget eller sänk sparmålsinsättningarna.
        </p>
      </div>
    </motion.div>
  );
}