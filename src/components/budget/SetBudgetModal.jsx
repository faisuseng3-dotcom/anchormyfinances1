import React, { useState } from 'react';
import { BUDGET_CATEGORY_META } from '@/lib/budgetCategories';
import { getCategoryTint } from '@/lib/copilotTheme';
import { copilotPrimaryBtnClass, copilotInputClass } from '@/lib/copilotTheme';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

export default function SetBudgetModal({ category, currentLimit, onSave, onClose }) {
  const [amount, setAmount] = useState(currentLimit ? String(currentLimit) : '');
  const meta = BUDGET_CATEGORY_META[category] || BUDGET_CATEGORY_META.other;
  const tint = getCategoryTint(category);
  const Icon = meta.Icon;

  const handleSave = () => {
    const val = parseFloat(String(amount).replace(/\s/g, '').replace(',', '.'));
    if (!isNaN(val) && val > 0) onSave(category, val);
  };

  return (
    <AnchorSheet isOpen onClose={onClose} title={`Budget — ${meta.label}`} subtitle="Max belopp per månad">
      <div className="space-y-5 -mx-1">
        <div
          className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--copilot-border)]"
          style={{ background: tint.bg }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl">
            {tint.emoji}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white">{meta.label}</p>
            <p className="text-[12px] text-[var(--copilot-text-muted)]">Sätt din månadsgräns</p>
          </div>
          <Icon className="w-5 h-5 ml-auto opacity-40" style={{ color: meta.color }} />
        </div>

        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d\s]/g, ''))}
            placeholder="0"
            autoFocus
            className={`${copilotInputClass} text-center text-2xl font-bold h-16`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--copilot-text-muted)]">kr</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[500, 1000, 2000, 3000, 5000].map((preset) => (
            <AnchorPressable
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              className="px-4 py-2 rounded-full text-[13px] font-medium bg-[var(--copilot-bg-card)] border border-[var(--copilot-border)] text-[var(--copilot-text-secondary)]"
              minTouch={false}
            >
              {preset.toLocaleString('sv-SE')}
            </AnchorPressable>
          ))}
        </div>

        <button type="button" onClick={handleSave} className={copilotPrimaryBtnClass}>
          Spara gräns
        </button>
      </div>
    </AnchorSheet>
  );
}
