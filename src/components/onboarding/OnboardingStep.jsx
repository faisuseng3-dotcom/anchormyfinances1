import React from 'react';
import { motion } from 'framer-motion';
import { sectionSubtitleClass } from '@/lib/anchorTheme';

export default function OnboardingStep({ children, title, subtitle, step, totalSteps }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="flex-1 px-5 sm:px-6 pt-20 pb-12 overflow-y-auto"
      style={{ paddingBottom: 'max(3rem, calc(env(safe-area-inset-bottom) + 2rem))' }}
    >
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-[26px] font-semibold text-white leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && <p className={`${sectionSubtitleClass} mt-2 text-[15px]`}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </motion.div>
  );
}
