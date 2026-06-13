import React from 'react';
import { motion } from 'framer-motion';
import { getCategoryTint } from '@/lib/copilotTheme';
import { CategoryIcon } from '@/lib/anchorIcons';
import { cn } from '@/lib/utils';

const cardClass =
  'organic-surface organic-surface--sm w-full flex items-center gap-3 p-4 rounded-3xl text-left bg-[var(--copilot-bg-card)] transition-all duration-300 active:scale-[0.98]';

/**
 * Asymmetric card row with tinted icon background — replaces plain list rows.
 */
export default function TintIconCard({
  category = 'other',
  icon = undefined,
  title,
  subtitle,
  amount,
  amountPositive,
  onClick = undefined,
  className = '',
  trailing = undefined,
}) {
  const tint = getCategoryTint(category);

  const inner = (
    <>
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: tint.bg }}
      >
        {icon || <CategoryIcon category={category} size={18} color={tint.accent} />}
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
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className={cn(cardClass, 'hover:bg-[var(--copilot-bg-card-hover)] cursor-pointer', className)}
      >
        {inner}
      </motion.button>
    );
  }

  return <div className={cn(cardClass, className)}>{inner}</div>;
}
