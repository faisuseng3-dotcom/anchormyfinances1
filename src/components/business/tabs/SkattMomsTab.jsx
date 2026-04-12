import React from 'react';
import { motion } from 'framer-motion';
import VATShield from '@/components/business/VATShield';
import NetSalaryCalculator from '@/components/business/NetSalaryCalculator';
import TaxOptimizer from '@/components/business/TaxOptimizer';
import LiquidityGauge from '@/components/business/LiquidityGauge';

export default function SkattMomsTab({ vatReserved, vatDeadlines, entityType, totalBalance }) {
  return (
    <div className="px-5 space-y-4">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-2xl font-black pt-4" style={{ color: '#1A2332', letterSpacing: '-0.5px' }}>
        Skatt &amp; Moms
      </motion.p>
      <p className="text-sm -mt-2" style={{ color: '#9AA5B4' }}>Vi har räknat ut din moms åt dig</p>
      <LiquidityGauge totalBalance={totalBalance} vatReserved={vatReserved} grossIncome={totalBalance} entityType={entityType} />
      <VATShield vatReserved={vatReserved} vatDeadlines={vatDeadlines} />
      <NetSalaryCalculator entityType={entityType} />
      <TaxOptimizer />
    </div>
  );
}