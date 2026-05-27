import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

export default function DataResetSection() {
  const [step, setStep] = useState('idle');

  const handleReset = async () => {
    setStep('deleting');
    try {
      const txs = await base44.entities.Transaction.list('-created_date', 1000);
      for (const tx of txs) {
        await base44.entities.Transaction.delete(tx.id);
      }

      const deposits = await base44.entities.SavingsDeposit.list('-created_date', 500);
      for (const d of deposits) {
        await base44.entities.SavingsDeposit.delete(d.id);
      }

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

      localStorage.setItem('anchor_biz_reset', 'true');
      localStorage.removeItem('anchor_biz_manual_txs');
      window.dispatchEvent(new CustomEvent('anchor:biz_reset'));

      setStep('done');
    } catch {
      setStep('error');
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[14px] text-[#9AA5B4] leading-relaxed">
        Raderar alla transaktioner och inställningar kopplade till detta konto. Lämpligt vid ny räkenskapsperiod
        eller efter testkörning.
      </p>

      <AnimatePresence mode="wait">
        {step === 'idle' && (
          <motion.button
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setStep('confirm')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-semibold bg-red-500/10 text-red-600 border border-red-500/25"
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
            <div className="flex items-start gap-3 py-3 border-t border-red-500/20">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" />
              <div>
                <p className="text-[15px] font-medium text-red-600">Är du helt säker?</p>
                <p className="text-[13px] mt-0.5 text-[#6B7280]">
                  Alla transaktioner, kvitton och sparade data raderas permanent. Åtgärden kan inte ångras.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('idle')}
                className="flex-1 py-3 rounded-xl text-[15px] font-medium bg-[#F0F2F5] text-[#4A5568]"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl text-[15px] font-semibold text-white bg-red-600"
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
            <Loader2 className="w-4 h-4 animate-spin text-[#0D7377]" />
            <span className="text-[14px] font-medium text-[#4A5568]">Raderar data...</span>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 py-4 text-[#0D7377]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[15px] font-medium">All data har raderats</span>
          </motion.div>
        )}

        {step === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <p className="text-[13px] text-center text-red-600">Något gick fel. Försök igen.</p>
            <button
              type="button"
              onClick={() => setStep('idle')}
              className="w-full py-3 rounded-xl text-[15px] font-medium bg-[#F0F2F5] text-[#4A5568]"
            >
              Stäng
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
