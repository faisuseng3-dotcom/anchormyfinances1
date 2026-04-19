import React from 'react';
import { motion } from 'framer-motion';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function LiquidityCell({ safeToSpend }) {
  const isEmpty  = safeToSpend <= 0;
  const isTight  = safeToSpend > 0 && safeToSpend <= 1000;
  const isOk     = safeToSpend > 1000 && safeToSpend <= 5000;
  const isGreat  = safeToSpend > 5000;

  const fillPct  = isEmpty ? 0 : Math.min(100, (safeToSpend / 10000) * 100);
  const color    = isEmpty ? '#FF4466' : isTight ? '#F6AD55' : isOk ? '#0FDEBD' : '#22d3ee';
  const glow     = isEmpty ? 'rgba(255,68,102,0.5)' : isTight ? 'rgba(246,173,85,0.4)' : 'rgba(15,222,189,0.4)';
  const label    = isEmpty ? 'STOPP: Prioritera buffert' : isTight ? 'Tight – tänk två gånger' : isOk ? 'OK spelrum – var smart' : 'Grön zon – du kan shoppa!';

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Battery/Cell container */}
      <div className="relative flex flex-col items-center">
        {/* Battery tip */}
        <div className="w-8 h-2 rounded-sm mb-0.5"
          style={{ background: `${color}50`, border: `1px solid ${color}60` }} />

        {/* Battery body */}
        <div className="relative rounded-2xl overflow-hidden"
          style={{
            width: 64, height: 140,
            background: 'rgba(8,10,20,0.9)',
            border: `2px solid ${color}50`,
            boxShadow: isEmpty
              ? `0 0 20px ${glow}, inset 0 0 16px rgba(255,68,102,0.1)`
              : `0 0 16px ${glow}50`,
          }}
        >
          {/* Fill liquid */}
          {!isEmpty && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${fillPct}%` }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              className="absolute bottom-0 left-0 right-0"
              style={{ background: `linear-gradient(180deg, ${color}90 0%, ${color} 100%)` }}
            >
              {/* Wave on top of liquid */}
              <svg viewBox="0 0 64 12" className="absolute -top-2 left-0 right-0 w-full" preserveAspectRatio="none" height="12">
                <motion.path
                  d="M0,6 C10,12 22,0 32,6 C42,12 54,0 64,6 L64,12 L0,12 Z"
                  fill={`${color}90`}
                  animate={{ d: [
                    'M0,6 C10,12 22,0 32,6 C42,12 54,0 64,6 L64,12 L0,12 Z',
                    'M0,6 C12,0 24,12 32,6 C40,0 52,12 64,6 L64,12 L0,12 Z',
                    'M0,6 C10,12 22,0 32,6 C42,12 54,0 64,6 L64,12 L0,12 Z',
                  ]}}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </svg>
            </motion.div>
          )}

          {/* Empty pulsing red */}
          {isEmpty && (
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="absolute inset-0"
              style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,68,102,0.2) 0%, transparent 70%)' }}
            />
          )}

          {/* Tick marks */}
          {[25, 50, 75].map(tick => (
            <div key={tick} className="absolute left-1 right-1"
              style={{ bottom: `${tick}%`, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          ))}
        </div>
      </div>

      {/* Amount */}
      <motion.p
        key={safeToSpend}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-lg font-black text-center"
        style={{ color, lineHeight: 1 }}
      >
        {isEmpty ? '0' : fmt(safeToSpend)}
        <span className="text-xs font-semibold ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>kr</span>
      </motion.p>

      {/* Label */}
      <p className="text-[9px] font-black tracking-widest text-center max-w-[80px]"
        style={{ color: `${color}bb` }}>
        {label}
      </p>
    </div>
  );
}