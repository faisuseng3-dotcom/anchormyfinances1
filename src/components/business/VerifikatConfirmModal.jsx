// @ts-nocheck
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle } from 'lucide-react';

// Shows double-entry bookkeeping lines for user to confirm before saving
export default function VerifikatConfirmModal({ transactions, onConfirm, onCancel }) {
  if (!transactions?.length) return null;

  // Build verifikat lines for each transaction
  const buildLines = (tx) => {
    const gross = Math.abs(tx.grossAmount || tx.amount || 0);
    const vatAmt = tx.vatAmount || 0;
    const net = tx.netAmount || (gross - vatAmt);
    const isIncome = (tx.amount > 0) || tx.type === 'income';
    const vatAccount = tx.vatRate === 25 ? '2641' : tx.vatRate === 12 ? '2640' : tx.vatRate === 6 ? '2645' : null;

    if (isIncome) {
      return [
        { account: '1930', label: 'Företagskonto', debit: gross, credit: null },
        { account: tx.accountCode || '3000', label: tx.accountName || 'Försäljning', debit: null, credit: net },
        ...(vatAmt > 0 && vatAccount ? [{ account: '2610', label: 'Utgående moms', debit: null, credit: vatAmt }] : []),
      ];
    }
    return [
      { account: tx.accountCode || '6990', label: tx.accountName || 'Diverse', debit: net, credit: null },
      ...(vatAmt > 0 && vatAccount ? [{ account: vatAccount, label: `Ingående moms ${tx.vatRate}%`, debit: vatAmt, credit: null }] : []),
      { account: '1930', label: 'Företagskonto', debit: null, credit: gross },
    ];
  };

  const totalNeedsReview = transactions.filter(t => t.needs_review).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-md rounded-t-3xl overflow-hidden"
          style={{ background: '#fff', maxHeight: '85vh' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid #F0F2F5' }}>
            <div>
              <p className="text-base font-black" style={{ color: '#1A2332' }}>Bekräfta bokföring</p>
              <p className="text-xs mt-0.5" style={{ color: '#9AA5B4' }}>
                {transactions.length} verifikat · Granska debet/kredit
              </p>
            </div>
            <button onClick={onCancel}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: '#F0F2F5' }}>
              <X className="w-4 h-4" style={{ color: '#4A5568' }} />
            </button>
          </div>

          {/* needs_review warning */}
          {totalNeedsReview > 0 && (
            <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(220,38,38,0.07)', boxShadow: 'var(--anchor-shadow-1)' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#dc2626' }} />
              <p className="text-xs font-semibold" style={{ color: '#dc2626' }}>
                {totalNeedsReview} rad{totalNeedsReview > 1 ? 'er' : ''} med låg säkerhet — kontrollera kontona
              </p>
            </div>
          )}

          {/* Verifikat list */}
          <div className="overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: '50vh' }}>
            {transactions.map((tx, i) => {
              const lines = buildLines(tx);
              const debSum = lines.reduce((s, l) => s + (l.debit || 0), 0);
              const credSum = lines.reduce((s, l) => s + (l.credit || 0), 0);
              const balanced = Math.abs(debSum - credSum) < 0.02;

              return (
                <div key={i} className="rounded-2xl overflow-hidden"
                  style={{
                    border: tx.needs_review ? '1.5px solid rgba(220,38,38,0.3)' : '1.5px solid #F0F2F5',
                    background: tx.needs_review ? 'rgba(220,38,38,0.02)' : '#F8FAFB',
                  }}>
                  {/* Tx header */}
                  <div className="px-4 py-3 flex items-center justify-between"
                    style={{ borderBottom: '1px solid #F0F2F5' }}>
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#1A2332' }}>
                        {tx.vendor || tx.description}
                      </p>
                      <p className="text-xs" style={{ color: '#9AA5B4' }}>
                        {tx.date} · {tx.vatRate}% moms
                        {tx.needs_review && <span className="ml-2 text-red-500 font-bold inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" aria-hidden /> Granska</span>}
                      </p>
                    </div>
                    <p className="text-sm font-black"
                      style={{ color: (tx.amount ?? tx.grossAmount) > 0 ? '#0D7377' : '#E53E3E' }}>
                      {Math.abs(tx.grossAmount || tx.amount || 0).toLocaleString('sv-SE')} kr
                    </p>
                  </div>

                  {/* Double-entry lines */}
                  <div className="px-4 py-2">
                    <div className="grid grid-cols-12 mb-1">
                      <p className="col-span-5 text-[10px] font-bold uppercase" style={{ color: '#9AA5B4' }}>Konto</p>
                      <p className="col-span-3 text-[10px] font-bold uppercase text-right" style={{ color: '#9AA5B4' }}>Debet</p>
                      <p className="col-span-4 text-[10px] font-bold uppercase text-right" style={{ color: '#9AA5B4' }}>Kredit</p>
                    </div>
                    {lines.map((l, j) => (
                      <div key={j} className="grid grid-cols-12 py-0.5">
                        <div className="col-span-5">
                          <span className="text-xs font-bold" style={{ color: '#0D7377' }}>{l.account}</span>
                          <span className="text-xs ml-1.5" style={{ color: '#4A5568' }}>{l.label}</span>
                        </div>
                        <p className="col-span-3 text-xs font-semibold text-right" style={{ color: l.debit ? '#1A2332' : '#C0C8D2' }}>
                          {l.debit ? l.debit.toFixed(2) : '—'}
                        </p>
                        <p className="col-span-4 text-xs font-semibold text-right" style={{ color: l.credit ? '#1A2332' : '#C0C8D2' }}>
                          {l.credit ? l.credit.toFixed(2) : '—'}
                        </p>
                      </div>
                    ))}
                    <div className="mt-1.5 pt-1.5 flex items-center gap-2" style={{ borderTop: '1px solid #F0F2F5' }}>
                      <span className="text-[10px] font-bold inline-flex items-center gap-1" style={{ color: balanced ? '#0D7377' : '#E53E3E' }}>
                        {balanced
                          ? <><Check className="w-3 h-3" aria-hidden /> Balanserar</>
                          : <><AlertTriangle className="w-3 h-3" aria-hidden /> Obalanserad</>}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="px-5 pt-3 pb-6 flex gap-3" style={{ borderTop: '1px solid #F0F2F5' }}>
            <button onClick={onCancel}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm"
              style={{ background: '#F0F2F5', color: '#4A5568' }}>
              Avbryt
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onConfirm}
              className="flex-2 flex-grow-[2] py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #0D7377, #0a5f63)', color: '#fff' }}>
              <Check className="w-4 h-4" />
              Bekräfta & bokför
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}