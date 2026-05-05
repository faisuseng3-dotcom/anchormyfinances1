import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

export default function DataResetSection() {
  const [step, setStep] = useState('idle'); // idle | confirm | deleting | done

  const handleReset = async () => {
    setStep('deleting');
    try {
      // Delete all transactions (user-scoped — only deletes current user's records)
      const txs = await base44.entities.Transaction.list('-created_date', 1000);
      for (const tx of txs) {
        await base44.entities.Transaction.delete(tx.id);
      }

      // Delete savings deposits
      const deposits = await base44.entities.SavingsDeposit.list('-created_date', 500);
      for (const d of deposits) {
        await base44.entities.SavingsDeposit.delete(d.id);
      }

      // Reset financial profile (keep it, just clear business data fields)
      const profiles = await base44.entities.FinancialProfile.list();
      if (profiles[0]) {
        await base44.entities.FinancialProfile.update(profiles[0].id, {
          monthlyExpenses: [],
          subscriptions: [],
          loans: [],
          plannedPurchases: [],
          priceWatches: [],
          budgetLimits: {},
          savingsCurrentBalance: 0,
        });
      }

      // Clear the simulated/demo data flag so BusinessDashboard shows empty state
      localStorage.setItem('anchor_biz_reset', 'true');
      localStorage.removeItem('anchor_biz_manual_txs');

      setStep('done');
    } catch {
      setStep('error');
    }
  };

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* Section header */}
      <div className="px-5 pt-5 pb-3 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9AA5B4' }}>Datahantering</p>
        <p className="text-sm font-bold mt-1" style={{ color: '#1A2332' }}>Rensa & börja om</p>
        <p className="text-xs mt-1" style={{ color: '#9AA5B4' }}>
          Raderar alla transaktioner och inställningar kopplade till detta konto.
          Lämpligt vid ny räkenskapsperiod eller efter testkörning.
        </p>
      </div>

      <div className="px-5 py-4">
        <AnimatePresence mode="wait">
          {step === 'idle' && (
            <motion.button
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep('confirm')}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold"
              style={{
                background: 'rgba(220,38,38,0.07)',
                border: '1px solid rgba(220,38,38,0.25)',
                color: '#dc2626',
              }}
            >
              <Trash2 className="w-4 h-4" />
              Radera all data &amp; börja om
            </motion.button>
          )}

          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-start gap-3 p-3 rounded-2xl" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }}>
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#dc2626' }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: '#dc2626' }}>Är du helt säker?</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                    Alla transaktioner, kvitton och sparade data raderas permanent. Åtgärden kan <strong>inte</strong> ångras.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('idle')}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: 'rgba(0,0,0,0.05)', color: '#4A5568' }}
                >
                  Avbryt
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white"
                  style={{ background: '#dc2626' }}
                >
                  Ja, radera allt
                </button>
              </div>
            </motion.div>
          )}

          {step === 'deleting' && (
            <motion.div
              key="deleting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 py-4"
            >
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#0D7377' }} />
              <span className="text-sm font-semibold" style={{ color: '#4A5568' }}>Raderar data...</span>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl"
              style={{ background: 'rgba(13,115,119,0.08)', border: '1px solid rgba(13,115,119,0.2)' }}
            >
              <CheckCircle2 className="w-4 h-4" style={{ color: '#0D7377' }} />
              <span className="text-sm font-bold" style={{ color: '#0D7377' }}>All data har raderats</span>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <p className="text-xs text-center" style={{ color: '#dc2626' }}>Något gick fel. Försök igen.</p>
              <button
                onClick={() => setStep('idle')}
                className="w-full py-3 rounded-2xl text-sm font-semibold"
                style={{ background: 'rgba(0,0,0,0.05)', color: '#4A5568' }}
              >
                Stäng
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}