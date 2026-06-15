import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GoalIcon } from '@/lib/anchorIcons';
import { triggerHaptic } from '@/lib/haptics';
import {
  GOAL_MILESTONE_PCTS,
  getGoalVisualEffects,
} from '@/lib/savingsGoalValidation';

function milestoneCoords(pct, size, stroke) {
  const r = (size - stroke) / 2;
  const angle = (pct / 100) * 2 * Math.PI - Math.PI / 2;
  return {
    x: size / 2 + r * Math.cos(angle),
    y: size / 2 + r * Math.sin(angle),
  };
}

/**
 * Progress ring runt sparmålsbild/ikon — milestones, skärpa och glöd vid 75%+.
 */
export default function VisualSavingsGoalRing({
  pct = 0,
  size = 120,
  stroke = 7,
  color = '#22d97a',
  trackColor = 'rgba(255,255,255,0.1)',
  imageUrl = null,
  iconId = 'default',
  showMilestones = true,
  showPctLabel = false,
  className = '',
}) {
  const clampedPct = Math.min(100, Math.max(0, pct));
  const prevPct = useRef(clampedPct);
  const milestoneRef = useRef(0);

  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const crossed = milestones.find((m) => prevPct.current < m && clampedPct >= m);
    if (crossed && crossed > milestoneRef.current) {
      milestoneRef.current = crossed;
      triggerHaptic(crossed >= 75 ? 'success' : 'light');
    }
    prevPct.current = clampedPct;
  }, [clampedPct]);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clampedPct / 100) * circ;
  const effects = getGoalVisualEffects(clampedPct);
  const innerSize = size - stroke * 2 - 8;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {effects.glow && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{
            boxShadow: [
              `0 0 ${12 + effects.glowIntensity * 20}px rgba(34,217,122,${0.25 + effects.glowIntensity * 0.35})`,
              `0 0 ${20 + effects.glowIntensity * 28}px rgba(34,217,122,${0.4 + effects.glowIntensity * 0.4})`,
              `0 0 ${12 + effects.glowIntensity * 20}px rgba(34,217,122,${0.25 + effects.glowIntensity * 0.35})`,
            ],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <svg width={size} height={size} className="absolute -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={effects.glow ? { filter: `drop-shadow(0 0 ${4 + effects.glowIntensity * 6}px ${color})` } : undefined}
        />
        {showMilestones &&
          GOAL_MILESTONE_PCTS.map((m) => {
            const { x, y } = milestoneCoords(m, size, stroke);
            const reached = clampedPct >= m;
            return (
              <circle
                key={m}
                cx={x}
                cy={y}
                r={reached ? 3.5 : 2.5}
                fill={reached ? color : 'rgba(255,255,255,0.25)'}
                stroke={reached ? 'rgba(255,255,255,0.5)' : 'transparent'}
                strokeWidth={1}
              />
            );
          })}
      </svg>

      <div
        className="absolute rounded-full overflow-hidden flex items-center justify-center"
        style={{
          width: innerSize,
          height: innerSize,
          background: imageUrl ? '#0a1020' : 'linear-gradient(145deg, rgba(34,217,122,0.15), rgba(74,122,255,0.12))',
        }}
      >
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            animate={{
              filter: `blur(${effects.blur}px) grayscale(${effects.grayscale}%)`,
              opacity: effects.opacity,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ) : (
          <motion.div
            className="flex items-center justify-center w-full h-full"
            animate={{
              filter: `blur(${Math.max(0, effects.blur - 4)}px)`,
              opacity: effects.opacity,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <GoalIcon type={iconId} size={Math.round(innerSize * 0.42)} color={color} />
          </motion.div>
        )}
      </div>

      {showPctLabel && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums text-white bg-black/50 backdrop-blur-sm">
          {Math.round(clampedPct)}%
        </div>
      )}
    </div>
  );
}
