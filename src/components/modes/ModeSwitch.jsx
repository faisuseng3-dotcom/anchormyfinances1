import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModeContext } from './ModeContext';
import { Briefcase, User } from 'lucide-react';

export default function ModeSwitch({ compact = false }) {
  const { mode, toggleMode, isBusiness } = useModeContext();

  return (
    <motion.button
      onClick={toggleMode}
      whileTap={{ scale: 0.95 }}
      className="relative flex items-center rounded-full overflow-hidden select-none"
      style={{
        background: isBusiness
          ? 'linear-gradient(135deg, #1A2B3C 0%, #0f1e2e 100%)'
          : 'linear-gradient(135deg, #1C2B3F 0%, #141E2E 100%)',
        border: isBusiness ? '1.5px solid rgba(212,175,55,0.5)' : '1.5px solid rgba(75,124,243,0.4)',
        padding: compact ? '6px 14px' : '8px 18px',
        gap: '8px',
      }}
    >
      <AnimatePresence mode="wait">
        {isBusiness ? (
          <motion.div key="biz" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" style={{ color: '#D4AF37' }} />
            {!compact && <span className="text-xs font-bold tracking-wide" style={{ color: '#D4AF37', fontFamily: 'Inter, sans-serif' }}>BUSINESS</span>}
          </motion.div>
        ) : (
          <motion.div key="personal" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} className="flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            {!compact && <span className="text-xs font-bold tracking-wide" style={{ color: 'var(--color-accent)' }}>PERSONAL</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}