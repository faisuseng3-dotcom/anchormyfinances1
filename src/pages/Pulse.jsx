import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { isGuestMode, loadGuestProfile } from '@/components/guestStorage';
import {
  buildUpcomingExpenses,
  getUpcomingDates,
  calculateRunningBalance,
  getGuiltFreeAmount,
  getDangerEvents,
  getNextDangerEvent,
  getSafeToSpend,
} from '@/components/pulse/pulseEngine';
import MarginGauge from '@/components/pulse/MarginGauge';
import HorizonPath from '@/components/pulse/HorizonPath';
import ImpactSlider from '@/components/pulse/ImpactSlider';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function Pulse() {
  const [whatIfAmount, setWhatIfAmount] = useState(0);

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

  const currentBalance = useMemo(() => {
    if (!profile) return 0;
    return Math.max(0, (profile.buffer || 0) - whatIfAmount);
  }, [profile, whatIfAmount]);

  const incomeDay = 25;
  const safeToSpend = useMemo(() => getSafeToSpend(profile, currentBalance), [profile, currentBalance]);

  const { eventsWithBalance, guiltFree, nextCritical, dangerEvents } = useMemo(() => {
    if (!profile) return { eventsWithBalance: [], guiltFree: 0, nextCritical: null, dangerEvents: [] };
    const expenses = buildUpcomingExpenses(profile);
    const events = getUpcomingDates(expenses, currentBalance + whatIfAmount, incomeDay, profile.income || 0);
    const eventsWB = calculateRunningBalance(events, currentBalance);
    return {
      eventsWithBalance: eventsWB,
      guiltFree: getGuiltFreeAmount(events, currentBalance, incomeDay),
      nextCritical: getNextDangerEvent(eventsWB),
      dangerEvents: getDangerEvents(eventsWB),
    };
  }, [profile, currentBalance, whatIfAmount]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #050a15 0%, #090e1e 55%, #07101c 100%)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(15,222,189,0.2)', borderTopColor: '#0FDEBD' }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center"
        style={{ background: 'linear-gradient(160deg, #050a15 0%, #090e1e 55%, #07101c 100%)' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)' }}>Slutför onboardingen för att se din puls.</p>
      </div>
    );
  }

  const hasDanger = dangerEvents.length > 0;
  const safeColor = safeToSpend > 0 ? '#0FDEBD' : '#FF4466';

  return (
    <div className="min-h-screen pb-28 relative"
      style={{ background: 'linear-gradient(160deg, #050a15 0%, #090e1e 55%, #07101c 100%)' }}>

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {[...Array(24)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{
              width: i % 5 === 0 ? 2 : 1, height: i % 5 === 0 ? 2 : 1,
              top: `${(i * 43 + 7) % 100}%`, left: `${(i * 59 + 11) % 100}%`,
              background: '#fff', opacity: 0.1 + (i % 4) * 0.06,
            }}
            animate={{ opacity: [0.07, 0.3, 0.07] }}
            transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: (i * 0.28) % 4 }}
          />
        ))}
      </div>

      <div className="relative z-10 px-4 pt-10 space-y-3">

        {/* 1. Margin Gauge — speedometer + status */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <MarginGauge safeToSpend={safeToSpend} nextCritical={nextCritical} />
        </motion.div>

        {/* 2. Horizon Path — the road with pits and portal */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <HorizonPath eventsWithBalance={eventsWithBalance} whatIfAmount={whatIfAmount} />
        </motion.div>

        {/* 3. Impact Slider — what-if with real-time path update */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <ImpactSlider
            events={eventsWithBalance}
            currentBalance={currentBalance + whatIfAmount}
            onWhatIfChange={setWhatIfAmount}
          />
        </motion.div>

      </div>
    </div>
  );
}