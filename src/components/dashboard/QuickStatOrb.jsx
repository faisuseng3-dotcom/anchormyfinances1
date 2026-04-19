import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * QuickStatOrb — en liten hex/rund stat-tile för Bento-grid.
 */
export default function QuickStatOrb({ label, value, sub, color = '#0FDEBD', href, delay = 0 }) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 240 }}
      whileTap={{ scale: 0.95 }}
      className="rounded-3xl p-4 flex flex-col justify-between h-full cursor-pointer"
      style={{
        background: 'rgba(10,12,22,0.85)',
        border: `1px solid ${color}35`,
        boxShadow: `0 0 20px ${color}15`,
      }}
    >
      <p className="text-[9px] font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
      <div>
        <p className="text-xl font-black leading-none" style={{ color: '#fff' }}>{value}</p>
        {sub && <p className="text-[10px] mt-1" style={{ color: `${color}aa` }}>{sub}</p>}
      </div>
      {/* Accent dot */}
      <div className="w-2 h-2 rounded-full mt-2" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
    </motion.div>
  );

  return href ? <Link to={href} className="block h-full">{inner}</Link> : inner;
}