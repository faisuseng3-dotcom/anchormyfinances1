import React from 'react';
import { motion } from 'framer-motion';
import { getTotalFixedCosts } from '@/lib/financialUtils';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function SpendableHero({ profile }) {
  if (!profile) return null;

  const totalFixed = getTotalFixedCosts(profile);
  const monthlyMargin = profile.income - totalFixed;
  const expenses = (profile.monthlyExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const safeToSpend = Math.max(0, monthlyMargin - expenses);

  const isCritical = safeToSpend < profile.income * 0.05;
  const glowColor = isCritical ? '#FF4466' : '#0FDEBD';

  return (
    <div className="mx-4 mt-4 rounded-3xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #08101e 0%, #0a1528 100%)',
        border: `1px solid ${glowColor}28`,
        boxShadow: `0 0 40px ${glowColor}14, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}>

      {/* Glow orb behind number */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 60%, ${glowColor}18 0%, transparent 65%)` }}
      />

      <div className="relative z-10 px-6 pt-6 pb-5 text-center">
        <p className="text-[9px] font-black tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.28)' }}>
          PENGAR ATT SPENDERA
        </p>

        <motion.p
          key={safeToSpend}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260 }}
          className="font-black leading-none"
          style={{ fontSize: 52, color: '#fff', letterSpacing: '-0.03em' }}
        >
          {fmt(safeToSpend)}
          <span className="text-2xl font-black ml-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>kr</span>
        </motion.p>

        {/* Kvar badge */}
        <div className="mt-2 flex justify-center">
          <span className="px-3 py-1 rounded-full text-[10px] font-black"
            style={{
              background: `${glowColor}18`,
              color: glowColor,
              border: `1px solid ${glowColor}40`,
              boxShadow: `0 0 12px ${glowColor}22`,
            }}>
            KVAR ATT SPENDERA
          </span>
        </div>

        {/* Sub-line */}
        <p className="mt-3 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.30)' }}>
          Av {fmt(profile.income)} kr i inkomst, efter att räkningarna är betalda.
        </p>
      </div>
    </div>
  );
}