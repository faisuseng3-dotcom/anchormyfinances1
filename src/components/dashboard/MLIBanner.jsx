import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anchor } from 'lucide-react';

/**
 * Visar ett kontextuellt meddelande baserat på MLI-poäng.
 * Hög belastning (>70): lugnande, stöttande ton.
 * Låg belastning (<30): inbjudan till utmaning/Galaxy.
 */
export default function MLIBanner({ mli, greeting }) {
  if (!greeting) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={mli > 70 ? 'supportive' : 'detailed'}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-4 mb-3 flex items-start gap-3 px-4 py-3.5 rounded-[22px]"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 12px 32px rgba(2,8,23,0.25)',
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}
        >
          <Anchor className="w-4 h-4 text-white/80" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45 mb-1">
            Meddelande
          </p>
          <p className="text-[13px] leading-relaxed text-white/80">
            {greeting}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}