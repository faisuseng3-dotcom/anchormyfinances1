import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

/** Flytande + — ett tryck till snabbinmatning. */
export default function QuickExpenseFab({ onClick }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label="Lägg till utgift"
      className="fixed z-40 left-4 sm:left-6 w-14 h-14 rounded-full flex items-center justify-center bg-white text-slate-900 shadow-[0_12px_32px_rgba(0,0,0,0.35)] ring-1 ring-white/20"
      style={{ bottom: 'calc(var(--anchor-nav-height) + var(--anchor-safe-bottom) + 0.75rem)' }}
    >
      <Plus className="w-7 h-7" strokeWidth={2.25} />
    </motion.button>
  );
}
