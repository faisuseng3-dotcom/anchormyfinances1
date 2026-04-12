import React from 'react';
import { motion } from 'framer-motion';
import RunwayEngine from '@/components/business/RunwayEngine';
import InvoiceList from '@/components/business/InvoiceList';
import DeductibleTransactions from '@/components/business/DeductibleTransactions';

export default function RapporterTab({ runwayMonths, runwayData, monthlyBurn, invoices, transactions }) {
  return (
    <div className="px-5 space-y-4">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-2xl font-black pt-4" style={{ color: '#1A2332', letterSpacing: '-0.5px' }}>
        Rapporter
      </motion.p>
      <p className="text-sm -mt-2" style={{ color: '#9AA5B4' }}>Kassaflöde, runway och fakturor</p>
      <RunwayEngine runwayMonths={runwayMonths} runwayData={runwayData} monthlyBurn={monthlyBurn} />
      <InvoiceList invoices={invoices} />
      <DeductibleTransactions transactions={transactions} />
    </div>
  );
}