import React from 'react';
import { motion } from 'framer-motion';
import { BUDGET_CATEGORY_META, getBudgetBarColor } from '@/lib/budgetCategories';
import { getCategoryTint } from '@/lib/copilotTheme';
import CopilotProgressRing from '@/components/ui-premium/copilot/CopilotProgressRing';
import { CategoryIcon } from '@/lib/anchorIcons';

export default function BudgetCategoryCard({ category, spent, limit, onEdit, index = 0 }) {
  const meta = BUDGET_CATEGORY_META[category] || BUDGET_CATEGORY_META.other;
  const tint = getCategoryTint(category);
  const pct = limit > 0 ? spent / limit : 0;
  const ringPct = limit > 0 ? Math.min(100, pct * 100) : 0;
  const remaining = limit - spent;
  const barColor = getBudgetBarColor(Math.min(pct, 1.05));
  const over = limit > 0 && spent > limit;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onEdit(category)}
      className="flex-shrink-0 w-[168px] snap-start p-4 rounded-2xl text-left organic-surface bg-[var(--copilot-bg-card)] hover:bg-[var(--copilot-bg-card-hover)] transition-colors"
      style={{ background: `linear-gradient(145deg, ${tint.bg}, var(--copilot-bg-card))` }}
    >
      <div className="flex items-center justify-between mb-3">
        <CategoryIcon category={category} size={18} color={tint.accent} />
        {limit > 0 && (
          <CopilotProgressRing
            value={ringPct}
            max={100}
            size={44}
            stroke={4}
            color={barColor}
            label={`${Math.round(ringPct)}%`}
          />
        )}
      </div>
      <p className="text-[14px] font-semibold text-white">{meta.label}</p>
      <p className="text-[12px] text-[var(--copilot-text-muted)] mt-1 tabular-nums">
        {spent.toLocaleString('sv-SE')} / {limit > 0 ? `${limit.toLocaleString('sv-SE')} kr` : 'sätt gräns'}
      </p>
      {limit > 0 && (
        <p
          className="text-[11px] mt-2 font-medium"
          style={{ color: over ? '#e2857a' : 'var(--copilot-accent-green)' }}
        >
          {over
            ? `${Math.abs(remaining).toLocaleString('sv-SE')} kr över`
            : `${Math.max(0, remaining).toLocaleString('sv-SE')} kr kvar`}
        </p>
      )}
    </motion.button>
  );
}
