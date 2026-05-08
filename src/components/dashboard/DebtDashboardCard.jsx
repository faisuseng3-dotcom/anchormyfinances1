/**
 * DebtDashboardCard — kompakt dashboard-widget
 * Visar bara: titel, siffra, subline, FÖRMÅNLIGT-badge.
 * Klick öppnar DebtAnalysisView i fullskärm.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DebtAnalysisView from './DebtAnalysisView';

export default function DebtDashboardCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        className="w-full text-left mx-4 rounded-3xl p-5"
        style={{
          width: 'calc(100% - 2rem)',
          background: 'rgba(8,12,22,0.97)',
          border: '1px solid rgba(15,222,189,0.20)',
          boxShadow: '0 0 24px rgba(15,222,189,0.05)',
        }}
      >
        {/* Titel */}
        <p className="text-[9px] font-black tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
          MIN SKULD-KOLL
        </p>

        {/* Huvud-rad */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-black leading-none" style={{ fontSize: 34, color: '#fff', letterSpacing: '-0.02em' }}>
              180 000
              <span className="text-lg font-black ml-1" style={{ color: 'rgba(255,255,255,0.30)' }}>kr</span>
            </p>
            <p className="text-xs mt-1.5 font-semibold" style={{ color: 'rgba(255,255,255,0.40)' }}>
              CSN · 0,59% ränta · 850 kr/mån
            </p>
          </div>

          {/* FÖRMÅNLIGT badge */}
          <span
            className="px-3 py-1.5 rounded-full text-[10px] font-black flex-shrink-0"
            style={{
              background: 'rgba(15,222,189,0.12)',
              color: '#0FDEBD',
              border: '1px solid rgba(15,222,189,0.28)',
              letterSpacing: '0.04em',
            }}
          >
            FÖRMÅNLIGT
          </span>
        </div>
      </motion.button>

      {/* Fullskärms-analys */}
      <AnimatePresence>
        {open && <DebtAnalysisView onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}