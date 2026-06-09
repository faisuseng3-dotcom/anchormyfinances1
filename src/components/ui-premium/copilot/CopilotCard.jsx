import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * @param {{ children: React.ReactNode; className?: string; onClick?: () => void; as?: any; [key: string]: any }} props
 */
export default function CopilotCard({
  children,
  className = '',
  onClick,
  as: Component = onClick ? motion.button : 'div',
  ...props
}) {
  const base = cn(
    'copilot-surface-card rounded-2xl border border-[var(--copilot-border)] p-5 text-left w-full',
    onClick && 'cursor-pointer hover:bg-[var(--copilot-bg-card-hover)] active:scale-[0.99] transition-all duration-150',
    className,
  );

  if (onClick) {
    return (
      <Component type="button" className={base} onClick={onClick} whileTap={{ scale: 0.98 }} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <Component className={base} {...props}>
      {children}
    </Component>
  );
}

export function CopilotCardHeader({ title, action, meta }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div>
        {meta && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--copilot-text-muted)] mb-1">
            {meta}
          </p>
        )}
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--copilot-text-secondary)]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
