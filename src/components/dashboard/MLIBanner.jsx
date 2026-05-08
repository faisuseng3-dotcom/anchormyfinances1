import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Anchor } from 'lucide-react';

/**
 * Visar ett kontextuellt meddelande baserat på MLI-poäng.
 * Hög belastning (>70): lugnande, stöttande ton.
 * Låg belastning (<30): inbjudan till utmaning/Galaxy.
 */
export default function MLIBanner({ mli, greeting }) {
  if (!greeting) return null;

  const isHigh = mli > 70;

  return (
    <AnimatePresence>
      <motion.div
        key={mli > 70 ? 'supportive' : 'detailed'}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-4 mb-3 flex items-start gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: isHigh
            ? 'rgba(15,222,189,0.07)'
            : 'rgba(167,139,250,0.10)',
          border: isHigh
            ? '1px solid rgba(15,222,189,0.18)'
            : '1px solid rgba(167,139,250,0.25)',
        }}
      >
        <Anchor className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: isHigh ? '#0FDEBD' : '#a78bfa' }} />
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: isHigh ? 'rgba(15,222,189,0.6)' : 'rgba(167,139,250,0.6)' }}>
            Anchor
          </p>
          <p className="text-xs leading-relaxed" style={{ color: isHigh ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.80)' }}>
            {greeting}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}