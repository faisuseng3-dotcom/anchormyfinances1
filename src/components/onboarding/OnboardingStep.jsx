import React from 'react';
import { motion } from 'framer-motion';
import { sectionSubtitleClass } from '@/lib/anchorTheme';

export default function OnboardingStep({ children, title, subtitle, step, totalSteps }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="min-h-screen px-5 sm:px-6 pt-14 pb-12 overflow-y-auto anchor-page"
      style={{ paddingBottom: 'max(3rem, calc(env(safe-area-inset-bottom) + 2rem))' }}
    >
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps || 0 }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-white/90' : 'bg-white/15'
              }`}
            />
          ))}
        </div>

        <div className="mb-8">
          <p className="text-[15px] text-white/50 mb-2">Steg {step + 1} av {totalSteps}</p>
          <h1 className="text-[26px] font-semibold text-white leading-tight tracking-tight">{title}</h1>
          {subtitle && <p className={`${sectionSubtitleClass} mt-2`}>{subtitle}</p>}
        </div>

        {children}
      </div>
    </motion.div>
  );
}
