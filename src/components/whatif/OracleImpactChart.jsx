import React from 'react';
import { motion } from 'framer-motion';

const fmt = v => Math.abs(Math.round(v)).toLocaleString('sv-SE');
const sign = v => v >= 0 ? '+' : '-';

export default function OracleImpactChart({ current, simulated }) {
  const maxAbs = Math.max(Math.abs(current), Math.abs(simulated), 1);
  const currentPct = Math.min(100, (Math.abs(current) / maxAbs) * 100);
  const simPct = Math.min(100, (Math.abs(simulated) / maxAbs) * 100);
  const isWorst = simulated < current;

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Visuell påverkan på marginalen</p>

      {/* Current */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Nuläge</span>
          <span className={`text-sm font-bold ${current >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {sign(current)}{fmt(current)} kr
          </span>
        </div>
        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${currentPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${current >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
          />
        </div>
      </div>

      {/* Simulated */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Simulerat läge</span>
          <span className={`text-sm font-bold ${simulated >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {sign(simulated)}{fmt(simulated)} kr
          </span>
        </div>
        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${simPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className={`h-full rounded-full ${simulated >= 0 ? 'bg-indigo-500' : 'bg-rose-600'}`}
          />
        </div>
      </div>

      {/* Delta */}
      <div className={`flex items-center justify-between rounded-xl px-4 py-2 ${isWorst ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
        <span className="text-xs text-slate-400">Förändring</span>
        <span className={`text-base font-black ${isWorst ? 'text-rose-400' : 'text-emerald-400'}`}>
          {sign(simulated - current)}{fmt(Math.abs(simulated - current))} kr
        </span>
      </div>
    </div>
  );
}