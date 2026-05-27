import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DebtAnalysisView from './DebtAnalysisView';
import { DashboardSection } from './DashboardChrome';
import { sectionMetaClass } from '@/lib/anchorTheme';

export default function DebtDashboardCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DashboardSection title="Skuld">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen(true)}
          className="w-full text-left py-1 active:opacity-70"
        >
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p
                className="font-semibold leading-none tracking-tight text-white tabular-nums"
                style={{ fontSize: 'clamp(1.75rem, 7vw, 2.15rem)' }}
              >
                180 000
                <span className="text-lg font-medium ml-1 text-white/40">kr</span>
              </p>
              <p className={`${sectionMetaClass} mt-2`}>CSN · 0,59% ränta · 850 kr/mån</p>
            </div>
            <span className="text-[13px] font-medium text-emerald-300/90 flex-shrink-0">Förmånligt</span>
          </div>
        </motion.button>
      </DashboardSection>

      <AnimatePresence>
        {open && <DebtAnalysisView onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
