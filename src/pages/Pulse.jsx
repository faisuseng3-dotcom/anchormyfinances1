import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { isGuestMode, loadGuestProfile } from '@/components/guestStorage';
import { AlertTriangle } from 'lucide-react';
import {
  buildUpcomingExpenses,
  getUpcomingDates,
  calculateRunningBalance,
  getGuiltFreeAmount,
  getDangerEvents,
  getNextDangerEvent,
  getSafeToSpend,
} from '@/components/pulse/pulseEngine';
import LiquidityCell from '@/components/pulse/LiquidityCell';
import HorizonScroll from '@/components/pulse/HorizonScroll';
import WhatIfSimulator from '@/components/pulse/WhatIfSimulator';
import CountdownCard from '@/components/pulse/CountdownCard';
import DangerZoneList from '@/components/pulse/DangerZoneList';

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

      {/* Hero cockpit header */}
      <div className="relative z-10 px-5 pt-10 pb-4">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[9px] font-black tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
            REALTIDSPULS — COCKPIT
          </p>

          {/* Hero row: big number + LiquidityCell side by side */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <motion.p
                key={safeToSpend}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-black leading-none"
                style={{ color: '#fff', fontSize: 44, letterSpacing: '-0.03em' }}
              >
                {fmt(safeToSpend)}
              </motion.p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                kr säkert att spendera
              </p>

              {/* Verdict pill */}
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black"
                style={hasDanger
                  ? { background: 'rgba(255,68,102,0.12)', color: '#FF4466', border: '1px solid rgba(255,68,102,0.3)' }
                  : { background: 'rgba(15,222,189,0.1)', color: '#0FDEBD', border: '1px solid rgba(15,222,189,0.25)' }}
              >
                {hasDanger
                  ? <><AlertTriangle className="w-3 h-3" /> {dangerEvents.length} riskhändelse{dangerEvents.length > 1 ? 'r' : ''}</>
                  : <><span>⚡</span> Du är i kontroll</>
                }
              </motion.div>

              {/* AI human verdict */}
              <p className="text-xs mt-2 max-w-[220px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {safeToSpend <= 0
                  ? 'Prioritera buffert och undvik icke-nödvändiga köp.'
                  : nextCritical
                    ? `Marginalen är smal – ${fmt(guiltFree)} kr kvar innan ${nextCritical.name} om ${nextCritical.dayOffset} dagar.`
                    : `Inga hinder på horisonten. ${fmt(guiltFree)} kr guilt-free.`}
              </p>
            </div>

            {/* Battery gauge */}
            <LiquidityCell safeToSpend={safeToSpend} />
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 px-4 space-y-3">

        {/* Horizon scroll timeline */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <HorizonScroll eventsWithBalance={eventsWithBalance} whatIfAmount={whatIfAmount} />
        </motion.div>

        {/* Countdown + Danger side by side */}
        {nextCritical && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <CountdownCard nextEvent={nextCritical} currentBalance={currentBalance} />
          </motion.div>
        )}

        {/* Danger zone list */}
        {hasDanger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl p-4"
            style={{ background: 'rgba(255,68,102,0.07)', border: '1px solid rgba(255,68,102,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <AlertTriangle className="w-4 h-4" style={{ color: '#FF4466' }} />
              </motion.div>
              <p className="text-xs font-black tracking-widest" style={{ color: '#FF4466' }}>RISKHÄNDELSER</p>
            </div>
            <DangerZoneList events={eventsWithBalance} />
          </motion.div>
        )}

        {/* What-If holographic projector */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <WhatIfSimulator
            events={eventsWithBalance}
            currentBalance={currentBalance + whatIfAmount}
            onWhatIfChange={setWhatIfAmount}
          />
        </motion.div>
      </div>
    </div>
  );
}