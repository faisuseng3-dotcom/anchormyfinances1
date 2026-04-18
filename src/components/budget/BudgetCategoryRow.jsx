import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const CATEGORY_LABELS = {
  food: 'Mat', transport: 'Transport', entertainment: 'Nöje',
  travel: 'Resa', health: 'Hälsa', home: 'Bostad',
  shopping: 'Shopping', other: 'Övrigt'
};

const CATEGORY_EMOJIS = {
  food: '🛒', transport: '🚌', entertainment: '🎬',
  travel: '✈️', health: '💊', home: '🏠',
  shopping: '🛍️', other: '📦'
};

function getBarColor(pct) {
  if (pct >= 1) return '#E53E3E';
  if (pct >= 0.8) return '#D69E2E';
  if (pct >= 0.5) return '#D69E2E';
  return '#0D7377';
}

function getStatusText(pct, remaining) {
  if (pct >= 1) return `${Math.abs(remaining).toLocaleString('sv-SE')} kr över budget`;
  if (pct >= 0.8) return `Bara ${remaining.toLocaleString('sv-SE')} kr kvar`;
  return `${remaining.toLocaleString('sv-SE')} kr kvar`;
}

export default function BudgetCategoryRow({ category, spent, limit, onEdit }) {
  const pct = limit > 0 ? Math.min(spent / limit, 1.05) : 0;
  const remaining = limit - spent;
  const barColor = getBarColor(pct);
  const label = CATEGORY_LABELS[category] || category;
  const emoji = CATEGORY_EMOJIS[category] || '📦';

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onEdit(category)}
      className="flex items-center gap-4 px-5 py-4 cursor-pointer"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
    >
      <span className="text-xl flex-shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
            {spent.toLocaleString('sv-SE')} / {limit > 0 ? limit.toLocaleString('sv-SE') : '–'} kr
          </p>
        </div>
        {limit > 0 ? (
          <>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(pct * 100, 100)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: barColor }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: barColor }}>{getStatusText(pct, remaining)}</p>
          </>
        ) : (
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Tryck för att sätta budgetgräns</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
    </motion.div>
  );
}