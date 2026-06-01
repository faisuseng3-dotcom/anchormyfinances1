import React from 'react';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { getEconomicHealth } from '@/lib/economicHealth';
import { anchorZoneClass, sectionSubtitleClass } from '@/lib/anchorTheme';

export default function EconomicHealthCard({ mli }) {
  const health = getEconomicHealth(mli);

  const shareScore = async () => {
    const text = `Min ekonomiska ro i Anchor: ${health.score}/100 — ${health.label}. ${health.hint}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Anchor — ekonomisk ro', text });
        return;
      }
    } catch {
      /* user cancelled */
    }
    await navigator.clipboard?.writeText(text);
    toast.success('Kopierat — dela med vem du vill');
  };
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (health.score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${anchorZoneClass} flex items-center gap-4 py-2`}
    >
      <div className="relative w-[68px] h-[68px] flex-shrink-0">
        <svg width="68" height="68" className="-rotate-90">
          <circle
            cx="34"
            cy="34"
            r="28"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="5"
          />
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
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[20px] font-semibold text-white tabular-nums">
          {health.score}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] text-white/45">Ekonomisk ro</p>
          <button
            type="button"
            onClick={shareScore}
            className="flex items-center gap-1 text-[12px] text-white/45 hover:text-white/75 transition-colors"
            aria-label="Dela ekonomisk ro"
          >
            <Share2 className="w-3.5 h-3.5" />
            Dela
          </button>
        </div>
        <p className="text-[17px] font-semibold text-white">{health.label}</p>
        <p className={`${sectionSubtitleClass} mt-1`}>{health.hint}</p>
      </div>
    </motion.div>
  );
}
