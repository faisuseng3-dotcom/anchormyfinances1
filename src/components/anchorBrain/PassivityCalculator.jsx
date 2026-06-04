import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { futureValueMonthly, costOfWaiting } from '@/lib/financialUtils';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { dashLabel } from '@/lib/dashboardTheme';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function PassivityCalculator({ profile, variant = 'default' }) {
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(30);
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);

  const months = years * 12;
  const fv = futureValueMonthly(monthly, months, 0.07);
  const waitCost = costOfWaiting(monthly, 1, months, 0.07);

  useEffect(() => {
    if (!profile?.income) return;
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      askPersonalAdvisor(
        {
          scenario: 'passivity_wake',
          payload: { monthly_kr: monthly, fv_kr: fv, wait_cost_kr: waitCost, years },
        },
        { profile },
      )
        .then((res) => {
          if (!cancelled) setStory(res);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [monthly, years, fv, waitCost, profile]);

  const wrapClass =
    variant === 'inset'
      ? 'relative rounded-[24px] p-5 overflow-hidden'
      : 'rounded-2xl border border-white/[0.08] px-4 py-4';

  return (
    <section
      className={wrapClass}
      style={
        variant === 'inset'
          ? {
              background:
                'linear-gradient(160deg, rgba(251, 191, 36, 0.08) 0%, rgba(255,255,255,0.02) 50%)',
            }
          : undefined
      }
    >
      {variant === 'inset' && (
        <div className="absolute inset-0 ring-1 ring-inset ring-white/[0.08] rounded-[24px] pointer-events-none" />
      )}

      <label className={`${dashLabel} block mb-3`}>Spara {fmt(monthly)} kr/mån</label>
      <input
        type="range"
        min={100}
        max={5000}
        step={100}
        value={monthly}
        onChange={(e) => setMonthly(Number(e.target.value))}
        className="w-full accent-amber-400/90"
      />

      <label className={`${dashLabel} block mt-4 mb-2`}>Horisont {years} år</label>
      <input
        type="range"
        min={5}
        max={40}
        value={years}
        onChange={(e) => setYears(Number(e.target.value))}
        className="w-full accent-violet-400/80"
      />

      <div className="grid grid-cols-2 gap-4 mt-5">
        <div>
          <p className="text-[11px] text-white/35">Värde om {years} år</p>
          <p className="text-[22px] font-light text-white tabular-nums">{fmt(fv)}</p>
        </div>
        <div>
          <p className="text-[11px] text-white/35">1 månad väntan</p>
          <p className="text-[22px] font-light text-amber-200/90 tabular-nums">−{fmt(waitCost)}</p>
        </div>
      </div>

      {!loading && story?.wake_line && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[14px] text-white/55 mt-4 font-light leading-relaxed relative z-10"
        >
          {story.wake_line}
        </motion.p>
      )}
    </section>
  );
}
