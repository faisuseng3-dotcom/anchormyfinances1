import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlarmClock } from 'lucide-react';
import { futureValueMonthly, costOfWaiting } from '@/lib/financialUtils';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { sectionMetaClass, sectionSubtitleClass } from '@/lib/anchorTheme';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function PassivityCalculator({ profile }) {
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

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <AlarmClock className="w-4 h-4 text-amber-300" />
        <p className={sectionMetaClass}>Vad kostar din passivitet?</p>
      </div>
      <p className={`${sectionSubtitleClass} mb-4`}>
        Välfärdsstaten ger stöd — men framtida du betalar för varje månad utan sparande.
      </p>

      <label className="block text-[13px] text-white/50 mb-1">Spara per månad (kr)</label>
      <input
        type="range"
        min={100}
        max={5000}
        step={100}
        value={monthly}
        onChange={(e) => setMonthly(Number(e.target.value))}
        className="w-full accent-[#6B9FFF]"
      />
      <p className="text-[22px] font-semibold text-white tabular-nums mt-1">{fmt(monthly)} kr/mån</p>

      <label className="block text-[13px] text-white/50 mt-4 mb-1">Tidshorisont (år)</label>
      <input
        type="range"
        min={5}
        max={40}
        value={years}
        onChange={(e) => setYears(Number(e.target.value))}
        className="w-full accent-[#6B9FFF]"
      />

      <div className="mt-4 pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-3">
        <div>
          <p className="text-[12px] text-white/40">Om {years} år</p>
          <p className="text-[18px] font-semibold text-emerald-300/95 tabular-nums">{fmt(fv)} kr</p>
        </div>
        <div>
          <p className="text-[12px] text-white/40">1 månad väntan kostar</p>
          <p className="text-[18px] font-semibold text-amber-200/95 tabular-nums">~{fmt(waitCost)} kr</p>
        </div>
      </div>

      {!loading && story?.wake_line && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[15px] font-medium text-white mt-4 leading-snug"
        >
          {story.wake_line}
        </motion.p>
      )}
      {story?.story && (
        <p className={`${sectionSubtitleClass} mt-2 leading-relaxed`}>{story.story}</p>
      )}
    </section>
  );
}
