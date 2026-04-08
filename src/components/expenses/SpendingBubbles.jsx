import React from 'react';
import { motion } from 'framer-motion';

const CATEGORY_LABELS = {
  food: 'Mat',
  shopping: 'Shopping',
  transport: 'Transport',
  entertainment: 'Nöje',
  health: 'Hälsa',
  utilities: 'Räkningar',
  other: 'Övrigt',
  home: 'Bostad',
  savings: 'Sparande',
  income: 'Inkomst',
};

const CATEGORY_COLORS = {
  food: '#4B7CF3',
  shopping: '#7C6CF3',
  transport: '#3DAA7A',
  entertainment: '#C8923A',
  health: '#3DAABB',
  utilities: '#8B97A8',
  home: '#5C7CF3',
  savings: '#3DAA7A',
  other: '#5C6B7D',
  income: '#3DAA7A',
};

export default function SpendingBubbles({ categoryTotals }) {
  const entries = Object.entries(categoryTotals).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;

  const total = entries.reduce((s, [, v]) => s + v, 0);
  const maxVal = Math.max(...entries.map(([, v]) => v));

  // Sort by value descending
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <p className="text-xs font-semibold tracking-wide uppercase mb-4" style={{ color: 'var(--color-text-muted)' }}>
        Vart pengarna går
      </p>
      <div className="flex flex-wrap gap-3 items-end justify-start">
        {sorted.map(([cat, val], i) => {
          const pct = val / maxVal;
          const size = Math.round(48 + pct * 56); // 48px–104px
          const color = CATEGORY_COLORS[cat] || '#5C6B7D';
          const share = Math.round((val / total) * 100);

          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: size,
                  height: size,
                  background: `${color}22`,
                  border: `1.5px solid ${color}44`,
                }}
              >
                <div className="text-center px-1">
                  <p className="font-bold leading-none" style={{ fontSize: Math.max(9, size * 0.18), color }}>
                    {share}%
                  </p>
                </div>
              </div>
              <p className="text-center leading-tight" style={{ fontSize: 10, color: 'var(--color-text-muted)', maxWidth: size }}>
                {CATEGORY_LABELS[cat] || cat}
              </p>
              <p className="text-center font-semibold" style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                {val.toLocaleString('sv-SE')} kr
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}