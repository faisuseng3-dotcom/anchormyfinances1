import React from 'react';
import { motion } from 'framer-motion';
import { isSameMonth, isSameYear } from 'date-fns';

export default function BasicStatusBubble({ profile }) {
  if (!profile) return null;

  const today = new Date();
  const income = profile.income || 0;
  const housingCost = profile.housingCost || 0;
  const totalSubscriptions = (profile.subscriptions || []).reduce((s, x) => s + x.amount, 0);
  const totalLoanPayments = (profile.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);
  const totalFixedCosts = housingCost + totalSubscriptions + totalLoanPayments;

  // Monthly savings deduction: 10% of income as default
  const monthlySavings = profile.savingsGoal > 0 ? income * 0.10 : 0;

  // Current month expenses
  const currentMonthExpenses = (profile.monthlyExpenses || [])
    .filter(e => {
      const d = new Date(e.date);
      return isSameMonth(d, today) && isSameYear(d, today);
    })
    .reduce((s, e) => s + e.amount, 0);

  const amountRemaining = income - totalFixedCosts - monthlySavings - currentMonthExpenses;
  const disposable = income - totalFixedCosts - monthlySavings;
  const yellowThreshold = disposable * 0.10;

  let color, shadow, label, valueColor;
  if (amountRemaining <= 0) {
    color = 'rgba(239,68,68,0.15)';
    shadow = '0 0 40px rgba(239,68,68,0.4)';
    label = `Du har gått över budget med`;
    valueColor = '#f87171';
  } else if (amountRemaining <= yellowThreshold) {
    color = 'rgba(245,158,11,0.15)';
    shadow = '0 0 40px rgba(245,158,11,0.4)';
    label = 'Snart slut –';
    valueColor = '#fbbf24';
  } else {
    color = 'rgba(16,185,129,0.15)';
    shadow = '0 0 40px rgba(16,185,129,0.4)';
    label = 'Du kan spendera';
    valueColor = '#34d399';
  }

  const displayAmount = Math.abs(amountRemaining);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      className="flex flex-col items-center justify-center mx-auto"
      style={{
        width: 210,
        height: 210,
        borderRadius: '50%',
        background: color,
        border: '2px solid rgba(255,255,255,0.1)',
        boxShadow: shadow,
      }}
    >
      <p className="text-sm text-white/70 text-center px-4 leading-tight">{label}</p>
      <p className="text-4xl font-extrabold mt-1" style={{ color: valueColor }}>
        {displayAmount.toLocaleString('sv-SE')}
      </p>
      <p className="text-sm font-semibold" style={{ color: valueColor }}>kr</p>
      {amountRemaining > 0 && (
        <p className="text-xs text-white/50 mt-1">kvar denna månad</p>
      )}
    </motion.div>
  );
}