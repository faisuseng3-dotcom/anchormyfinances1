import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { VALID_CATEGORIES } from '@/lib/categoryRouter';

const CATEGORY_COLORS = {
  food: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  transport: { bg: 'rgba(59,130,246,0.1)', color: '#2563eb' },
  entertainment: { bg: 'rgba(168,85,247,0.1)', color: '#9333ea' },
  shopping: { bg: 'rgba(249,115,22,0.1)', color: '#ea580c' },
  health: { bg: 'rgba(236,72,153,0.1)', color: '#db2777' },
  home: { bg: 'rgba(20,184,166,0.1)', color: '#0d9488' },
  savings: { bg: 'rgba(13,115,119,0.1)', color: '#0D7377' },
  income: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  other: { bg: 'rgba(148,163,184,0.1)', color: '#64748b' },
};

const CATEGORY_LABELS = {
  food: 'Mat',
  transport: 'Transport',
  entertainment: 'Nöje',
  shopping: 'Shopping',
  health: 'Hälsa',
  home: 'Boende',
  savings: 'Sparande',
  income: 'Inkomst',
  other: 'Övrigt',
};

export default function CSVPreviewTable({ rows, onConfirm, onCancel, onCategoryChange, isLoading }) {
  if (!rows?.length) return null;

  const reviewCount = rows.filter((r) => r._needsReview).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold" style={{ color: '#1A2332' }}>
          {rows.length} transaktioner hittade
        </p>
        <p className="text-xs text-right" style={{ color: '#9AA5B4' }}>
          {reviewCount > 0 ? `${reviewCount} behöver granskas` : 'Kategoriserade'}
        </p>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="max-h-80 overflow-y-auto">
          {rows.map((row, i) => {
            const cat = row._category || 'other';
            const style = CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;
            const needsReview = row._needsReview;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-2 px-3 py-3"
                style={{
                  borderBottom: i < rows.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  background: i % 2 === 0 ? '#fff' : '#FAFBFC',
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: '#1A2332' }}>
                    {row._description || '—'}
                  </p>
                  <p className="text-[10px]" style={{ color: '#9AA5B4' }}>
                    {row._date || '—'}
                  </p>
                </div>

                {needsReview && (
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#D69E2E' }} aria-hidden />
                )}

                {onCategoryChange ? (
                  <select
                    value={cat}
                    onChange={(e) => onCategoryChange(i, e.target.value)}
                    className="text-[10px] font-semibold rounded-lg px-1.5 py-1 max-w-[88px] border-0"
                    style={{ background: style.bg, color: style.color }}
                    aria-label="Ändra kategori"
                  >
                    {VALID_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {CATEGORY_LABELS[cat] || cat}
                  </span>
                )}

                <p
                  className="text-xs font-bold w-16 text-right tabular-nums flex-shrink-0"
                  style={{ color: (row._amount || 0) < 0 ? '#E53E3E' : '#0D7377' }}
                >
                  {Number(row._amount || 0).toLocaleString('sv-SE')} kr
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-2xl text-sm font-semibold"
          style={{ background: '#ECEEF1', color: '#4A5568' }}
        >
          Avbryt
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
          style={{ background: '#0D7377', opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {isLoading ? 'Sparar...' : `Spara ${rows.length} transaktioner`}
        </button>
      </div>
    </div>
  );
}
