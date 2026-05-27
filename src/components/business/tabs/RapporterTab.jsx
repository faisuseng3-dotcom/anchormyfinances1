import React from 'react';
import { motion } from 'framer-motion';
import RunwayEngine from '@/components/business/RunwayEngine';
import InvoiceList from '@/components/business/InvoiceList';
import DeductibleTransactions from '@/components/business/DeductibleTransactions';
import WarningBanner from '@/components/business/WarningBanner';
import FinancialReports from '@/components/business/FinancialReports';
import { BusinessSection } from '@/components/business/BusinessChrome';

export default function RapporterTab({
  runwayMonths,
  runwayData,
  monthlyBurn,
  invoices,
  transactions,
  isReset,
  unprocessedCount,
  onReviewUnprocessed,
}) {
  const safeInvoices = isReset ? [] : invoices || [];
  const safeTransactions = isReset ? [] : transactions || [];
  const safeRunwayMonths = isReset ? 0 : runwayMonths;
  const safeRunwayData = isReset ? [] : runwayData;
  const safeBurn = isReset ? 0 : monthlyBurn;

  return (
    <div className="space-y-6 pb-4">
      <WarningBanner count={isReset ? 0 : unprocessedCount || 0} onReview={onReviewUnprocessed} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pt-2">
        <h1 className="text-[22px] font-semibold text-[#1A2332] tracking-tight">Rapporter</h1>
        <p className="text-[14px] text-[#9AA5B4] mt-0.5">Kassaflöde, runway och fakturor</p>
      </motion.div>

      <BusinessSection title="Kassaflöde">
        <RunwayEngine
          runwayMonths={safeRunwayMonths}
          runwayData={safeRunwayData}
          monthlyBurn={safeBurn}
          isReset={isReset}
          cashflowHistory={safeRunwayData}
          totalLiquidity={safeRunwayData.length > 0 ? safeRunwayData[safeRunwayData.length - 1]?.balance : 0}
        />
      </BusinessSection>

      <BusinessSection title="Fakturor">
        <InvoiceList invoices={safeInvoices} />
      </BusinessSection>

      {safeTransactions.length > 0 && (
        <BusinessSection title="Avdrag">
          <DeductibleTransactions transactions={safeTransactions} />
        </BusinessSection>
      )}

      <BusinessSection title="Bokslut">
        <FinancialReports transactions={safeTransactions} isReset={isReset} />
      </BusinessSection>

      {isReset && safeTransactions.length === 0 && (
        <BusinessSection>
          <p className="text-[14px] text-[#9AA5B4] py-6 text-center">
            Bokför transaktioner via Arkiv för att se rapporter här.
          </p>
        </BusinessSection>
      )}
    </div>
  );
}
