import React from 'react';
import { motion } from 'framer-motion';
import { getTotalFixedCosts } from '@/lib/financialUtils';

// Full number formatting — no abbreviations
const fmt = (n) => {
  if (!n && n !== 0) return '0';
  return Math.round(n).toLocaleString('sv-SE');
};

export default function OrbitCore({ profile }) {
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
  const glowColor  = isCritical ? 'rgba(255,68,102,0.4)' : isWarning ? 'rgba(246,173,85,0.35)' : isSaving ? 'rgba(167,139,250,0.35)' : 'rgba(15,222,189,0.35)';
  const label      = isCritical ? 'KRITISK' : isWarning ? 'VARNING' : isSaving ? 'SPARLÄGE' : 'STABIL';

  // Month progress (how far into the month we are)
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthPct = (now.getDate() / daysInMonth);

  const r = 85;
  const circ = 2 * Math.PI * r;
  const usedDash = circ * (1 - usedPct / 100);
  // Month ring
  const rMonth = 98;
  const circMonth = 2 * Math.PI * rMonth;
  const monthDash = circMonth * (1 - monthPct);

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative" style={{ width: 230, height: 230 }}>

        {/* Ambient glow layers */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 65%)` }}
        />
        <motion.div
          animate={{ scale: [1.05, 1, 1.05], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 50%)`, filter: 'blur(12px)' }}
        />

        <svg width="230" height="230" viewBox="0 0 230 230" className="absolute inset-0">
          {/* Tick marks outer */}
          {[...Array(36)].map((_, i) => {
            const angle = (i / 36) * 360;
            const rad = (angle * Math.PI) / 180;
            const r1 = 107; const r2 = 112;
            const x1 = 115 + r1 * Math.cos(rad); const y1 = 115 + r1 * Math.sin(rad);
            const x2 = 115 + r2 * Math.cos(rad); const y2 = 115 + r2 * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />;
          })}

          {/* Month progress ring (outer thin) */}
          <circle cx="115" cy="115" r={rMonth} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
          <motion.circle
            cx="115" cy="115" r={rMonth}
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circMonth}
            initial={{ strokeDashoffset: circMonth }}
            animate={{ strokeDashoffset: monthDash }}
            transition={{ duration: 2, ease: 'easeOut' }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '115px 115px' }}
          />

          {/* Budget used ring */}
          <circle cx="115" cy="115" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          <motion.circle
            cx="115" cy="115" r={r}
            fill="none"
            stroke={coreColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: usedDash }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '115px 115px',
              filter: `drop-shadow(0 0 8px ${coreColor}) drop-shadow(0 0 16px ${coreColor}80)`,
            }}
          />
        </svg>

        {/* Glass-morphic inner circle */}
        <div
          className="absolute rounded-full flex flex-col items-center justify-center"
          style={{
            inset: 28,
            background: 'rgba(10,12,24,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: `inset 0 0 30px ${glowColor}, 0 0 0 1px rgba(255,255,255,0.04)`,
          }}
        >
          <motion.div
            key={safeToSpend}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-center"
          >
            <p className="text-[10px] font-black tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>KR KVAR</p>
            <p className="font-black leading-none" style={{ color: '#fff', fontSize: 28, letterSpacing: '-0.02em' }}>
              {fmt(safeToSpend)}
            </p>
            <p className="text-[10px] mt-0.5 font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>kr</p>
          </motion.div>

          {/* Status badge */}
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest"
            style={{ background: `${coreColor}20`, color: coreColor, border: `1px solid ${coreColor}50` }}
          >
            {label}
          </motion.div>
        </div>
      </div>

      {/* Mini stat strip */}
      <div className="flex items-center gap-5 mt-1">
        {[
          { label: 'INKOMST', value: profile.income, color: 'rgba(255,255,255,0.5)' },
          { label: 'FASTA',   value: totalFixed,     color: 'rgba(246,173,85,0.7)' },
          { label: 'ANVÄNT',  value: expenses,        color: coreColor },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="text-[8px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>{s.label}</p>
            <p className="text-xs font-black mt-0.5" style={{ color: s.color }}>
              {fmt(s.value)} <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>kr</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}