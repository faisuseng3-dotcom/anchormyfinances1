import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { isGuestMode, loadGuestProfile } from '@/components/guestStorage';
import { Flame, Zap, AlertTriangle, ChevronDown } from 'lucide-react';
import {
  buildUpcomingExpenses,
  getUpcomingDates,
  calculateRunningBalance,
  getGuiltFreeAmount,
  getDangerEvents,
  getNextDangerEvent,
  getSafeToSpend,
  formatNumber,
} from '@/components/pulse/pulseEngine';
import PulseTimeline from '@/components/pulse/PulseTimeline';
import CountdownCard from '@/components/pulse/CountdownCard';
import GuiltFreeWindow from '@/components/pulse/GuiltFreeWindow';
import WhatIfSimulator from '@/components/pulse/WhatIfSimulator';
import DangerZoneList from '@/components/pulse/DangerZoneList';
import FutureTimeline from '@/components/pulse/FutureTimeline';

export default function Pulse() {
  const [whatIfAmount, setWhatIfAmount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

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
    const eventsWithBalance = calculateRunningBalance(events, currentBalance);
    return {
      eventsWithBalance,
      guiltFree: getGuiltFreeAmount(events, currentBalance, incomeDay),
      nextCritical: getNextDangerEvent(eventsWithBalance),
      dangerEvents: getDangerEvents(eventsWithBalance),
    };
  }, [profile, currentBalance, whatIfAmount]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-surface)', borderTopColor: 'var(--color-accent)' }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p style={{ color: 'var(--color-text-muted)' }}>Slutför onboardingen för att se din puls.</p>
      </div>
    );
  }

  const safeColor = safeToSpend > 0 ? 'var(--color-success)' : 'var(--color-danger)';
  const hasDanger = dangerEvents.length > 0;

  return (
    <div className="min-h-screen pb-28">
      {/* Hero Header */}
      <div className="px-5 pt-8 pb-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-medium mb-1 uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            Realtidspuls
          </p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-5xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              {formatNumber(safeToSpend)}
            </span>
            <span className="text-lg font-medium" style={{ color: 'var(--color-text-muted)' }}>kr</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>säkert att spendera just nu</p>

          {/* Status pill */}
          {hasDanger ? (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(217,95,95,0.15)', color: 'var(--color-danger)', border: '1px solid rgba(217,95,95,0.3)' }}>
              <AlertTriangle className="w-3.5 h-3.5" />
              {dangerEvents.length} kommande riskhändelse{dangerEvents.length > 1 ? 'r' : ''}
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(61,170,122,0.15)', color: 'var(--color-success)', border: '1px solid rgba(61,170,122,0.3)' }}>
              <Zap className="w-3.5 h-3.5" />
              Allt ser bra ut
            </div>
          )}
        </motion.div>
      </div>

      <div className="px-5 space-y-4">
        {/* Upcoming expenses card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5"
          style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Kommande
          </p>
          <FutureTimeline profile={profile} />
        </motion.div>

        {/* Guilt-free + Countdown side by side */}
        <div className="grid grid-cols-2 gap-4">
          <GuiltFreeWindow
            amount={guiltFree}
            nextCriticalName={nextCritical?.name}
            nextCriticalDays={nextCritical?.dayOffset}
          />
          <CountdownCard nextEvent={nextCritical} currentBalance={currentBalance} />
        </div>

        {/* Detailed timeline — hidden by default */}
        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <button
            onClick={() => setShowDetails(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              30-dagars kassaflöde
            </p>
            <ChevronDown
              className="w-4 h-4 transition-transform"
              style={{ color: 'var(--color-text-muted)', transform: showDetails ? 'rotate(180deg)' : 'none' }}
            />
          </button>
          {showDetails && (
            <div className="px-5 pb-5">
              <PulseTimeline events={eventsWithBalance} today={new Date()} whatIfAmount={whatIfAmount} />
            </div>
          )}
        </motion.div>

        {/* Danger zone */}
        {hasDanger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(217,95,95,0.08)', border: '1px solid rgba(217,95,95,0.25)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>Riskhändelser</p>
            </div>
            <DangerZoneList events={eventsWithBalance} />
          </motion.div>
        )}

        {/* What-If */}
        <WhatIfSimulator
          events={eventsWithBalance}
          currentBalance={currentBalance + whatIfAmount}
          onWhatIfChange={setWhatIfAmount}
        />
      </div>
    </div>
  );
}