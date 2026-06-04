import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Calculator, Plus } from 'lucide-react';
import { dashDockBtn } from '@/lib/dashboardTheme';

export default function DashboardActionDock({ onMagicEntry, onOpenCalculator, onOpenExpense }) {
  return (
    <div className="flex gap-2.5 items-stretch">
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onOpenExpense}
        className={`${dashDockBtn} w-14 flex-none bg-white/[0.06] text-white/80 ring-1 ring-white/[0.1]`}
        aria-label="Registrera utgift"
      >
        <Plus className="w-5 h-5" />
      </motion.button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onMagicEntry}
        className={`${dashDockBtn} bg-white text-[#050d28] shadow-[0_0_40px_rgba(255,255,255,0.15)]`}
      >
        <Zap className="w-4 h-4 shrink-0" />
        <span className="anchor-dock-label-long truncate">Snabb inmatning</span>
        <span className="anchor-dock-label-short truncate">Snabb</span>
      </motion.button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onOpenCalculator}
        className={`${dashDockBtn} flex-none w-[52px] bg-white/[0.08] text-white/85 ring-1 ring-white/[0.1]`}
        aria-label="Kalkylator"
      >
        <Calculator className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
