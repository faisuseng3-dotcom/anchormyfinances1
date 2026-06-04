import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { BUDGET_CATEGORY_META, getBudgetBarColor, getBudgetStatusText } from '@/lib/budgetCategories';

export default function BudgetCategoryRow({ category, spent, limit, onEdit }) {
  const meta = BUDGET_CATEGORY_META[category] || BUDGET_CATEGORY_META.other;
  const Icon = meta.Icon;
  const pct = limit > 0 ? Math.min(spent / limit, 1.05) : 0;
  const remaining = limit - spent;
  const barColor = getBudgetBarColor(pct);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={() => onEdit(category)}
      className="flex items-center gap-3 py-3.5 w-full text-left active:opacity-60"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/[0.08]"
        style={{ background: `${meta.color}18` }}
      >
        <Icon className="w-5 h-5" style={{ color: meta.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[15px] font-medium text-white">{meta.label}</p>
          <p className="text-[13px] text-white/45 tabular-nums">
            {spent.toLocaleString('sv-SE')} / {limit > 0 ? limit.toLocaleString('sv-SE') : '–'} kr
          </p>
        </div>
        <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${limit > 0 ? Math.min(pct * 100, 100) : 0}%`, background: barColor }}
          />
        </div>
        <p className="text-[12px] text-white/40 mt-1.5">
          {limit > 0 ? getBudgetStatusText(pct, remaining) : 'Tryck för att sätta gräns'}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-white/25 flex-shrink-0" />
    </motion.button>
  );
}
