import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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

export default function SetBudgetModal({ category, currentLimit, onSave, onClose }) {
  const [amount, setAmount] = useState(currentLimit ? String(currentLimit) : '');

  const handleSave = () => {
    const val = parseFloat(amount.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      onSave(category, val);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md rounded-t-3xl p-6 pb-10"
          style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.08)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{CATEGORY_EMOJIS[category] || '📦'}</span>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Sätt budgetgräns</p>
                <h2 className="text-lg font-black" style={{ color: 'var(--color-text-primary)' }}>
                  {CATEGORY_LABELS[category] || category}
                </h2>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
              <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>

          <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Hur mycket vill du max spendera på {CATEGORY_LABELS[category]?.toLowerCase() || category} per månad?
          </p>

          <div className="relative mb-6">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              className="w-full text-3xl font-black text-center py-4 rounded-2xl outline-none"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '2px solid var(--color-accent)',
              }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: 'var(--color-text-muted)' }}>kr</span>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-semibold text-sm"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}>
              Avbryt
            </button>
            <button onClick={handleSave} className="flex-1 py-3 rounded-2xl font-bold text-sm text-white"
              style={{ background: 'var(--color-accent)' }}>
              Spara gräns
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}