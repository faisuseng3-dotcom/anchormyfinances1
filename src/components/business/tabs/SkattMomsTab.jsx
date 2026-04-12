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
        className="text-2xl font-black pt-2" style={{ color: '#1A2332' }}>
        Skatt & Moms
      </motion.p>
      <LiquidityGauge totalBalance={totalBalance} vatReserved={vatReserved} grossIncome={totalBalance} entityType={entityType} />
      <VATShield vatReserved={vatReserved} vatDeadlines={vatDeadlines} />
      <NetSalaryCalculator entityType={entityType} />
      <TaxOptimizer />
    </div>
  );
}