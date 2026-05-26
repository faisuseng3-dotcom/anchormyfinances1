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
    <div className="px-5 space-y-4">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-2xl font-black pt-4" style={{ color: '#1A2332', letterSpacing: '-0.5px' }}>
        Skatt &amp; Moms
      </motion.p>
      <p className="text-sm -mt-2" style={{ color: '#9AA5B4' }}>Vi har räknat ut din moms åt dig</p>
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