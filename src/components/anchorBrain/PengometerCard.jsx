import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { calculatePengometer } from '@/lib/anchorBrain';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { sectionMetaClass, sectionSubtitleClass } from '@/lib/anchorTheme';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

const STATUS_COLORS = {
  ok: 'linear-gradient(90deg, #5B8CFF, #9FB5FF)',
  mid: 'linear-gradient(90deg, #FCD34D, #F59E0B)',
  low: 'linear-gradient(90deg, #FB923C, #FF8A9A)',
  empty: '#FF8A9A',
};

export default function PengometerCard({ profile, transactions, toneMode = 'normal' }) {
  const pengometer = calculatePengometer(profile, transactions);
  const [line, setLine] = useState(null);

  useEffect(() => {
    if (!profile?.income) return;
    let cancelled = false;
    askPersonalAdvisor(
      { scenario: 'pengometer_line' },
      { profile, transactions },
    )
      .then((res) => {
        if (!cancelled) setLine(res);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [profile, transactions, pengometer.remaining_week_kr]);

  const barColor = STATUS_COLORS[pengometer.status] || STATUS_COLORS.ok;
  const soft = toneMode === 'soft';

  return (
    <section className="rounded-2xl border border-white/[0.1] bg-white/[0.04] overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4 text-[#9FB5FF]" />
          <p className={sectionMetaClass}>Pengometer — din digitala sedelbunt</p>
        </div>

        <motion.p
          key={pengometer.headline_kr}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[clamp(2.25rem,10vw,3rem)] font-semibold text-white tabular-nums leading-none"
        >
          {fmt(pengometer.headline_kr)}
          <span className="text-[18px] font-medium text-white/40 ml-2">kr</span>
        </motion.p>
        <p className="text-[15px] text-white/55 mt-1">{pengometer.headline_label}</p>

        <div className="mt-4 h-2 rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pengometer.fill_percent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ background: barColor }}
          />
        </div>

        {!soft && (
          <div className="flex gap-4 mt-3 text-[13px] text-white/45 tabular-nums">
            <span>{fmt(pengometer.remaining_month_kr)} kr kvar i månaden</span>
            <span>~{fmt(pengometer.remaining_today_kr)} kr/dag</span>
          </div>
        )}

        {line?.feeling_line && (
          <p className={`${sectionSubtitleClass} mt-3 leading-relaxed`}>{line.feeling_line}</p>
        )}
        {line?.tip && !soft && (
          <p className="text-[13px] text-[#9FB5FF]/90 mt-1.5">{line.tip}</p>
        )}
      </div>
    </section>
  );
}
