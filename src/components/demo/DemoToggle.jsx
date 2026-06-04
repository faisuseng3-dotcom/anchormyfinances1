import React from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, X } from 'lucide-react';
import { useDemoMode } from './DemoMode';

export default function DemoToggle() {
  const { isDemoMode, toggleDemo } = useDemoMode();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggleDemo}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
      style={{
        background: isDemoMode ? 'rgba(234,88,12,0.12)' : 'rgba(13,115,119,0.1)',
        color: isDemoMode ? '#ea580c' : '#0D7377',
        border: `1px solid ${isDemoMode ? 'rgba(234,88,12,0.25)' : 'rgba(13,115,119,0.2)'}`,
      }}
    >
      {isDemoMode ? <X className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
      {isDemoMode ? 'Stäng Demo' : 'Demo-läge'}
    </motion.button>
  );
}