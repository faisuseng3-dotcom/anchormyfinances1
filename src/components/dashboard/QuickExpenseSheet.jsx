import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useOptimisticTransactions } from '@/hooks/useOptimisticTransactions';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import { anchorIconButtonClass, anchorInputClass } from '@/lib/anchorTheme';

const CATEGORIES = [
  { id: 'food', label: 'Mat' },
  { id: 'transport', label: 'Transport' },
  { id: 'entertainment', label: 'Nöje' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'subscriptions', label: 'Abonnemang' },
  { id: 'other', label: 'Övrigt' },
];

const LAST_CAT_KEY = 'anchor_last_expense_category';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function QuickExpenseSheet({ isOpen, onClose, profile }) {
  const { createTransaction } = useOptimisticTransactions();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(todayIso());

  useEffect(() => {
    if (!isOpen) return;
    setAmount('');
    setDate(todayIso());
    try {
      const last = localStorage.getItem(LAST_CAT_KEY);
      if (last && CATEGORIES.some((c) => c.id === last)) setCategory(last);
    } catch {
      /* ignore */
    }
  }, [isOpen]);

  const handleSave = () => {
    const parsed = parseInt(amount.replace(/\s/g, ''), 10);
    if (!parsed || parsed <= 0 || !category) return;

    const catLabel = CATEGORIES.find((c) => c.id === category)?.label || 'Utgift';
    createTransaction({
      type: 'expense',
      amount: parsed,
      label: catLabel,
      vendor: catLabel,
      category,
      created_date: new Date(`${date}T12:00:00`).toISOString(),
    });

    try {
      localStorage.setItem(LAST_CAT_KEY, category);
    } catch {
      /* ignore */
    }

    onClose?.();
  };

  return (
    <AnchorSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Ny utgift"
      maxHeight="min(78dvh, 520px)"
      headerRight={
        <AnchorPressable
          onClick={onClose}
          className={anchorIconButtonClass}
          aria-label="Stäng"
          minTouch
        >
          <X className="w-4 h-4" />
        </AnchorPressable>
      }
    >
      <div className="space-y-5 -mx-1">
        <div>
          <label className="anchor-type-body-sm text-white/45 mb-2 block">Belopp</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
              className="w-full h-14 rounded-[var(--anchor-radius-lg)] bg-white/[0.06] ring-1 ring-white/[0.1] text-center text-2xl font-semibold text-rose-300/90 tabular-nums outline-none anchor-elev-1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-white/40">kr</span>
          </div>
        </div>

        <div>
          <label className="anchor-type-body-sm text-white/45 mb-2 block">Kategori</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <AnchorPressable
                key={cat.id}
                as={motion.button}
                type="button"
                onClick={() => setCategory(cat.id)}
                minTouch={false}
                className={`px-4 py-2.5 min-h-11 rounded-full text-[13px] font-medium ${
                  category === cat.id
                    ? 'bg-[var(--color-text-primary)] text-[#050d28] anchor-elev-1'
                    : 'bg-white/[0.06] text-white/70 ring-1 ring-white/[0.08]'
                }`}
              >
                {cat.label}
              </AnchorPressable>
            ))}
          </div>
        </div>

        <div>
          <label className="anchor-type-body-sm text-white/45 mb-2 block">Datum</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${anchorInputClass} [color-scheme:dark]`}
          />
        </div>

        <AnchorPressable
          as={motion.button}
          type="button"
          onClick={handleSave}
          disabled={!amount || parseInt(amount, 10) <= 0}
          className="w-full mt-2 h-12 rounded-full bg-[var(--color-text-primary)] text-[#050d28] font-semibold text-[15px] disabled:opacity-40 anchor-elev-2 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Spara
        </AnchorPressable>
      </div>
    </AnchorSheet>
  );
}
