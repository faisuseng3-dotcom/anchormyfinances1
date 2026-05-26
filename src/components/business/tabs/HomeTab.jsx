import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import TaxClarityHero from '@/components/business/TaxClarityHero';

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
  recentTransactions,
}) {
  const fileRef = useRef();
  const txList = recentTransactions !== undefined ? recentTransactions : DEFAULT_RECENT_TX;

  const handleCamera = () => {
    if (onScannerOpen) {
      onScannerOpen();
      return;
    }
    fileRef.current?.click();
  };

  return (
    <div className="px-5 space-y-4">
      <TaxClarityHero
        grossBalance={grossBalance}
        vatReserved={vatReserved}
        entityType={entityType}
        transactions={txList}
        isReset={isReset}
      />

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={handleCamera}
        className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-bold text-base"
        style={{ background: '#0D7377', color: '#fff', boxShadow: '0 4px 16px rgba(13,115,119,0.3)' }}
      >
        <Camera className="w-5 h-5" />
        Fota ett kvitto
      </motion.button>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div
          className="px-5 pt-4 pb-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid #F0F2F5' }}
        >
          <p className="text-sm font-bold" style={{ color: '#1A2332' }}>
            Senaste händelser
          </p>
        </div>
        <div className="divide-y" style={{ borderColor: '#F0F2F5' }}>
          {txList.length === 0 && (
            <div className="px-5 py-6 text-center text-sm" style={{ color: '#9AA5B4' }}>
              Inga transaktioner ännu. Börja med att scanna ett kvitto.
            </div>
          )}
          {txList.map((tx, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center"
                  style={{ background: tx.amount > 0 ? 'rgba(13,115,119,0.1)' : '#F4F6F8' }}
                >
                  {tx.amount > 0 ? (
                    <ArrowDownLeft className="w-4 h-4" style={{ color: '#0D7377' }} />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" style={{ color: '#9AA5B4' }} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1A2332' }}>
                    {tx.vendor || tx.label}
                  </p>
                  <p className="text-xs" style={{ color: '#9AA5B4' }}>
                    {tx.category} · {tx.date}
                  </p>
                </div>
              </div>
              <p
                className="text-sm font-bold"
                style={{ color: tx.amount > 0 ? '#0D7377' : '#1A2332' }}
              >
                {tx.amount > 0 ? '+' : ''}
                {tx.amount.toLocaleString('sv-SE')} kr
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
