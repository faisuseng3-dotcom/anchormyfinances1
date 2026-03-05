import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Generate a deterministic "Anchor Key" from profile data
function generateAnchorKey(profile, persona) {
  const income = profile?.income || 0;
  const buffer = profile?.buffer || 0;
  const savings = profile?.savingsGoal || 0;

  // Color palette based on financial health
  const palettes = [
    ['#6366F1', '#8B5CF6', '#EC4899'], // indigo-purple-pink (balanced)
    ['#10B981', '#3B82F6', '#6366F1'], // emerald-blue-indigo (saver)
    ['#F59E0B', '#EF4444', '#EC4899'], // amber-red-pink (tight)
    ['#14B8A6', '#06B6D4', '#3B82F6'], // teal-cyan-blue (stable)
    ['#8B5CF6', '#EC4899', '#F97316'], // purple-pink-orange (optimizer)
  ];

  const personaMap = { saver: 1, optimizer: 4, planner: 0 };
  const idx = personaMap[persona] ?? (income % palettes.length);
  const colors = palettes[idx % palettes.length];

  // Shape count based on buffer (3–7)
  const shapes = Math.max(3, Math.min(7, Math.floor(buffer / 10000) + 3));

  // Key ID: short hash
  const hash = ((income * 31 + buffer * 17 + savings * 7) % 99999).toString().padStart(5, '0');
  const keyId = `ANC-${hash}`;

  return { colors, shapes, keyId };
}

export default function AnchorKey({ profile, persona }) {
  const { colors, shapes, keyId } = useMemo(() => generateAnchorKey(profile, persona), [profile, persona]);

  return (
    <div className="flex flex-col items-center">
      {/* SVG Key Visual */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
        className="relative w-32 h-32 mb-4"
      >
        <svg viewBox="0 0 128 128" className="w-full h-full">
          <defs>
            <radialGradient id="keyGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="50%" stopColor={colors[1]} />
              <stop offset="100%" stopColor={colors[2]} />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Outer ring */}
          <circle cx="64" cy="64" r="58" fill="none" stroke="url(#keyGrad)" strokeWidth="3" opacity="0.4" />
          <circle cx="64" cy="64" r="48" fill="url(#keyGrad)" opacity="0.15" />

          {/* Inner anchor symbol */}
          <g filter="url(#glow)" fill="url(#keyGrad)">
            {/* Anchor circle top */}
            <circle cx="64" cy="36" r="10" fill="none" stroke="url(#keyGrad)" strokeWidth="4" />
            {/* Anchor vertical */}
            <line x1="64" y1="46" x2="64" y2="92" stroke="url(#keyGrad)" strokeWidth="4" strokeLinecap="round" />
            {/* Anchor horizontal bar */}
            <line x1="44" y1="60" x2="84" y2="60" stroke="url(#keyGrad)" strokeWidth="4" strokeLinecap="round" />
            {/* Anchor bottom curves */}
            <path d="M64,92 Q44,100 44,84" stroke="url(#keyGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M64,92 Q84,100 84,84" stroke="url(#keyGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>

          {/* Decorative dots */}
          {Array.from({ length: shapes }).map((_, i) => {
            const angle = (i / shapes) * Math.PI * 2 - Math.PI / 2;
            const x = 64 + Math.cos(angle) * 55;
            const y = 64 + Math.sin(angle) * 55;
            return (
              <motion.circle
                key={i}
                cx={x} cy={y} r="3"
                fill={colors[i % colors.length]}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              />
            );
          })}
        </svg>
      </motion.div>

      {/* Key ID */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest"
        style={{
          background: `linear-gradient(90deg, ${colors[0]}22, ${colors[2]}22)`,
          border: `1px solid ${colors[0]}44`,
          color: colors[0],
        }}
      >
        {keyId}
      </motion.div>
    </div>
  );
}