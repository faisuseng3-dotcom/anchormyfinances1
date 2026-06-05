// @ts-nocheck
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react';
import TaxClarityHero from '@/components/business/TaxClarityHero';
import { BusinessDivider, BusinessListRow, BusinessSection } from '@/components/business/BusinessChrome';

const VISIBLE_TX = 5;

const DEFAULT_RECENT_TX = [
  { vendor: 'Adobe Creative Cloud', amount: -599, date: 'Idag', category: 'Programvara' },
  { vendor: 'Kund: Eriksson AB', amount: 18500, date: 'Igår', category: 'Inkomst' },
  { vendor: 'SJ AB', amount: -1240, date: '10 apr', category: 'Resor' },
];

export default function HomeTab({
  grossBalance,
  vatReserved,
  entityType,
  isReset,
  onScannerOpen,
  onViewAll,
  recentTransactions,
}) {
  const fileRef = useRef();
  const txList = recentTransactions !== undefined ? recentTransactions : DEFAULT_RECENT_TX;
  const visibleTx = txList.slice(0, VISIBLE_TX);
  const hiddenTxCount = Math.max(0, txList.length - visibleTx.length);

  const handleCamera = () => {
    if (onScannerOpen) {
      onScannerOpen();
      return;
    }
    fileRef.current?.click();
  };

  return (
    <div className="space-y-8 pb-4">
      <TaxClarityHero
        grossBalance={grossBalance}
        vatReserved={vatReserved}
        entityType={entityType}
        transactions={txList}
        isReset={isReset}
      />

      <div className="px-5">
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handleCamera}
          className="w-full h-[52px] rounded-xl flex items-center justify-center gap-3 font-semibold text-[15px] text-white bg-[#0D7377] shadow-[0_8px_24px_rgba(13,115,119,0.25)] active:opacity-90"
        >
          <Camera className="w-5 h-5" />
          Fota ett kvitto
        </motion.button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" />
      </div>

      <BusinessSection title="Senaste händelser">
        {txList.length === 0 && (
          <p className="text-[14px] text-[#9AA5B4] py-4">Inga transaktioner ännu. Scanna ett kvitto för att börja.</p>
        )}
        {visibleTx.map((tx, i) => (
          <React.Fragment key={i}>
            {i > 0 && <BusinessDivider />}
            <BusinessListRow
              leading={
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: tx.amount > 0 ? 'rgba(13,115,119,0.12)' : '#F0F2F5' }}
                >
                  {tx.amount > 0 ? (
                    <ArrowDownLeft className="w-4 h-4 text-[#0D7377]" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-[#9AA5B4]" />
                  )}
                </div>
              }
              title={tx.vendor || tx.label}
              subtitle={`${tx.category} · ${tx.date}`}
              trailing={
                <span className={tx.amount > 0 ? 'text-[#0D7377]' : 'text-[#1A2332]'}>
                  {tx.amount > 0 ? '+' : ''}
                  {tx.amount.toLocaleString('sv-SE')} kr
                </span>
              }
              trailingClassName={`text-[15px] font-semibold tabular-nums ${tx.amount > 0 ? 'text-[#0D7377]' : 'text-[#1A2332]'}`}
            />
          </React.Fragment>
        ))}
        {hiddenTxCount > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="mt-3 w-full flex items-center justify-center gap-1 py-2.5 text-[14px] font-medium text-[#0D7377] hover:text-[#0a5c5f] border-t border-[#E8ECF0]"
          >
            Visa alla {txList.length} händelser
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </BusinessSection>
    </div>
  );
}
