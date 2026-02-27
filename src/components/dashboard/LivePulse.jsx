import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TICKERS = [
  'Marknadsränta uppdaterad: 4.1%',
  'Din elförbrukning beräknas: 740 kr/mån',
  'Inflationstakt (Feb 2026): 2.3%',
  'Reporänta: 2.75% — oförändrad',
  'Din buffert: 2.1 månaders säkerhet',
  'OMXS30: +0.4% idag',
  'USD/SEK: 10.42 — stabilt',
];

function useClockTick() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function pad(n) { return String(n).padStart(2, '0'); }

export default function LivePulse() {
  const now = useClockTick();
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dateStr = now.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Live dot + clock */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-emerald-400"
        />
        <span className="text-xs text-slate-400 tabular-nums">{timeStr}</span>
        <span className="text-xs text-slate-600">·</span>
        <span className="text-xs text-slate-500">{dateStr}</span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-white/10 flex-shrink-0" />

      {/* Rolling ticker */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={tickerIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="text-xs text-slate-400"
        >
          <span className="text-emerald-400 font-semibold mr-1">▸</span>
          {TICKERS[tickerIdx]}
        </motion.div>
      </div>
    </div>
  );
}