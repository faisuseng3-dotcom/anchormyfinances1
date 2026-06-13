import React from 'react';
import { motion } from 'framer-motion';
import { Shield, PartyPopper } from 'lucide-react';
import { formatNumber } from './pulseEngine';
import { StatusDot } from '@/lib/anchorIcons';

export default function GuiltFreeWindow({ amount, nextCriticalName, nextCriticalDays }) {
  const level = amount > 5000 ? 'great' : amount > 1000 ? 'ok' : amount > 0 ? 'tight' : 'danger';

  const config = {
    great: { color: 'from-emerald-500 to-green-600', glow: 'rgba(16,185,129,0.3)', label: 'Du kan shoppa fritt!', statusKey: 'grön', celebrate: true },
    ok: { color: 'from-blue-500 to-indigo-600', glow: 'rgba(59,130,246,0.3)', label: 'Lite spelrum – var smart', statusKey: 'gul' },
    tight: { color: 'from-amber-500 to-orange-600', glow: 'rgba(245,158,11,0.3)', label: 'Tajt – tänk två gånger', statusKey: 'warning' },
    danger: { color: 'from-rose-500 to-red-600', glow: 'rgba(239,68,68,0.3)', label: 'Spendera ingenting nu', statusKey: 'röd' },
  }[level];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'rgba(31,41,55,0.7)',
        boxShadow: 'var(--anchor-shadow-1)',
        boxShadow: `0 0 30px ${config.glow}`,
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-10`} />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Guilt-Free Window</p>
            <p className="text-[10px] text-slate-600">Vad du kan spendera just nu</p>
          </div>
        </div>

        {/* Big number */}
        <div className="text-center my-4">
          <motion.div
            key={amount}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-5xl font-black bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}
          >
            {formatNumber(amount)}
          </motion.div>
          <p className="text-slate-400 text-sm mt-1">kr disponibelt</p>
        </div>

        {/* Status badge */}
        <div className={`rounded-xl px-3 py-2 bg-gradient-to-r ${config.color} bg-opacity-10 text-center`}
          style={{ background: `${config.glow.replace('0.3', '0.12')}` }}>
          <p className="text-white font-semibold text-sm flex items-center justify-center gap-1.5">
            <StatusDot status={config.statusKey} size={8} />
            {config.label}
            {config.celebrate && <PartyPopper className="w-4 h-4" />}
          </p>
        </div>

        {/* Context */}
        {nextCriticalName && (
          <p className="text-xs text-slate-500 mt-3 text-center">
            Inkl. säkerhetsbuffert innan {nextCriticalName} om {nextCriticalDays} dagar
          </p>
        )}
      </div>
    </motion.div>
  );
}