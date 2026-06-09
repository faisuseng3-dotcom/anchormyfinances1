import React from 'react';
import { motion } from 'framer-motion';

/**
 * Gemensam layout för verktygsvyer i copilot-main.
 */
export default function CopilotToolShell({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`copilot-tool-view px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto ${className}`}>
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-start justify-between gap-4 mb-8"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--copilot-text-muted)]">
            Verktyg
          </p>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-white tracking-tight mt-1">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[14px] text-[var(--copilot-text-secondary)] mt-2 leading-relaxed max-w-xl">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </motion.header>
      {children}
    </div>
  );
}
