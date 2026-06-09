import React from 'react';
import { motion } from 'framer-motion';
import { StreakIcon } from '@/lib/anchorIcons';

export default function StreakBadge({ count, label, variant = 'fire' }) {
  if (!count || count < 2) return null;

  const colors = {
    fire: { bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.25)' },
    save: { bg: 'rgba(34,217,122,0.12)', border: 'rgba(34,217,122,0.2)' },
    budget: { bg: 'rgba(74,122,255,0.12)', border: 'rgba(74,122,255,0.2)' },
  };
  const c = colors[variant] || colors.fire;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-white"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <StreakIcon variant={variant} size={14} className="text-[var(--copilot-accent-green)]" />
      <span>{count} {label || 'dagar i rad'}</span>
    </motion.div>
  );
}
