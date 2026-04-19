import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getTotalFixedCosts } from '@/lib/financialUtils';

/**
 * EnergyCore — den stora, animerade cirkulära mätaren som representerar ekonomisk hälsa.
 * Grön = stabil, Orange = varning, Röd = kritisk, Lila = sparläge
 */
export default function EnergyCore({ profile }) {
  if (!profile) return null;

  const totalFixed = getTotalFixedCosts(profile);
  const monthlyMargin = profile.income - totalFixed;
  const expenses = (profile.monthlyExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const safeToSpend = Math.max(0, monthlyMargin - expenses);
  const usedPct = Math.min(100, monthlyMargin > 0 ? (expenses / monthlyMargin) * 100 : 100);

  const isCritical = usedPct >= 85;
  const isWarning  = usedPct >= 60 && !isCritical;
  const isSaving   = usedPct < 30;

  const coreColor  = isCritical ? '#FF4466' : isWarning ? '#F6AD55' : isSaving ? '#A78BFA' : '#0FDEBD';
  const glowColor  = isCritical ? 'rgba(255,68,102,0.35)' : isWarning ? 'rgba(246,173,85,0.3)' : isSaving ? 'rgba(167,139,250,0.3)' : 'rgba(15,222,189,0.3)';
  const label      = isCritical ? 'KRITISK' : isWarning ? 'VARNING' : isSaving ? 'SPARLÄGE' : 'STABIL';

  const r = 70;
  const circ = 2 * Math.PI * r;
  const filled = circ * (1 - usedPct / 100);

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="relative" style={{ width: 200, height: 200 }}>
        {/* Outer glow ring */}
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
        />

        {/* SVG ring */}
        <svg width="200" height="200" viewBox="0 0 200 200" className="absolute inset-0">
          {/* Track */}
          <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
          {/* Progress */}
          <motion.circle
            cx="100" cy="100" r={r}
            fill="none"
            stroke={coreColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: filled }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px', filter: `drop-shadow(0 0 6px ${coreColor})` }}
          />
          {/* Inner tick marks */}
          {[...Array(24)].map((_, i) => {
            const angle = (i / 24) * 360;
            const rad = (angle * Math.PI) / 180;
            const x1 = 100 + 82 * Math.cos(rad);
            const y1 = 100 + 82 * Math.sin(rad);
            const x2 = 100 + 88 * Math.cos(rad);
            const y2 = 100 + 88 * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />;
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.p
            key={safeToSpend}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-black tracking-tight"
            style={{ color: '#ffffff', lineHeight: 1 }}
          >
            {Math.round(safeToSpend).toLocaleString('sv-SE')}
          </motion.p>
          <p className="text-[10px] font-semibold tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
            KR KVAR
          </p>
          <div
            className="mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest"
            style={{ background: `${coreColor}25`, color: coreColor, border: `1px solid ${coreColor}50` }}
          >
            {label}
          </div>
        </div>
      </div>

      {/* Mini stats */}
      <div className="flex items-center gap-6 mt-3">
        {[
          { label: 'INKOMST', value: profile.income },
          { label: 'FASTA', value: totalFixed },
          { label: 'ANVÄNT', value: expenses },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="text-[9px] font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
            <p className="text-xs font-black mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {Math.round(s.value || 0).toLocaleString('sv-SE')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}