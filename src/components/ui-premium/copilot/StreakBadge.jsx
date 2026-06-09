import React from 'react';
import { motion } from 'framer-motion';

export default function StreakBadge({ count, label, variant = 'fire' }) {
  if (!count || count < 2) return null;

  const icons = { fire: '🔥', save: '💰', budget: '✓' };
  const colors = {
    fire: 'rgba(251,146,60,0.15)',
    save: 'rgba(34,217,122,0.12)',
    budget: 'rgba(74,122,255,0.12)',
  };
  const borders = {
    fire: 'rgba(251,146,60,0.25)',
    save: 'rgba(34,217,122,0.2)',
    budget: 'rgba(74,122,255,0.2)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
      style={{
        background: colors[variant] || colors.fire,
        border: `1px solid ${borders[variant] || borders.fire}`,
        color: 'var(--copilot-text-primary)',
      }}
    >
      <span>{icons[variant] || icons.fire}</span>
      <span>{count} {label || 'dagar i rad'}</span>
    </motion.div>
  );
}
