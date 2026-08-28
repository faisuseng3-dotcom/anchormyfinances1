// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { BUDGET_CATEGORY_META } from '@/lib/budgetCategories';
import { CategoryIcon } from '@/lib/anchorIcons';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function getStatus(pct) {
  if (pct >= 1)   return { color: 'var(--color-danger)', bg: 'var(--color-danger-soft)' };
  if (pct >= 0.8) return { color: 'var(--color-warning)', bg: 'var(--color-warning-soft)' };
  return              { color: 'var(--color-success)', bg: 'var(--color-success-soft)' };
}

export default function BudgetCategoryRow({ category, spent, limit, onEdit, prevSpent = 0 }) {
  const meta   = BUDGET_CATEGORY_META[category] || BUDGET_CATEGORY_META.other;
  const pct    = limit > 0 ? spent / limit : 0;
  const over   = limit > 0 && spent > limit;
  const left   = Math.max(0, limit - spent);
  const status = getStatus(pct);
  const trend  = prevSpent > 0 ? spent - prevSpent : null;

  return (
    <motion.button
      type="button"
      onClick={() => onEdit(category)}
      whileTap={{ scale: 0.985 }}
      className="w-full text-left rounded-2xl p-4 touch-manipulation"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: status.bg }}>
          <CategoryIcon category={category} size={16} color={meta.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">{meta.label}</span>
            <div className="flex items-center gap-2">
              {trend !== null && Math.abs(trend) > 50 && (
                <span className="text-[11px]" style={{ color: trend > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {trend > 0 ? '↑' : '↓'}{fmt(Math.abs(trend))} kr
                </span>
              )}
              <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            {limit > 0 ? (
              over
                ? <span className="text-[12px] font-medium" style={{ color: 'var(--color-danger)' }}>{fmt(spent - limit)} kr över gränsen</span>
                : <span className="text-[12px] text-[var(--color-text-secondary)]"><span className="text-[var(--color-text-primary)] font-medium">{fmt(left)} kr</span> kvar av {fmt(limit)} kr</span>
            ) : (
              <span className="text-[12px] text-[var(--color-text-muted)]">Tryck för att sätta gräns</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-background-secondary)' }}>
        {limit > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, pct * 100)}%` }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: status.color }}
          />
        )}
      </div>
    </motion.button>
  );
}
