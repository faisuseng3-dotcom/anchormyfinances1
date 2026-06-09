import React from 'react';
import { motion } from 'framer-motion';
import VisualSavingsGoalRing from '@/components/savings/VisualSavingsGoalRing';
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
}) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const fillPct = Math.max(8, pct);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => triggerHaptic(pct >= 75 ? 'success' : 'light')}
      onKeyDown={(e) => { if (e.key === 'Enter') triggerHaptic('light'); }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={`organic-surface organic-surface--hero relative rounded-3xl overflow-hidden cursor-pointer ${className}`}
      style={{ background: 'var(--copilot-bg-card)' }}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        initial={{ height: 0 }}
        animate={{ height: `${fillPct}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'linear-gradient(180deg, rgba(34,217,122,0.05) 0%, rgba(34,217,122,0.22) 100%)',
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
          fill="rgba(34,217,122,0.35)"
        />
      </svg>

      <div className="relative z-10 p-5 flex items-center gap-4">
        <VisualSavingsGoalRing
          pct={pct}
          size={80}
          stroke={5}
          imageUrl={visualType === 'image' ? imageUrl : null}
          iconId={iconId}
          showMilestones
        />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-white truncate">{name}</p>
          <p className="text-[12px] text-[var(--copilot-text-muted)] mt-0.5 tabular-nums">
            {fmt(current)} / {fmt(target)} kr
          </p>
          <div className="mt-3 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--copilot-accent-blue), var(--copilot-accent-green))' }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
        <span className="text-[17px] font-bold text-[var(--copilot-accent-green)] tabular-nums shrink-0">
          {Math.round(pct)}%
        </span>
      </div>
    </motion.div>
  );
}
