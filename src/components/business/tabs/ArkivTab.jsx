import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReceiptVault from '@/components/business/ReceiptVault';
import ActivityStream from '@/components/business/ActivityStream';
import SmartPasteImport from '@/components/business/SmartPasteImport';
import { BusinessListRow, BusinessSection } from '@/components/business/BusinessChrome';

export default function ArkivTab({ transactions, onBooked }) {
  return (
    <div className="space-y-8 pb-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pt-4">
        <h1 className="text-[22px] font-semibold text-[#1A2332] tracking-tight">Arkiv</h1>
        <p className="text-[14px] text-[#9AA5B4] mt-0.5">Kvitton, verifikat och huvudbok</p>
      </motion.div>

      <BusinessSection>
        <SmartPasteImport onBooked={onBooked} />
      </BusinessSection>

      <BusinessSection title="Kvitton">
        <ReceiptVault transactions={transactions} />
      </BusinessSection>

      <BusinessSection title="Aktivitet">
        <ActivityStream />
      </BusinessSection>

      <BusinessSection>
        <BusinessListRow
          href="/TransactionHistory?tab=ledger"
          leading={
            <div className="w-9 h-9 rounded-full bg-[#0D7377]/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#0D7377]" />
            </div>
          }
          title="Din huvudbok"
          subtitle="Alla verifikat och poster"
        />
      </BusinessSection>
    </div>
  );
}
