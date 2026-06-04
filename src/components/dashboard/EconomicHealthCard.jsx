import React from 'react';
import { motion } from 'framer-motion';
import { getEconomicHealth } from '@/lib/economicHealth';

export default function EconomicHealthCard({ mli, compact = false }) {
  const health = getEconomicHealth(mli);
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (health.score / 100) * circumference;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/[0.05] ring-1 ring-white/[0.08]"
        title={`${health.label} — ${health.hint}`}
      >
        <div className="relative w-9 h-9 flex-shrink-0">
          <svg width="36" height="36" className="-rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke={health.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 14}
              strokeDashoffset={2 * Math.PI * 14 - (health.score / 100) * 2 * Math.PI * 14}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white tabular-nums">
            {health.score}
          </span>
        </div>
        <span className="text-[12px] text-white/55 max-w-[72px] truncate hidden sm:block">
          {health.label}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 py-2">
      <div className="relative w-[68px] h-[68px] flex-shrink-0">
        <svg width="68" height="68" className="-rotate-90">
          <circle cx="34" cy="34" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <circle
            cx="34"
            cy="34"
            r="28"
            fill="none"
            stroke={health.color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[20px] font-semibold text-white tabular-nums">
          {health.score}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-white/40">Ekonomisk ro</p>
        <p className="text-[17px] font-semibold text-white">{health.label}</p>
        <p className="text-[13px] text-white/50 mt-1">{health.hint}</p>
      </div>
    </motion.div>
  );
}
