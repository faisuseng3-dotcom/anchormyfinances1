import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Check, ChevronLeft, AlertCircle } from 'lucide-react';
import { CategoryIcon } from '@/lib/anchorIcons';
import { getCategoryTint } from '@/lib/copilotTheme';
import { VALID_CATEGORIES } from '@/lib/categoryRouter';
import CopilotCard from '@/components/ui-premium/copilot/CopilotCard';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import { copilotPrimaryBtnClass, copilotSecondaryBtnClass } from '@/lib/copilotTheme';
import { triggerHaptic } from '@/lib/haptics';

const CATEGORY_LABELS = {
  food: 'Mat', transport: 'Transport', entertainment: 'Nöje', shopping: 'Shopping',
  health: 'Hälsa', home: 'Boende', savings: 'Sparande', income: 'Inkomst', other: 'Övrigt',
};

const SWIPE_THRESHOLD = 80;

/**
 * Aktiv kontroll — swajpa/godkänn transaktioner (Excel-känsla).
 */
export default function TransactionActiveReview({
  rows,
  onCategoryChange,
  onConfirm,
  onCancel,
  isLoading = false,
  getRowKey = (row, i) => i,
  getDescription = (row) => row._description || row.label || '—',
  getDate = (row) => row._date || row.date || '—',
  getAmount = (row) => row._amount ?? row.amount ?? 0,
  getCategory = (row) => row._category || row.category || 'other',
  getNeedsReview = (row) => row._needsReview,
}) {
  const [index, setIndex] = useState(0);
  const [approved, setApproved] = useState(() => new Set());
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-120, 120], [-8, 8]);
  const approveOpacity = useTransform(x, [40, SWIPE_THRESHOLD], [0, 1]);
  const skipOpacity = useTransform(x, [-40, -SWIPE_THRESHOLD], [0, 1]);

  const total = rows?.length || 0;
  const current = rows?.[index];
  const approvedCount = approved.size;

  const advance = useCallback((markApproved) => {
    if (markApproved && current) {
      setApproved((prev) => new Set([...prev, getRowKey(current, index)]));
    }
    if (index < total - 1) {
      setIndex((i) => i + 1);
      x.set(0);
    }
  }, [current, index, total, x, getRowKey]);

  const handleDragEnd = (_e, info) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      triggerHaptic('swipe');
      advance(true);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      triggerHaptic('light');
      advance(false);
    } else x.set(0);
  };

  if (!total) return null;

  const cat = getCategory(current);
  const tint = getCategoryTint(cat);
  const amount = getAmount(current);
  const isNegative = amount < 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-[var(--copilot-text-secondary)]">
          <span className="text-white font-semibold">{index + 1}</span> / {total} ·{' '}
          <span className="text-[var(--copilot-accent-green)]">{approvedCount} godkända</span>
        </p>
        {getNeedsReview?.(current) && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300/90">
            <AlertCircle className="w-3.5 h-3.5" /> Granska
          </span>
        )}
      </div>

      <div className="relative min-h-[220px] flex items-center justify-center">
        <motion.div
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--copilot-accent-green)] font-bold text-sm pointer-events-none"
          style={{ opacity: approveOpacity }}
        >
          GODKÄNN →
        </motion.div>
        <motion.div
          className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-300 font-bold text-sm pointer-events-none"
          style={{ opacity: skipOpacity }}
        >
          ← HOPPA
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={getRowKey(current, index)}
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -60, scale: 0.94 }}
            transition={{ duration: 0.22 }}
            className="w-full max-w-sm cursor-grab active:cursor-grabbing"
          >
            <CopilotCard className="!p-5 touch-pan-y">
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: tint.bg }}
                >
                  <CategoryIcon category={cat} size={20} color={tint.accent} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-semibold text-white leading-snug">
                    {getDescription(current)}
                  </p>
                  <p className="text-[12px] text-[var(--copilot-text-muted)] mt-1">{getDate(current)}</p>
                </div>
                <p className={`text-[17px] font-bold tabular-nums shrink-0 ${isNegative ? 'text-rose-300' : 'text-[var(--copilot-accent-green)]'}`}>
                  {isNegative ? '−' : '+'}{Math.abs(amount).toLocaleString('sv-SE')}
                </p>
              </div>

              {onCategoryChange && (
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--copilot-text-muted)] mb-2">Kategori</p>
                  <div className="flex flex-wrap gap-2">
                    {VALID_CATEGORIES.slice(0, 6).map((c) => (
                      <AnchorPressable
                        key={c}
                        type="button"
                        onClick={() => onCategoryChange(index, c)}
                        minTouch={false}
                        className={`px-3 py-2 min-h-10 rounded-full text-[11px] font-semibold transition-all ${
                          cat === c
                            ? 'bg-[var(--copilot-accent-blue)] text-white'
                            : 'bg-white/[0.06] text-[var(--copilot-text-secondary)]'
                        }`}
                      >
                        {CATEGORY_LABELS[c] || c}
                      </AnchorPressable>
                    ))}
                  </div>
                </div>
              )}
            </CopilotCard>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-3">
        <AnchorPressable
          type="button"
          onClick={() => { triggerHaptic('light'); advance(false); }}
          className="flex-1 flex items-center justify-center gap-2 min-h-12 rounded-2xl bg-white/[0.06] border border-[var(--copilot-border)] text-[var(--copilot-text-secondary)] font-semibold text-[13px] active:scale-[0.98]"
        >
          <ChevronLeft className="w-4 h-4" /> Hoppa över
        </AnchorPressable>
        <AnchorPressable
          type="button"
          onClick={() => { triggerHaptic('success'); advance(true); }}
          className="flex-1 flex items-center justify-center gap-2 min-h-12 rounded-2xl font-semibold text-[13px] text-white active:scale-[0.98]"
          style={{ background: 'rgba(34,217,122,0.2)', border: '1px solid rgba(34,217,122,0.35)' }}
        >
          Godkänn <Check className="w-4 h-4" />
        </AnchorPressable>
      </div>

      {index >= total - 1 && (
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className={copilotSecondaryBtnClass}>
            Avbryt
          </button>
          <button type="button" onClick={onConfirm} disabled={isLoading} className={copilotPrimaryBtnClass}>
            {isLoading ? 'Sparar…' : `Spara alla ${total} transaktioner`}
          </button>
        </div>
      )}

      <p className="text-center text-[11px] text-[var(--copilot-text-muted)]">
        Swajpa höger för att godkänna · vänster för att hoppa
      </p>
    </div>
  );
}
