import React from 'react';
import { motion } from 'framer-motion';
import VATShield from '@/components/business/VATShield';
import NetSalaryCalculator from '@/components/business/NetSalaryCalculator';
import TaxOptimizer from '@/components/business/TaxOptimizer';
import LiquidityGauge from '@/components/business/LiquidityGauge';

export default function SkattMomsTab({ vatReserved, vatDeadlines, entityType, totalBalance }) {
  return (
    <div className="px-5 space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
        <p className="text-2xl font-black" style={{ color: '#1A2332', letterSpacing: '-0.5px' }}>Skatt &amp; Moms</p>
        <p className="text-sm mt-1" style={{ color: '#9AA5B4' }}>Vi har räknat ut din skatt åt dig</p>
      </motion.div>
      <LiquidityGauge totalBalance={totalBalance} vatReserved={vatReserved} grossIncome={totalBalance} entityType={entityType} />
      <VATShield vatReserved={vatReserved} vatDeadlines={vatDeadlines} />
      <NetSalaryCalculator entityType={entityType} />
      <TaxOptimizer />
    </div>
  );
}