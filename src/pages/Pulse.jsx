import React, { useState, useMemo } from 'react';
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
  formatNumber,
} from '@/components/pulse/pulseEngine';

import PulseTimeline from '@/components/pulse/PulseTimeline';
import CountdownCard from '@/components/pulse/CountdownCard';
import GuiltFreeWindow from '@/components/pulse/GuiltFreeWindow';
import WhatIfSimulator from '@/components/pulse/WhatIfSimulator';
import PulseStatusBar from '@/components/pulse/PulseStatusBar';
import DangerZoneList from '@/components/pulse/DangerZoneList';

export default function Pulse() {
  const [whatIfAmount, setWhatIfAmount] = useState(0);

  // Fetch profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      if (isGuestMode()) return loadGuestProfile() || null;
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    },
  });

  // Current balance: use buffer + any savingsCurrentBalance as rough saldo estimate
  // (In a real app this would come from a live bank feed)
  const currentBalance = useMemo(() => {
    if (!profile) return 0;
    // Use buffer as current checking account proxy; adjust with what-if
    return Math.max(0, (profile.buffer || 0) - whatIfAmount);
  }, [profile, whatIfAmount]);

  const incomeDay = 25;

  const safeToSpend = useMemo(() => getSafeToSpend(profile, currentBalance), [profile, currentBalance]);

  const { expenses, events, eventsWithBalance, guiltFree, nextCritical, dangerEvents } = useMemo(() => {
    if (!profile) return { expenses: [], events: [], eventsWithBalance: [], guiltFree: 0, nextCritical: null, dangerEvents: [] };

    const expenses = buildUpcomingExpenses(profile);
    const events = getUpcomingDates(expenses, currentBalance + whatIfAmount, incomeDay, profile.income || 0);
    const eventsWithBalance = calculateRunningBalance(events, currentBalance);
    const guiltFree = getGuiltFreeAmount(events, currentBalance, incomeDay);
    const nextCritical = getNextDangerEvent(eventsWithBalance);
    const dangerEvents = getDangerEvents(eventsWithBalance);

    return { expenses, events, eventsWithBalance, guiltFree, nextCritical, dangerEvents };
  }, [profile, currentBalance, whatIfAmount]);

  const totalCritical = useMemo(() =>
    eventsWithBalance.filter(e => e.priority === 'critical').reduce((s, e) => s + e.amount, 0),
    [eventsWithBalance]);

  const totalLifestyle = useMemo(() =>
    eventsWithBalance.filter(e => e.priority === 'lifestyle').reduce((s, e) => s + e.amount, 0),
    [eventsWithBalance]);

  const hasDanger = dangerEvents.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-600 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-slate-400">Inget ekonomiprofil hittat. Slutför onboardingen först.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Realtidsprognos</p>
              <h1 className="text-3xl font-black bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                The Pulse ❤️‍🔥
              </h1>
            </div>

            {/* Danger indicator */}
            {hasDanger && (
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold"
                style={{ boxShadow: '0 0 16px rgba(239,68,68,0.4)' }}
              >
                🚨 {dangerEvents.length} FARA
              </motion.div>
            )}
          </div>

          {/* Saldo + Safe-to-Spend */}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{formatNumber(currentBalance)}</span>
            <span className="text-slate-400">kr</span>
            <span className="text-xs text-slate-600 ml-1">nuvarande saldo</span>
          </div>
          {whatIfAmount > 0 && (
            <p className="text-xs text-amber-400 mt-0.5">⚡ What-if aktiv: saldo justerat med -{formatNumber(whatIfAmount)} kr</p>
          )}
          {/* Safe-to-Spend */}
          <div className="mt-3 p-3 rounded-xl flex items-center justify-between"
            style={{ background: safeToSpend > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${safeToSpend > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            <div>
              <p className="text-xs text-slate-400">Safe-to-Spend</p>
              <p className={`text-xl font-black ${safeToSpend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatNumber(safeToSpend)} kr
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Kvar efter fasta</p>
              <p className="text-xs text-slate-500">utgifter denna månad</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-4 space-y-4">
        {/* Timeline */}
        <div className="rounded-2xl p-4 border border-white/8" style={{ background: 'rgba(31,41,55,0.6)' }}>
          <PulseTimeline events={eventsWithBalance} today={new Date()} whatIfAmount={whatIfAmount} />
        </div>

        {/* Status bar */}
        <PulseStatusBar
          currentBalance={currentBalance}
          totalUpcomingCritical={totalCritical}
          totalUpcomingLifestyle={totalLifestyle}
        />

        {/* 2-col grid: Countdown + Guilt-Free */}
        <div className="grid grid-cols-1 gap-4">
          <CountdownCard nextEvent={nextCritical} currentBalance={currentBalance} />
          <GuiltFreeWindow
            amount={guiltFree}
            nextCriticalName={nextCritical?.name}
            nextCriticalDays={nextCritical?.dayOffset}
          />
        </div>

        {/* Prioritization layers */}
        <DangerZoneList events={eventsWithBalance} />

        {/* What-If Simulator */}
        <WhatIfSimulator
          events={eventsWithBalance}
          currentBalance={currentBalance + whatIfAmount}
          onWhatIfChange={setWhatIfAmount}
        />

        {/* Danger zone alert */}
        {hasDanger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl p-4 bg-rose-500/12 border border-rose-500/40"
            style={{ boxShadow: '0 0 32px rgba(239,68,68,0.2)' }}
          >
            <p className="text-rose-300 font-bold text-sm mb-2">🚨 THE DANGER ZONE</p>
            <div className="space-y-1.5">
              {dangerEvents.map((ev, i) => (
                <p key={i} className="text-xs text-rose-400">
                  ⚠ {ev.name} om {ev.dayOffset} dagar → saldot förväntas vara {formatNumber(ev.balanceAfter)} kr
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}