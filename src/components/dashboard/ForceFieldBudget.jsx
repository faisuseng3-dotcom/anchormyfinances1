import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { key: 'food',          label: 'Mat',      color: '#0FDEBD', r: 44 },
  { key: 'entertainment', label: 'Nöje',     color: '#A78BFA', r: 54 },
  { key: 'transport',     label: 'Transport', color: '#F6AD55', r: 64 },
];

export default function ForceFieldBudget({ profile }) {
  if (!profile) return null;

  const budgetLimits = profile.budgetLimits || {};
  const expenses = (profile.monthlyExpenses || []);

  // Calc usage per category
  const usage = {};
  expenses.forEach(e => {
    if (e.category) usage[e.category] = (usage[e.category] || 0) + (e.amount || 0);
  });

  return (
    <Link to="/Budget">
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="relative rounded-3xl overflow-hidden flex items-center justify-center"
        style={{
          height: 120,
          background: 'rgba(8,10,20,0.9)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Force field arcs */}
        <svg width="160" height="120" viewBox="0 0 160 120" className="absolute">
          {CATEGORIES.map(({ key, label, color, r }) => {
            const limit = budgetLimits[key] || 0;
            const used  = usage[key] || 0;
            const pct   = limit > 0 ? Math.min(1, used / limit) : 0;
            const isHot = pct > 0.75;
            const circ  = 2 * Math.PI * r;
            const dash  = circ * pct;

            return (
              <g key={key}>
                {/* Track arc */}
                <circle cx="80" cy="80" r={r} fill="none"
                  stroke="rgba(255,255,255,0.04)" strokeWidth="2.5"
                  strokeDasharray={`${circ * 0.6} ${circ * 0.4}`}
                  strokeDashoffset={circ * 0.2}
                />
                {/* Fill arc */}
                <motion.circle cx="80" cy="80" r={r} fill="none"
                  stroke={isHot ? '#FF4466' : color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${dash * 0.6} ${circ}`}
                  strokeDashoffset={circ * 0.2}
                  style={{ filter: `drop-shadow(0 0 4px ${isHot ? '#FF4466' : color})` }}
                  animate={isHot ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
                  transition={isHot ? { duration: 1, repeat: Infinity } : {}}
                />
              </g>
            );
          })}
        </svg>

        {/* Center label */}
        <div className="relative z-10 text-center">
          <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>BUDGET</p>
          <p className="text-xs font-black mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Kraftfält</p>
        </div>

        {/* Category dots */}
        <div className="absolute bottom-3 flex gap-3 left-1/2 -translate-x-1/2">
          {CATEGORIES.map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
              <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </Link>
  );
}