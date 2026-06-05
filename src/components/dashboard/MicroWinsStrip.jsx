import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getDailyMicroWins } from '@/lib/microWins';
import { dashLabel } from '@/lib/dashboardTheme';

export default function MicroWinsStrip({ profile, transactions }) {
  const wins = useMemo(
    () => getDailyMicroWins(profile, transactions),
    [profile, transactions],
  );

  if (!wins.length) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-amber-300/80" />
        <p className={dashLabel}>Idag</p>
      </div>
      <ul className="space-y-2">
        {wins.map((win, i) => (
          <motion.li
            key={win.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="text-[15px] text-white/75 leading-relaxed font-light"
          >
            {win.text}
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
