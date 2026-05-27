import React from 'react';
import { motion } from 'framer-motion';
import TaxClarityHero from '@/components/business/TaxClarityHero';
import VATShield from '@/components/business/VATShield';
import NetSalaryCalculator from '@/components/business/NetSalaryCalculator';
import TaxOptimizer from '@/components/business/TaxOptimizer';

export default function SkattMomsTab({ vatReserved, vatDeadlines, entityType, totalBalance, isReset, transactions = [] }) {
  const safeVat = isReset ? 0 : (vatReserved || 0);
  const safeDeadlines = isReset ? [] : (vatDeadlines || []);
  const safeBalance = isReset ? 0 : (totalBalance || 0);

  return (
    <div className="space-y-6 pb-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 px-5">
        <h1 className="text-[22px] font-semibold text-[#1A2332] tracking-tight">Skatt &amp; moms</h1>
        <p className="text-[14px] text-[#9AA5B4] mt-0.5">Vi har räknat ut din moms åt dig</p>
      </motion.div>
      <TaxClarityHero
        grossBalance={safeBalance}
        vatReserved={safeVat}
        entityType={entityType}
        transactions={transactions}
        isReset={isReset}
      />
      <VATShield vatReserved={safeVat} vatDeadlines={safeDeadlines} />
      <NetSalaryCalculator entityType={entityType} />
      <TaxOptimizer
        entityType={entityType}
        annualRevenue={safeBalance * 12}
        annualExpenses={safeBalance * 12 * 0.6}
        isReset={isReset}
      />
    </div>
  );
}