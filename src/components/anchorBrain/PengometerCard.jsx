import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { calculatePengometer } from '@/lib/anchorBrain';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { dashHeroGlow, dashHeroNumber, dashLabel } from '@/lib/dashboardTheme';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

const RING = 120;
const STROKE = 6;
const r = (RING - STROKE) / 2;
const circ = 2 * Math.PI * r;

const GLOW = {
  ok: 'rgba(91, 140, 255, 0.45)',
  mid: 'rgba(245, 158, 11, 0.4)',
  low: 'rgba(255, 138, 154, 0.45)',
  empty: 'rgba(255, 100, 120, 0.5)',
};

export default function PengometerCard({ profile, transactions, toneMode = 'normal' }) {
  const pengometer = calculatePengometer(profile, transactions);
  const [line, setLine] = useState(null);
  const soft = toneMode === 'soft';
  const offset = circ - (pengometer.fill_percent / 100) * circ;
  const glow = GLOW[pengometer.status] || GLOW.ok;

  useEffect(() => {
    if (!profile?.income) return;
    let cancelled = false;
    askPersonalAdvisor({ scenario: 'pengometer_line' }, { profile, transactions })
      .then((res) => {
        if (!cancelled) setLine(res);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [profile, transactions, pengometer.remaining_week_kr]);

  return (
    <section className="relative pt-2 pb-6">
      <div className={dashHeroGlow} style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }} />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative w-[140px] h-[140px] mb-2">
          <svg width={RING} height={RING} className="absolute inset-0 m-auto -rotate-90">
            <circle
              cx={RING / 2}
              cy={RING / 2}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={STROKE}
            />
            <motion.circle
              cx={RING / 2}
              cy={RING / 2}
              r={r}
              fill="none"
              stroke="url(#pengGrad)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
            <defs>
              <linearGradient id="pengGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5eead4" />
                <stop offset="50%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={pengometer.headline_kr}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${dashHeroNumber} text-[2.75rem]`}
            >
              {fmt(pengometer.headline_kr)}
            </motion.span>
            <span className="text-[13px] text-white/40 mt-0.5">kr</span>
          </div>
        </div>

        <p className={dashLabel}>{pengometer.headline_label}</p>

        {!soft && (
          <div className="flex gap-6 mt-5 text-[13px] text-white/42 tabular-nums">
            <span>{fmt(pengometer.remaining_month_kr)} kr / mån</span>
            <span>~{fmt(pengometer.remaining_today_kr)} kr idag</span>
          </div>
        )}

        {line?.feeling_line && (
          <p className="text-[15px] text-white/55 mt-4 max-w-[300px] leading-relaxed font-light">
            {line.feeling_line}
          </p>
        )}
      </div>
    </section>
  );
}
