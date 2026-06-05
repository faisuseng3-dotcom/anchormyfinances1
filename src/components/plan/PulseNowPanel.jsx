import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import {
  buildUpcomingExpenses,
  getUpcomingDates,
  calculateRunningBalance,
  getDangerEvents,
  getNextDangerEvent,
  getSafeToSpend,
} from '@/components/pulse/pulseEngine';
import TrafficLight from '@/components/pulse/TrafficLight';
import PaydayCountdown from '@/components/pulse/PaydayCountdown';
import PurchaseCheck from '@/components/pulse/PurchaseCheck';

/** Tidigare Pulse-sidan — inbäddad i Planera. */
export default function PulseNowPanel() {
  const { profile, isLoading } = useFinancialProfile();
  const incomeDay = 25;

  const currentBalance = useMemo(() => profile?.buffer || 0, [profile]);
  const safeToSpend = useMemo(
    () => getSafeToSpend(profile, currentBalance),
    [profile, currentBalance],
  );

  const { nextCritical, dangerEvents } = useMemo(() => {
    if (!profile) return { nextCritical: null, dangerEvents: [] };
    const expenses = buildUpcomingExpenses(profile);
    const events = getUpcomingDates(expenses, currentBalance, incomeDay, profile.income || 0);
    const eventsWB = calculateRunningBalance(events, currentBalance);
    return {
      nextCritical: getNextDangerEvent(eventsWB),
      dangerEvents: getDangerEvents(eventsWB),
    };
  }, [profile, currentBalance]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(15,222,189,0.2)', borderTopColor: '#0FDEBD' }}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="text-center text-[15px] text-white/45 py-12 px-4">
        Slutför onboardingen för att se ditt läge.
      </p>
    );
  }

  const hasDanger = dangerEvents.length > 0;

  return (
    <div className="space-y-3 -mx-1">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <TrafficLight
          safeToSpend={safeToSpend}
          hasDanger={hasDanger}
          nextCritical={nextCritical}
        />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <PaydayCountdown incomeDay={incomeDay} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <PurchaseCheck
          safeToSpend={safeToSpend}
          nextCritical={nextCritical}
          currentBalance={currentBalance}
        />
      </motion.div>
    </div>
  );
}
