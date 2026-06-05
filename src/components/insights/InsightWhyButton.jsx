import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

/**
 * Liten "Varför?" under en insikt — 2 meningar som förklarar logiken.
 */
export default function InsightWhyButton({ why, className = '' }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/45 hover:text-cyan-300/90 transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        Varför?
      </button>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[13px] text-white/55 leading-relaxed mt-2 overflow-hidden"
          >
            {why}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
