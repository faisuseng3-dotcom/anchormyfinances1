import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { BUDGET_CATEGORY_META } from '@/lib/budgetCategories';
import {
  anchorInputClass,
  anchorPrimaryButtonClass,
  anchorSecondaryButtonClass,
  anchorIconButtonClass,
  elevatedSheet,
  sectionMetaClass,
  sectionSubtitleClass,
} from '@/lib/anchorTheme';

export default function SetBudgetModal({ category, currentLimit, onSave, onClose }) {
  const [amount, setAmount] = useState(currentLimit ? String(currentLimit) : '');
  const meta = BUDGET_CATEGORY_META[category] || BUDGET_CATEGORY_META.other;
  const Icon = meta.Icon;

  const handleSave = () => {
    const val = parseFloat(String(amount).replace(/\s/g, '').replace(',', '.'));
    if (!isNaN(val) && val > 0) onSave(category, val);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 380 }}
          className="w-full max-w-md rounded-t-[22px] px-5 pt-4 pb-10"
          style={elevatedSheet()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pb-2">
            <div className="w-9 h-1 rounded-full bg-white/20" />
          </div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/[0.1]"
                style={{ background: `${meta.color}18` }}
              >
                <Icon className="w-5 h-5" style={{ color: meta.color }} />
              </div>
              <div>
                <p className={sectionMetaClass}>Budgetgräns</p>
                <h2 className="text-[17px] font-semibold text-white">{meta.label}</h2>
              </div>
            </div>
            <button type="button" onClick={onClose} className={anchorIconButtonClass} aria-label="Stäng">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className={`${sectionSubtitleClass} mb-4`}>
            Max belopp per månad för {meta.label.toLowerCase()}.
          </p>

          <div className="relative mb-6">
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d\s]/g, ''))}
              placeholder="0"
              autoFocus
              className={`${anchorInputClass} text-center text-2xl font-semibold pr-12`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">kr</span>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className={`${anchorSecondaryButtonClass} flex-1 h-12`}>
              Avbryt
            </button>
            <button type="button" onClick={handleSave} className={`${anchorPrimaryButtonClass} flex-1 h-12`}>
              Spara gräns
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
