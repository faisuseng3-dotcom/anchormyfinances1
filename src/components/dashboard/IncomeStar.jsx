import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function IncomeStar({ income }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative flex items-center justify-center" style={{ height: 110 }}>
      {/* Ambient sun corona */}
      <motion.div
        animate={{ scale: [1, 1.18, 1], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 90, height: 90,
          background: 'radial-gradient(circle, rgba(246,173,85,0.5) 0%, transparent 70%)',
          filter: 'blur(14px)',
        }}
      />

      {/* Outer ray ring */}
      <svg className="absolute pointer-events-none" width="110" height="110" viewBox="0 0 110 110">
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * 360;
          const rad = (angle * Math.PI) / 180;
          const x1 = 55 + 40 * Math.cos(rad); const y1 = 55 + 40 * Math.sin(rad);
          const x2 = 55 + 50 * Math.cos(rad); const y2 = 55 + 50 * Math.sin(rad);
          return (
            <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(246,173,85,0.35)" strokeWidth="1.5" strokeLinecap="round"
              animate={{ opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 2 + (i % 3) * 0.5, repeat: Infinity, delay: i * 0.1 }}
            />
          );
        })}
      </svg>

      {/* Core star button */}
      <motion.button
        onClick={() => setExpanded(v => !v)}
        whileTap={{ scale: 0.88 }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 flex items-center justify-center rounded-full cursor-pointer"
        style={{
          width: 56, height: 56,
          background: 'radial-gradient(circle, rgba(254,215,0,0.25) 0%, rgba(246,173,85,0.12) 60%, transparent 100%)',
          border: '1px solid rgba(246,173,85,0.5)',
          boxShadow: '0 0 20px rgba(246,173,85,0.4), inset 0 0 12px rgba(255,215,0,0.15)',
        }}
      >
        <span style={{ fontSize: 22 }}>⭐</span>
      </motion.button>

      {/* Expanded glow beam + label */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0, x: -10 }}
            animate={{ opacity: 1, scaleX: 1, x: 0 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="absolute left-[calc(50%+34px)] flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-full"
            style={{
              background: 'rgba(10,12,22,0.85)',
              border: '1px solid rgba(246,173,85,0.3)',
              backdropFilter: 'blur(12px)',
              transformOrigin: 'left center',
              whiteSpace: 'nowrap',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#F6AD55', boxShadow: '0 0 6px rgba(246,173,85,0.9)' }} />
            <p className="text-sm font-black" style={{ color: '#FED7AA', letterSpacing: '0.02em' }}>
              {fmt(income)} <span style={{ fontSize: 10, color: 'rgba(246,173,85,0.6)', fontWeight: 600 }}>kr / mån</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label below when collapsed */}
      {!expanded && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute bottom-0 text-[8px] font-black tracking-widest"
          style={{ color: 'rgba(246,173,85,0.4)' }}
        >
          INKOMST
        </motion.p>
      )}
    </div>
  );
}