import React from 'react';
import { motion } from 'framer-motion';
import { sectionSubtitleClass } from '@/lib/anchorTheme';
import { pageEnter } from '@/lib/motionPresets';

export default function OnboardingStep({ children, title, subtitle, step: _step, totalSteps: _totalSteps }) {
  return (
    <motion.div
      className="flex-1 px-5 sm:px-6 pt-[calc(env(safe-area-inset-top)+4.5rem)] pb-12 overflow-y-auto"
      style={{ paddingBottom: 'max(3rem, calc(env(safe-area-inset-bottom) + 2rem))' }}
      {...pageEnter}
    >
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="anchor-type-display">{title}</h1>
          {subtitle && (
            <p className={`${sectionSubtitleClass} mt-3 text-[15px] leading-relaxed`}>{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </motion.div>
  );
}
