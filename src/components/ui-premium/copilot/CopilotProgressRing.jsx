import React from 'react';
import { motion } from 'framer-motion';

/**
 * Apple Watch-style progress ring.
 * @param {{ value: number; max?: number; size?: number; stroke?: number; color?: string; trackColor?: string; label?: string; sublabel?: string; children?: React.ReactNode; className?: string }} props
 */
export default function CopilotProgressRing({
  value = 0,
  max = 100,
  size = 120,
  stroke = 7,
  color = '#22d97a',
  trackColor = 'rgba(255,255,255,0.1)',
  label,
  sublabel,
  children,
  className = '',
}) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - pct * circ;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
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
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        {children || (
          <>
            {label != null && (
              <span className="text-[22px] font-bold text-white tabular-nums leading-none tracking-tight">
                {label}
              </span>
            )}
            {sublabel && (
              <span className="text-[10px] text-[var(--copilot-text-muted)] mt-1 uppercase tracking-wide font-medium">
                {sublabel}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
