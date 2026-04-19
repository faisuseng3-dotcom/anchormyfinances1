import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function LiquidGoal({ profile }) {
  if (!profile?.savingsGoal) return null;

  const total   = profile.savingsGoal || 1;
  const current = profile.savingsCurrentBalance || 0;
  const pct     = Math.min(100, Math.round((current / total) * 100));
  const isAlmostFull = pct >= 90;
  const isFull  = pct >= 100;

  const liquidColor = isFull ? '#FFD700' : isAlmostFull ? '#F6AD55' : '#A78BFA';
  const glowColor   = isFull ? 'rgba(255,215,0,0.5)' : isAlmostFull ? 'rgba(246,173,85,0.4)' : 'rgba(167,139,250,0.3)';

  return (
    <Link to="/SavingsGoals">
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="relative rounded-3xl overflow-hidden"
        style={{
          height: 100,
          background: 'rgba(10,12,22,0.9)',
          border: `1px solid ${liquidColor}40`,
          boxShadow: isAlmostFull ? `0 0 24px ${glowColor}` : 'none',
        }}
      >
        {/* Liquid fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0"
          style={{ background: `linear-gradient(90deg, ${liquidColor}30 0%, ${liquidColor}60 100%)` }}
        />

        {/* Wave overlay on fill */}
        <motion.div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="absolute right-0 h-full" style={{ width: 60 }}>
            <motion.path
              d="M0,50 C15,30 35,70 50,50 C65,30 85,70 100,50 L100,100 L0,100 Z"
              fill={`${liquidColor}70`}
              animate={{ d: [
                'M0,50 C15,30 35,70 50,50 C65,30 85,70 100,50 L100,100 L0,100 Z',
                'M0,50 C15,70 35,30 50,50 C65,70 85,30 100,50 L100,100 L0,100 Z',
                'M0,50 C15,30 35,70 50,50 C65,30 85,70 100,50 L100,100 L0,100 Z',
              ]}}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>

        {/* Overflow glow when full */}
        {isAlmostFull && (
          <motion.div
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 50% 50%, ${glowColor} 0%, transparent 70%)` }}
          />
        )}

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-between px-5">
          <div>
            <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>SPARMÅL</p>
            <p className="text-sm font-black mt-0.5" style={{ color: '#fff' }}>
              {profile.savingsGoalName || 'Sparmål'} {profile.savingsGoalEmoji || ''}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {fmt(current)} / {fmt(total)} kr
            </p>
          </div>
          <div className="text-right">
            <motion.p
              key={pct}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-3xl font-black"
              style={{ color: liquidColor, lineHeight: 1, filter: isAlmostFull ? `drop-shadow(0 0 8px ${liquidColor})` : 'none' }}
            >
              {pct}%
            </motion.p>
            {isFull && <p className="text-[9px] font-black" style={{ color: '#FFD700' }}>UPPNÅTT! 🎉</p>}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}