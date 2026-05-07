import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

/**
 * Validation Engine: varnar om planerade kostnader överstiger inkomst / safe-to-spend.
 * Tar hänsyn till både fasta budgetar OCH rörligt safe-to-spend-saldo.
 *
 * Props:
 *   profile        - FinancialProfile
 *   safeToSpend    - (optional) aktuellt beräknat safe-to-spend-saldo
 */
export default function SavingsBudgetConflictAlert({ profile, safeToSpend }) {
  if (!profile?.income) return null;

  const income = profile.income || 0;
  const fixedCosts = profile.fixedCostItems
    ? profile.fixedCostItems.reduce((s, c) => s + (c.amount || 0), 0)
    : (profile.housingCost || 0);
  const budgetTotal = Object.values(profile.budgetLimits || {}).reduce((s, v) => s + v, 0);
  const monthlySavings = profile.savingsGoalMonthlyTarget || 0;

  const totalPlanned = fixedCosts + budgetTotal + monthlySavings;

  // Kontrollera mot inkomst (strukturell konflikt)
  const incomeConflict = totalPlanned > income;
  const incomeOvershoot = Math.round(totalPlanned - income);

  // Kontrollera mot safe-to-spend om det finns (realtids-konflikt)
  const safeConflict = safeToSpend !== undefined && safeToSpend !== null && budgetTotal > safeToSpend;
  const safeOvershoot = safeConflict ? Math.round(budgetTotal - safeToSpend) : 0;

  if (!incomeConflict && !safeConflict) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-5 mb-4 flex items-start gap-3 rounded-2xl px-4 py-4"
      style={{ background: 'rgba(229,62,62,0.07)', border: '1.5px solid rgba(229,62,62,0.25)' }}
    >
      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#E53E3E' }} />
      <div className="space-y-1">
        {incomeConflict && (
          <div>
            <p className="text-sm font-bold" style={{ color: '#E53E3E' }}>Strukturell konflikt — Budget vs Sparmål</p>
            <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>
              Dina planerade kostnader ({totalPlanned.toLocaleString('sv-SE')} kr/mån) överstiger
              din inkomst ({income.toLocaleString('sv-SE')} kr) med{' '}
              <strong>{incomeOvershoot.toLocaleString('sv-SE')} kr</strong>.
            </p>
          </div>
        )}
        {safeConflict && (
          <div>
            <p className="text-sm font-bold" style={{ color: '#E53E3E' }}>Realtidskollision — Budget vs Saldo</p>
            <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>
              Din budgetplan ({budgetTotal.toLocaleString('sv-SE')} kr) överstiger ditt
              aktuella disponibla saldo ({safeToSpend.toLocaleString('sv-SE')} kr) med{' '}
              <strong>{safeOvershoot.toLocaleString('sv-SE')} kr</strong>.
              {' '}Vill du justera din budget eller minska sparmålsinsättningen?
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}