import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const TICKERS = [
  'Marknadsränta uppdaterad: 4.1%',
  'Inflationstakt (Feb 2026): 2.3%',
  'Reporänta: 2.75% — oförändrad',
  'OMXS30: +0.4% idag',
  'USD/SEK: 10.42 — stabilt',
];

function pad(n) { return String(n).padStart(2, '0'); }
function useClockTick() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

// Compute pulse status based on profile
function getPulseStatus(profile) {
  if (!profile) return { color: 'blue', label: 'Ansluter…', dot: '#3B82F6' };
  const income = profile.income || 1;
  const totalFixed = (profile.housingCost || 0) + ((profile.subscriptions || []).reduce((s, x) => s + x.amount, 0)) + ((profile.loans || []).reduce((s, x) => s + x.monthlyPayment, 0));
  const margin = income - totalFixed;
  const marginPct = margin / income;
  const bufferMonths = totalFixed > 0 ? (profile.buffer || 0) / totalFixed : 3;

  if (marginPct < 0.05 || bufferMonths < 0.5) {
    return { color: 'red', label: 'Akut läge – starta en Besluts-Guru-session', dot: '#EF4444', glow: 'rgba(239,68,68,0.4)' };
  }
  if (marginPct < 0.15 || bufferMonths < 1.5) {
    return { color: 'yellow', label: 'Du närmar dig din riskgräns', dot: '#F59E0B', glow: 'rgba(245,158,11,0.35)' };
  }
  return { color: 'blue', label: 'Allt lugnt – du följer planen', dot: '#3B82F6', glow: 'rgba(59,130,246,0.3)' };
}

export default function LivePulse() {
  const now = useClockTick();
  const [tickerIdx, setTickerIdx] = useState(0);

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    },
    staleTime: 60000,
  });

  useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const pulse = getPulseStatus(profile);
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dateStr = now.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="space-y-2">
      {/* Anchor Pulse bar */}
      <motion.div
        animate={{ boxShadow: [`0 0 12px ${pulse.glow || 'rgba(59,130,246,0.2)'}`, `0 0 24px ${pulse.glow || 'rgba(59,130,246,0.4)'}`, `0 0 12px ${pulse.glow || 'rgba(59,130,246,0.2)'}`] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${pulse.dot}33` }}>
        {/* Pulsing dot */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{ background: pulse.dot }}
            />
            <div className="w-2.5 h-2.5 rounded-full relative" style={{ background: pulse.dot }} />
          </div>
          <span className="text-xs font-semibold" style={{ color: pulse.dot }}>
            {pulse.color === 'red' ? '⚠️' : pulse.color === 'yellow' ? '⚡' : '●'} {pulse.label}
          </span>
        </div>
      </motion.div>

      {/* Ticker row */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-slate-400 tabular-nums">{timeStr}</span>
          <span className="text-xs text-slate-600">·</span>
          <span className="text-xs text-slate-500">{dateStr}</span>
        </div>
        <div className="w-px h-4 bg-white/10 flex-shrink-0" />
        <div className="flex-1 overflow-hidden">
          <motion.div key={tickerIdx}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-xs text-slate-400">
            <span className="text-slate-500 mr-1">▸</span>{TICKERS[tickerIdx]}
          </motion.div>
        </div>
      </div>
    </div>
  );
}