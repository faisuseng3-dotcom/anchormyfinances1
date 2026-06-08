// @ts-nocheck
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { usePlannedEvents } from '@/hooks/usePlannedEvents';
import { createPlannedEvent, formatDateKey } from '@/lib/planCalendarEngine';
import { anchorInputClass, anchorIconButtonClass } from '@/lib/anchorTheme';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

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
    <AnchorSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Planera händelse"
      maxHeight="min(78dvh, 560px)"
      headerRight={
        <AnchorPressable onClick={onClose} className={anchorIconButtonClass} aria-label="Stäng">
          <X className="w-4 h-4" />
        </AnchorPressable>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 -mx-1">
        <input
          className={anchorInputClass}
          placeholder="T.ex. Middag med vänner"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div className="flex gap-2">
          <input
            type="date"
            className={`${anchorInputClass} flex-1 [color-scheme:dark]`}
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
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <AnchorPressable
              key={c.id}
              type="button"
              minTouch={false}
              onClick={() => setCategory(c.id)}
              className={`px-4 py-2.5 min-h-11 rounded-full text-[12px] font-medium ${
                category === c.id
                  ? 'bg-[var(--color-text-primary)] text-[#050d28] anchor-elev-1'
                  : 'bg-white/[0.06] text-white/65 ring-1 ring-white/[0.08]'
              }`}
            >
              {c.label}
            </AnchorPressable>
          ))}
        </div>
        <AnchorPressable
          type="submit"
          disabled={!title.trim() || saving}
          className="w-full h-12 rounded-full bg-[var(--color-text-primary)] text-[#050d28] font-semibold text-[15px] disabled:opacity-40 anchor-elev-2"
        >
          {saving ? 'Sparar…' : 'Lägg till i kalendern'}
        </AnchorPressable>
      </form>
    </AnchorSheet>
  );
}
