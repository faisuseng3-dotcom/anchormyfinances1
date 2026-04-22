import React from 'react';
import { motion } from 'framer-motion';
import RunwayEngine from '@/components/business/RunwayEngine';
import InvoiceList from '@/components/business/InvoiceList';
import DeductibleTransactions from '@/components/business/DeductibleTransactions';

export default function RapporterTab({ runwayMonths, runwayData, monthlyBurn, invoices, transactions }) {
  return (
    <div className="px-5 space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
        <p className="text-2xl font-black" style={{ color: '#1A2332', letterSpacing: '-0.5px' }}>Rapporter</p>
        <p className="text-sm mt-1" style={{ color: '#9AA5B4' }}>Kassaflöde, runway och fakturor</p>
      </motion.div>
      <RunwayEngine runwayMonths={runwayMonths} runwayData={runwayData} monthlyBurn={monthlyBurn} />
      <InvoiceList invoices={invoices} />
      <DeductibleTransactions transactions={transactions} />
    </div>
  );
}