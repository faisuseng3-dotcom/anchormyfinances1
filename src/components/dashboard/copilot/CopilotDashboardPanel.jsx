import React from 'react';
import { motion } from 'framer-motion';
import { staggerItem } from '@/lib/motionPresets';

/**
 * Flytande dashboard-panel — organic premium, ingen hård border.
 */
export default function CopilotDashboardPanel({
  title,
  subtitle,
  action,
  children,
  index = 0,
  className = '',
}) {
  return (
    <motion.section
      {...staggerItem(index)}
      className={`organic-surface rounded-[24px] p-5 active:scale-[0.995] transition-transform ${className}`}
      style={{ background: 'var(--copilot-bg-card)' }}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--copilot-text-muted)]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-[14px] text-[var(--copilot-text-secondary)] mt-1 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}
