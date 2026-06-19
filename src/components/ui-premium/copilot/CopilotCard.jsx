import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardEyebrowClass, cardTitleClass } from '@/lib/anchorTheme';

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
    'copilot-surface-card organic-card rounded-3xl p-5 text-left w-full',
    onClick && 'cursor-pointer hover:bg-[var(--copilot-bg-card-hover)] active:scale-[0.97] transition-all duration-300',
    className,
  );

  if (onClick) {
    return (
      <Component
        type="button"
        className={base}
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        {...props}
      >
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
          <p className={`${cardEyebrowClass} mb-1`}>
            {meta}
          </p>
        )}
        <h2 className={cardTitleClass}>
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
