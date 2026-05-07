import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, Lock, AlertTriangle } from 'lucide-react';
import { toggleAlexMode } from '@/lib/alexMode';

/**
 * Visar en diskret HUD-badge i hörnet när Alex Mode är aktivt.
 * Klicka på X för att deaktivera.
 */
export default function AlexModeHUD({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-4 py-2 rounded-full shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #0D7377, #0a5f63)',
            border: '1px solid rgba(255,255,255,0.2)',
            pointerEvents: 'auto',
          }}
        >
          <Lock className="w-3 h-3 text-white/70" />
          <User className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-black text-white tracking-widest">ALEX MODE</span>
          <span className="text-[9px] text-white/50 font-medium">PERSONAL ONLY</span>
          <button
            onClick={() => toggleAlexMode()}
            className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-3 h-3 text-white/70" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}