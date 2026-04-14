import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiquidityTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center gap-1">
      <span className="text-sm font-bold" style={{ color: '#1A2332' }}>Likviditetsmarginal</span>
      <button
        onClick={() => setOpen(v => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: '#F4F6F8' }}>
        <Info className="w-3 h-3" style={{ color: '#9AA5B4', strokeWidth: 1.5 }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 z-50 rounded-2xl p-4 text-xs leading-relaxed"
            style={{
              background: '#1A2332',
              color: '#E8ECF0',
              width: 260,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}>
            Beräknat på dina likvida medel i förhållande till dina kortfristiga skulder enligt Konsumentverkets och Skatteverkets definitioner.
            <div className="absolute -bottom-1.5 left-4 w-3 h-3 rotate-45"
              style={{ background: '#1A2332' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}