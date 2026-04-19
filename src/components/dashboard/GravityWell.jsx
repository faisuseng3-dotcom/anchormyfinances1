import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * GravityWell — sparmålet visas som en sfär som fylls med vatten ju mer du sparar.
 */
export default function GravityWell({ profile }) {
  if (!profile?.savingsGoal) return null;

  const total   = profile.savingsGoal || 1;
  const current = profile.savingsCurrentBalance || 0;
  const pct     = Math.min(100, Math.round((current / total) * 100));
  const fillH   = `${pct}%`;

  const goalName = profile.savingsGoalName || 'Sparmål';

  return (
    <Link to="/SavingsGoals">
      <motion.div
        whileTap={{ scale: 0.96 }}
        className="relative rounded-3xl overflow-hidden flex flex-col items-center justify-end"
        style={{
          height: 140,
          background: 'rgba(10,12,22,0.85)',
          border: '1px solid rgba(167,139,250,0.25)',
        }}
      >
        {/* Water fill */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: fillH }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0"
          style={{
            background: 'linear-gradient(180deg, rgba(167,139,250,0.55) 0%, rgba(109,40,217,0.8) 100%)',
          }}
        >
          {/* Wave SVG */}
          <svg viewBox="0 0 200 20" className="absolute -top-3 left-0 right-0 w-full" preserveAspectRatio="none" height="20">
            <motion.path
              d="M0,10 C30,20 70,0 100,10 C130,20 170,0 200,10 L200,20 L0,20 Z"
              fill="rgba(167,139,250,0.55)"
              animate={{ d: [
                'M0,10 C30,20 70,0 100,10 C130,20 170,0 200,10 L200,20 L0,20 Z',
                'M0,10 C40,0 80,20 100,10 C120,0 160,20 200,10 L200,20 L0,20 Z',
                'M0,10 C30,20 70,0 100,10 C130,20 170,0 200,10 L200,20 L0,20 Z',
              ]}}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center pb-4 pt-3 w-full px-3">
          <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>SPARMÅL</p>
          <p className="text-sm font-black mt-0.5 truncate max-w-full" style={{ color: '#fff' }}>{goalName}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black" style={{ color: '#e9d5ff' }}>{pct}%</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {current.toLocaleString('sv-SE')} / {total.toLocaleString('sv-SE')} kr
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}