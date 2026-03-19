import React from 'react';
import { motion } from 'framer-motion';
import { formatNumber } from './pulseEngine';

export default function PulseStatusBar({ currentBalance, totalUpcomingCritical, totalUpcomingLifestyle }) {
  const totalUpcoming = totalUpcomingCritical + totalUpcomingLifestyle;
  const safePercent = Math.max(0, Math.min(100, (currentBalance / (totalUpcoming || 1)) * 100));

  const status =
    safePercent >= 150 ? 'excellent' :
    safePercent >= 100 ? 'safe' :
    safePercent >= 60 ? 'caution' : 'danger';

  const statusConfig = {
    excellent: { label: 'Utmärkt', color: '#10b981', glow: 'rgba(16,185,129,0.5)', emoji: '🟢', desc: 'Du har god marginal till alla utgifter' },
    safe: { label: 'Säker', color: '#6366f1', glow: 'rgba(99,102,241,0.5)', emoji: '🔵', desc: 'Saldo täcker kommande utgifter' },
    caution: { label: 'Försiktigt', color: '#f59e0b', glow: 'rgba(245,158,11,0.5)', emoji: '🟡', desc: 'Begränsat spelrum denna månad' },
    danger: { label: 'Fara!', color: '#ef4444', glow: 'rgba(239,68,68,0.5)', emoji: '🔴', desc: 'Saldot täcker inte alla utgifter' },
  }[status];

  return (
    <div className="rounded-2xl p-4 border border-white/8" style={{ background: 'rgba(31,41,55,0.7)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: statusConfig.color, boxShadow: `0 0 8px ${statusConfig.glow}` }}
          />
          <span className="text-sm font-bold text-white">Månads-status</span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: `${statusConfig.glow.replace('0.5', '0.15')}`, color: statusConfig.color, border: `1px solid ${statusConfig.glow.replace('0.5', '0.4')}` }}>
          {statusConfig.emoji} {statusConfig.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-white/8 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, safePercent)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full relative"
          style={{ background: `linear-gradient(90deg, ${statusConfig.color}, ${statusConfig.glow.replace('0.5', '0.8')})`, boxShadow: `0 0 10px ${statusConfig.glow}` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg" style={{ transform: 'translate(50%, -50%)' }} />
        </motion.div>
      </div>

      <p className="text-xs text-slate-500 mb-3">{statusConfig.desc}</p>

      {/* Numbers grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/5 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-slate-500 mb-0.5">Saldo</p>
          <p className="text-sm font-bold text-white">{formatNumber(currentBalance)} kr</p>
        </div>
        <div className="bg-rose-500/10 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-slate-500 mb-0.5">Kritiska</p>
          <p className="text-sm font-bold text-rose-300">{formatNumber(totalUpcomingCritical)} kr</p>
        </div>
        <div className="bg-indigo-500/10 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-slate-500 mb-0.5">Livsstil</p>
          <p className="text-sm font-bold text-indigo-300">{formatNumber(totalUpcomingLifestyle)} kr</p>
        </div>
      </div>
    </div>
  );
}