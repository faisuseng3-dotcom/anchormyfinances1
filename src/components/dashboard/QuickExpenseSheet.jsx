import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useOptimisticTransactions } from '@/hooks/useOptimisticTransactions';
import { elevatedSheet } from '@/lib/anchorTheme';

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

/**
 * Minimal utgiftsformulär: belopp, kategori, datum.
 * Optimistisk sparning — stängs direkt vid Spara.
 */
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/65 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 340 }}
          className="w-full max-w-lg rounded-t-[28px] overflow-hidden"
          style={elevatedSheet()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/15" />
          </div>

          <div className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-semibold text-white">Ny utgift</h2>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center"
                aria-label="Stäng"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[12px] text-white/45 mb-1.5 block">Belopp</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                    className="w-full h-14 rounded-2xl bg-white/[0.06] ring-1 ring-white/[0.1] text-center text-2xl font-semibold text-rose-300 tabular-nums outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-white/40">kr</span>
                </div>
              </div>

              <div>
                <label className="text-[12px] text-white/45 mb-2 block">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-full text-[13px] font-medium transition-colors ${
                        category === cat.id
                          ? 'bg-white text-[#050d28]'
                          : 'bg-white/[0.06] text-white/70 ring-1 ring-white/[0.08]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[12px] text-white/45 mb-1.5 block">Datum</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 rounded-xl bg-white/[0.06] ring-1 ring-white/[0.1] text-white text-[15px] px-3 outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={!amount || parseInt(amount, 10) <= 0}
              className="w-full mt-6 h-12 rounded-full bg-white text-[#050d28] font-semibold text-[15px] disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Spara
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
