import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useOptimisticTransactions } from '@/hooks/useOptimisticTransactions';
import { getSubscriptionsDueToday, subscriptionToTransaction, currentPeriodKey } from '@/lib/subscriptionBilling';
import { triggerHaptic } from '@/lib/haptics';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/**
 * Prenumerationer syns bara i prognosen, aldrig i faktisk historik, om ingen
 * kopplar dem till en riktig transaktion. Detta stänger den luckan med ett
 * tryck på förfallodagen — annars räknas beloppet dubbelt fel: en gång som
 * plan, aldrig som verklighet.
 */
export default function SubscriptionDueToday({ profile }) {
  const { updateProfile } = useFinancialProfile();
  const { createTransaction } = useOptimisticTransactions();
  const [handledIndexes, setHandledIndexes] = useState(() => new Set());

  const due = useMemo(() => getSubscriptionsDueToday(profile), [profile]);
  const visible = due.filter(({ index }) => !handledIndexes.has(index));

  const markHandled = async (index) => {
    setHandledIndexes((prev) => new Set([...prev, index]));
    const nextSubs = (profile.subscriptions || []).map((s, i) =>
      i === index ? { ...s, lastLoggedPeriod: currentPeriodKey() } : s,
    );
    await updateProfile({ subscriptions: nextSubs });
  };

  const logPayment = async ({ sub, index }) => {
    triggerHaptic('success');
    await createTransaction(subscriptionToTransaction(sub));
    await markHandled(index);
    toast.success(`${sub.name} loggad — ${fmt(sub.amount)} kr`);
  };

  const skip = ({ index }) => {
    triggerHaptic('light');
    markHandled(index);
  };

  if (!visible.length) return null;

  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{ background: '#FFFFFF', border: '1px solid var(--color-border)' }}
    >
      <div className="px-4 pt-4 pb-2">
        <h2 className="anchor-card-title">Förfaller idag</h2>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        <AnimatePresence initial={false}>
          {visible.map((item) => (
            <motion.div
              key={item.index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-[var(--color-text-primary)] font-medium truncate">{item.sub.name}</p>
                <p className="text-[12px] text-[var(--color-text-secondary)]">{fmt(item.sub.amount)} kr</p>
              </div>
              <button
                type="button"
                onClick={() => skip(item)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] shrink-0"
                aria-label="Redan loggad — hoppa över"
              >
                <X size={15} />
              </button>
              <button
                type="button"
                onClick={() => logPayment(item)}
                className="h-9 px-3.5 rounded-full flex items-center gap-1.5 text-[13px] font-semibold text-white shrink-0"
                style={{ background: 'var(--color-success)' }}
              >
                <Check size={14} /> Logga
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
