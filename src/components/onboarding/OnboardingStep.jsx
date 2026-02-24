import React from 'react';
import { motion } from 'framer-motion';

export default function OnboardingStep({ children, title, subtitle, step, totalSteps }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen px-6 py-8"
    >
      <div className="max-w-md mx-auto">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < step ? 'bg-emerald-500' : i === step ? 'bg-emerald-400' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">{title}</h1>
          {subtitle && <p className="text-slate-400 text-sm leading-relaxed">{subtitle}</p>}
        </div>

        {/* Content */}
        {children}
      </div>
    </motion.div>
  );
}