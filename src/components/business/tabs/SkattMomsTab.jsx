import React from 'react';
import { motion } from 'framer-motion';
import VATShield from '@/components/business/VATShield';
import NetSalaryCalculator from '@/components/business/NetSalaryCalculator';
import TaxOptimizer from '@/components/business/TaxOptimizer';
import LiquidityGauge from '@/components/business/LiquidityGauge';

export default function SkattMomsTab({ vatReserved, vatDeadlines, entityType, totalBalance, isReset }) {
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
      <LiquidityGauge totalBalance={safeBalance} vatReserved={safeVat} grossIncome={safeBalance} entityType={entityType} />
      <VATShield vatReserved={safeVat} vatDeadlines={safeDeadlines} />
      <NetSalaryCalculator entityType={entityType} />
      <TaxOptimizer />
    </div>
  );
}