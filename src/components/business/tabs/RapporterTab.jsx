import React from 'react';
import { motion } from 'framer-motion';
import RunwayEngine from '@/components/business/RunwayEngine';
import InvoiceList from '@/components/business/InvoiceList';
import DeductibleTransactions from '@/components/business/DeductibleTransactions';
import WarningBanner from '@/components/business/WarningBanner';

export default function RapporterTab({ runwayMonths, runwayData, monthlyBurn, invoices, transactions, isReset, unprocessedCount, onReviewUnprocessed }) {
  const safeInvoices = isReset ? [] : (invoices || []);
  const safeTransactions = isReset ? [] : (transactions || []);
  const safeRunwayMonths = isReset ? 0 : runwayMonths;
  const safeRunwayData = isReset ? [] : runwayData;
  const safeBurn = isReset ? 0 : monthlyBurn;

  return (
    <div className="space-y-4">
      <WarningBanner count={isReset ? 0 : (unprocessedCount || 0)} onReview={onReviewUnprocessed} />
      <div className="px-5">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-2xl font-black pt-4" style={{ color: '#1A2332', letterSpacing: '-0.5px' }}>
        Rapporter
      </motion.p>
      <p className="text-sm -mt-2" style={{ color: '#9AA5B4' }}>Kassaflöde, runway och fakturor</p>
      <RunwayEngine runwayMonths={safeRunwayMonths} runwayData={safeRunwayData} monthlyBurn={safeBurn} isReset={isReset} />
      <InvoiceList invoices={safeInvoices} />
      {safeTransactions.length > 0 && <DeductibleTransactions transactions={safeTransactions} />}
      {isReset && safeTransactions.length === 0 && (
        <div className="rounded-3xl p-8 text-center" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p className="text-3xl mb-3">📊</p>
          <p className="text-sm font-bold" style={{ color: '#4A5568' }}>Inga transaktioner att rapportera</p>
          <p className="text-xs mt-1" style={{ color: '#9AA5B4' }}>Bokför transaktioner via Arkiv för att se rapporter här.</p>
        </div>
      )}
      </div>
    </div>
  );
}