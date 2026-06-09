import React from 'react';
import { motion } from 'framer-motion';
import { getCategoryTint } from '@/lib/copilotTheme';
import { cn } from '@/lib/utils';

const cardClass =
  'w-full flex items-center gap-3 p-3.5 rounded-2xl text-left bg-[var(--copilot-bg-card)] border border-[var(--copilot-border)] transition-colors duration-150';

/**
 * Asymmetric card row with tinted icon background — replaces plain list rows.
 * @param {{ category?: string; icon?: React.ReactNode; title: string; subtitle?: string; amount?: string; amountPositive?: boolean; onClick?: () => void; className?: string; trailing?: React.ReactNode }} props
 */
export default function TintIconCard({
  category = 'other',
  icon,
  title,
  subtitle,
  amount,
  amountPositive,
  onClick,
  className = '',
  trailing,
}) {
  const tint = getCategoryTint(category);
  const displayIcon = icon || tint.emoji;

  const inner = (
    <>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
        style={{ background: tint.bg }}
      >
        {displayIcon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-white truncate">{title}</p>
        {subtitle && (
          <p className="text-[12px] text-[var(--copilot-text-muted)] mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      {amount != null && (
        <p
          className={cn(
            'text-[14px] font-semibold tabular-nums flex-shrink-0',
            amountPositive ? 'text-[var(--copilot-accent-green)]' : 'text-white',
          )}
        >
          {amount}
        </p>
      )}
      {trailing}
    </>
  );

  if (onClick) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.98, opacity: 0.85 }}
        transition={{ duration: 0.12 }}
        className={cn(cardClass, 'hover:bg-[var(--copilot-bg-card-hover)] cursor-pointer', className)}
      >
        {inner}
      </motion.button>
    );
  }

  return <div className={cn(cardClass, className)}>{inner}</div>;
}
