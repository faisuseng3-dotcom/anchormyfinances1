import React, { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { isGuestMode, loadGuestProfile } from '@/components/guestStorage';
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

export default function Pulse() {
  useEffect(() => {
    base44.functions.invoke('awardPoints', { event_type: 'pulse_open' }).catch(() => {});
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      if (isGuestMode()) return loadGuestProfile() || null;
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    },
  });

  const incomeDay = 25;

  const currentBalance = useMemo(() => {
    if (!profile) return 0;
    return profile.buffer || 0;
  }, [profile]);

  const safeToSpend = useMemo(() => getSafeToSpend(profile, currentBalance), [profile, currentBalance]);

  const { eventsWithBalance, nextCritical, dangerEvents } = useMemo(() => {
    if (!profile) return { eventsWithBalance: [], nextCritical: null, dangerEvents: [] };
    const expenses = buildUpcomingExpenses(profile);
    const events = getUpcomingDates(expenses, currentBalance, incomeDay, profile.income || 0);
    const eventsWB = calculateRunningBalance(events, currentBalance);
    return {
      eventsWithBalance: eventsWB,
      nextCritical: getNextDangerEvent(eventsWB),
      dangerEvents: getDangerEvents(eventsWB),
    };
  }, [profile, currentBalance]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: '#050a15' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(15,222,189,0.2)', borderTopColor: '#0FDEBD' }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center"
        style={{ background: '#050a15' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)' }}>Slutför onboardingen för att se din puls.</p>
      </div>
    );
  }

  const hasDanger = dangerEvents.length > 0;

  return (
    <div className="min-h-screen pb-28"
      style={{ background: 'linear-gradient(180deg, #050a15 0%, #080d1c 100%)' }}>

      {/* Header */}
      <div className="px-5 pt-10 pb-2">
        <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.18)' }}>
          🛑  PULSEN — LÄGET JUST NU
        </p>
      </div>

      <div className="px-4 space-y-3">

        {/* 1. Traffic light */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <TrafficLight
            safeToSpend={safeToSpend}
            hasDanger={hasDanger}
            nextCritical={nextCritical}
          />
        </motion.div>

        {/* 2. Payday countdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <PaydayCountdown incomeDay={incomeDay} />
        </motion.div>

        {/* 3. Purchase check */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <PurchaseCheck
            safeToSpend={safeToSpend}
            nextCritical={nextCritical}
            currentBalance={currentBalance}
          />
        </motion.div>

      </div>
    </div>
  );
}