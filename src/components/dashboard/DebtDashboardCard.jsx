/**
 * DebtDashboardCard — kompakt dashboard-widget
 * Visar bara: titel, siffra, subline, FÖRMÅNLIGT-badge.
 * Klick öppnar DebtAnalysisView i fullskärm.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DebtAnalysisView from './DebtAnalysisView';
import { dashboardGlassSurface, dashboardSectionLabelClass } from '@/components/dashboard/dashboardGlass';

export default function DebtDashboardCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        className="w-full text-left mx-4 rounded-[26px] p-5 sm:p-6"
        style={{
          width: 'calc(100% - 2rem)',
          ...dashboardGlassSurface({ border: '1px solid rgba(255,255,255,0.14)' }),
        }}
      >
        {/* Titel */}
        <p className={`${dashboardSectionLabelClass} mb-4`}>
          Min skuld-koll
        </p>

        {/* Huvud-rad */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold leading-none tracking-tight text-white" style={{ fontSize: 'clamp(1.75rem, 7vw, 2.15rem)' }}>
              180 000
              <span className="text-lg font-medium ml-1 text-white/40">kr</span>
            </p>
            <p className="text-[13px] mt-2 font-medium text-white/55">
              CSN · 0,59% ränta · 850 kr/mån
            </p>
          </div>

          {/* FÖRMÅNLIGT badge */}
          <span
            className="px-3 py-1.5 rounded-full text-[10px] font-semibold flex-shrink-0 text-white/90"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.16)',
              letterSpacing: '0.06em',
            }}
          >
            Förmånligt
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