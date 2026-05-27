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
  if (pct >= 1) return '#FF8A9A';
  if (pct >= 0.8) return '#FCD34D';
  return '#5B8CFF';
}

function getStatusText(pct, remaining) {
  if (pct >= 1) return `${Math.abs(remaining).toLocaleString('sv-SE')} kr över`;
  if (pct >= 0.8) return `${remaining.toLocaleString('sv-SE')} kr kvar`;
  return `${remaining.toLocaleString('sv-SE')} kr kvar`;
}

export default function BudgetCategoryRow({ category, spent, limit, onEdit }) {
  const pct = limit > 0 ? Math.min(spent / limit, 1.05) : 0;
  const remaining = limit - spent;
  const barColor = getBarColor(pct);
  const label = CATEGORY_LABELS[category] || category;
  const emoji = CATEGORY_EMOJIS[category] || '📦';

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={() => onEdit(category)}
      className="flex items-center gap-3 py-3.5 w-full text-left active:opacity-60"
    >
      <span className="text-xl flex-shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[15px] font-medium text-white">{label}</p>
          <p className="text-[13px] text-white/45 tabular-nums">
            {spent.toLocaleString('sv-SE')} / {limit > 0 ? limit.toLocaleString('sv-SE') : '–'} kr
          </p>
        </div>
        <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(pct * 100, 100)}%`, background: barColor }}
          />
        </div>
        <p className="text-[12px] text-white/40 mt-1.5">{getStatusText(pct, remaining)}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-white/25 flex-shrink-0" />
    </motion.button>
  );
}
