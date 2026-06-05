import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { calculateWeeklyHealthScore, healthShareText } from '@/lib/weeklyHealthScore';

export default function EconomicHealthCard({ profile, transactions, compact = false }) {
  const health = useMemo(
    () => calculateWeeklyHealthScore(profile, transactions),
    [profile, transactions],
  );

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = healthShareText(health.score);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Min ekonomiska hälsa', text });
        return;
      } catch { /* fallback */ }
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    }
  };

  const ringR = compact ? 14 : 28;
  const circumference = 2 * Math.PI * ringR;
  const offset = circumference - (health.score / 100) * circumference;

  if (compact) {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleShare}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/[0.05] ring-1 ring-white/[0.08] hover:bg-white/[0.08] transition-colors"
        title={`${health.label} — tryck för att dela`}
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
        <span className="text-[12px] text-white/55 max-w-[88px] truncate hidden sm:block">
          {health.label}
        </span>
        <Share2 className="w-3 h-3 text-white/35 hidden sm:block" />
      </motion.button>
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
        <p className="text-[13px] text-white/40">Ekonomisk hälsa</p>
        <p className="text-[17px] font-semibold text-white">{health.label}</p>
        <p className="text-[13px] text-white/50 mt-1">{health.hint}</p>
      </div>
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium text-white/70 bg-white/[0.06] ring-1 ring-white/[0.08] hover:text-white"
      >
        <Share2 className="w-3.5 h-3.5" />
        Dela
      </button>
    </motion.div>
  );
}
