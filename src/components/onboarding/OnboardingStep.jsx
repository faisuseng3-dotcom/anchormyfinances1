import React from 'react';
import { motion } from 'framer-motion';

export default function OnboardingStep({ children, title, subtitle, step, totalSteps }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen px-5 sm:px-6 pt-8 pb-12 overflow-y-auto"
      style={{ paddingBottom: 'max(3rem, calc(env(safe-area-inset-bottom) + 2rem))' }}
    >
      <div className="max-w-md mx-auto">
        <div className="rounded-3xl p-5 sm:p-6 border border-white/10 backdrop-blur-xl"
          style={{
            background: 'linear-gradient(180deg, rgba(15,23,42,0.82) 0%, rgba(17,24,39,0.72) 100%)',
            boxShadow: '0 12px 40px rgba(2,6,23,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
          {/* Progress */}
          <div className="flex items-center gap-2 mb-7">
          {Array.from({ length: totalSteps || 0 }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < step ? 'bg-[#5B7CFA]' : i === step ? 'bg-[#9FB5FF]' : 'bg-white/15'
              }`}
            />
          ))}
          </div>

          {/* Header */}
          <div className="mb-7">
            <p className="text-[10px] uppercase tracking-[0.22em] mb-2 text-white/45">Anchor onboarding</p>
            <h1 className="text-[1.65rem] font-semibold text-white leading-tight mb-2">{title}</h1>
            {subtitle && <p className="text-[#B7C2D9] text-sm leading-relaxed">{subtitle}</p>}
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </motion.div>
  );
}