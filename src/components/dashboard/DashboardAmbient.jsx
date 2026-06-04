import React from 'react';
import { motion } from 'framer-motion';

export default function DashboardAmbient() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[140%] h-[45%] sm:h-[55%] opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(56, 120, 255, 0.35) 0%, transparent 70%)',
        }}
      />
      <motion.div
        className="absolute top-[18%] -right-[15%] w-[55vw] h-[55vw] max-w-[320px] max-h-[320px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(0, 255, 200, 0.25) 0%, transparent 65%)',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.22, 0.32, 0.22] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[25%] -left-[20%] w-[50vw] h-[50vw] max-w-[280px] max-h-[280px] rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(120, 80, 255, 0.3) 0%, transparent 70%)',
        }}
        animate={{ scale: [1.05, 1, 1.05], opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'linear-gradient(180deg, black 0%, transparent 85%)',
        }}
      />
    </div>
  );
}
