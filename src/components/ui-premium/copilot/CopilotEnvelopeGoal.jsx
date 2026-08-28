import React from 'react';
import { motion } from 'framer-motion';
import VisualSavingsGoalRing from '@/components/goals/VisualSavingsGoalRing';
import { triggerHaptic } from '@/lib/haptics';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/**
 * Kuvert/ficka — visuellt sparmål med vätske-fyllning + progress ring.
 */
export default function CopilotEnvelopeGoal({
  name,
  current = 0,
  target = 0,
  imageUrl = null,
  iconId = 'default',
  visualType = 'icon',
  className = '',
  featured = false,
}) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const fillPct = Math.max(8, pct);
  const ringSize = featured ? 108 : 80;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => triggerHaptic(pct >= 75 ? 'success' : 'light')}
      onKeyDown={(e) => { if (e.key === 'Enter') triggerHaptic('light'); }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={`relative rounded-3xl overflow-hidden cursor-pointer border border-[var(--color-border)] ${className}`}
      style={{ background: '#FFFFFF', boxShadow: 'var(--anchor-shadow-1)' }}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        initial={{ height: 0 }}
        animate={{ height: `${fillPct}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'linear-gradient(180deg, rgba(22, 163, 74, 0.04) 0%, rgba(22, 163, 74, 0.12) 100%)',
        }}
      />
      <svg
        className="absolute bottom-0 left-0 w-full pointer-events-none opacity-40"
        viewBox="0 0 400 24"
        preserveAspectRatio="none"
        style={{ height: 18, transform: `translateY(-${fillPct * 0.12}px)` }}
        aria-hidden
      >
        <path
          d="M0,12 C80,4 160,20 240,10 C320,0 360,16 400,8 L400,24 L0,24 Z"
          fill="rgba(22, 163, 74, 0.22)"
        />
      </svg>

      <div className={`relative z-10 flex items-center gap-4 ${featured ? 'p-6' : 'p-5'}`}>
        <VisualSavingsGoalRing
          pct={pct}
          size={ringSize}
          stroke={featured ? 6 : 5}
          imageUrl={visualType === 'image' ? imageUrl : null}
          iconId={iconId}
          showMilestones
        />
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-[var(--color-text-primary)] truncate ${featured ? 'text-[18px]' : 'text-[15px]'}`}>{name}</p>
          <p className={`text-[var(--color-text-muted)] mt-0.5 tabular-nums ${featured ? 'text-[14px]' : 'text-[12px]'}`}>
            {fmt(current)} / {fmt(target)} kr
          </p>
          <div className={`rounded-full bg-[var(--color-background-secondary)] overflow-hidden ${featured ? 'mt-4 h-2' : 'mt-3 h-1.5'}`}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--copilot-accent-blue), var(--copilot-accent-green))' }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
        <span className={`font-bold text-[var(--copilot-accent-green)] tabular-nums shrink-0 ${featured ? 'text-[24px]' : 'text-[17px]'}`}>
          {Math.round(pct)}%
        </span>
      </div>
    </motion.div>
  );
}
