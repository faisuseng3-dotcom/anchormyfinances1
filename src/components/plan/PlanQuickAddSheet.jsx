import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePlannedEvents } from '@/hooks/usePlannedEvents';
import { createPlannedEvent, formatDateKey } from '@/lib/planCalendarEngine';
import { anchorInputClass, anchorPrimaryButtonClass, elevatedSheet } from '@/lib/anchorTheme';

const CATEGORIES = [
  { id: 'social', label: 'Middag & umgänge' },
  { id: 'food', label: 'Mat' },
  { id: 'travel', label: 'Resa' },
  { id: 'gift', label: 'Present' },
  { id: 'other', label: 'Annat' },
];

export default function PlanQuickAddSheet({ isOpen, onClose, defaultDate }) {
  const { plannedEvents, savePlannedEvents } = usePlannedEvents();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(defaultDate || formatDateKey(new Date()));
  const [category, setCategory] = useState('social');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const event = createPlannedEvent({
        date,
        title: title.trim(),
        amount,
        category,
      });
      await savePlannedEvents([...plannedEvents, event]);
      setTitle('');
      setAmount('');
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60"
            onClick={onClose}
          />
          <motion.form
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 380 }}
            onSubmit={handleSubmit}
            className="fixed inset-x-0 bottom-0 z-[61] rounded-t-[22px] px-5 pt-5 pb-10 max-h-[85vh] overflow-y-auto"
            style={elevatedSheet()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-semibold text-white">Planera händelse</h2>
              <button type="button" onClick={onClose} className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center">
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            <input
              className={`${anchorInputClass} mb-3`}
              placeholder="T.ex. Middag med vänner"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 mb-3">
              <input
                type="date"
                className={`${anchorInputClass} flex-1`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                className={`${anchorInputClass} w-28`}
                placeholder="kr"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d\s]/g, ''))}
              />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium ${
                    category === c.id ? 'bg-white text-[#0a1628]' : 'bg-white/[0.08] text-white/65'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <button type="submit" disabled={!title.trim() || saving} className={`${anchorPrimaryButtonClass} w-full h-12`}>
              {saving ? 'Sparar…' : 'Lägg till i kalendern'}
            </button>
          </motion.form>
        </>
      )}
    </AnimatePresence>
  );
}
