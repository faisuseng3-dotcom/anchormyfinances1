import React from 'react';
import { motion } from 'framer-motion';
import { StreakIcon } from '@/lib/anchorIcons';

export default function StreakBadge({ count = 0, label, variant = 'fire', forceShow = false }) {
  if (!forceShow && (!count || count < 2)) return null;

  const colors = {
    fire: { bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.25)' },
    save: { bg: 'rgba(79, 174, 130, 0.12)', border: 'rgba(79, 174, 130, 0.2)' },
    budget: { bg: 'rgba(79, 174, 130, 0.12)', border: 'rgba(79, 174, 130, 0.2)' },
  };
  const c = colors[variant] || colors.fire;

  const displayCount = count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold text-[var(--color-text-primary)] w-full"
      style={{}}
    >
      <div
        className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
        style={{ background: 'var(--color-success-soft)' }}
      >
        <StreakIcon variant={variant} size={18} className="text-[var(--copilot-accent-green)]" />
      </div>
      <div className="min-w-0">
        <p className="text-[20px] font-bold tabular-nums leading-none">{displayCount}</p>
        <p className="text-[11px] text-[var(--copilot-text-muted)] font-medium mt-0.5">{label || 'dagar i rad'}</p>
      </div>
    </motion.div>
  );
}
