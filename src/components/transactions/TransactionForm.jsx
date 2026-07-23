// @ts-nocheck
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { categorizeTransaction } from '@/lib/categoryRouter';
import CategoryOverridePrompt from './CategoryOverridePrompt';
import { useOptimisticTransactions } from '@/hooks/useOptimisticTransactions';
import { Skeleton } from '@/components/ui/skeleton';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import CopilotFreeMoneyHero from '@/components/ui-premium/copilot/CopilotFreeMoneyHero';
import { copilotInputClass, copilotChipClass, copilotPrimaryBtnClass } from '@/lib/copilotTheme';
import { triggerHaptic } from '@/lib/haptics';

const CATEGORIES = [
  { value: 'food', label: 'Mat' },
  { value: 'transport', label: 'Transport' },
  { value: 'entertainment', label: 'Nöje' },
  { value: 'travel', label: 'Resa' },
  { value: 'health', label: 'Hälsa' },
  { value: 'home', label: 'Hem' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'income', label: 'Inkomst' },
  { value: 'savings', label: 'Sparande' },
  { value: 'other', label: 'Övrigt' },
];

const PAYMENT_METHODS = ['Konto', 'Kredit', 'Klarna', 'Swish', 'Kontant'];

export default function TransactionForm({ isOpen = true, existingTx, onSuccess, onClose }) {
  const { createTransaction, updateTransaction } = useOptimisticTransactions();
  const [isExpense, setIsExpense] = useState(
    existingTx ? !['income', 'savings_withdrawal', 'transfer_to_spending'].includes(existingTx.type) : true,
  );
  const [amount, setAmount] = useState(existingTx ? String(Math.abs(existingTx.amount)) : '');
  const [label, setLabel] = useState(existingTx?.label || '');
  const [vendor, setVendor] = useState(existingTx?.vendor || '');
  const [category, setCategory] = useState(existingTx?.category || 'other');
  const [paymentMethod, setPaymentMethod] = useState(existingTx?.paymentMethod || 'Konto');
  const [note, setNote] = useState(existingTx?.note || '');
  const [overridePrompt, setOverridePrompt] = useState(null);
  const [aiConfidence, setAiConfidence] = useState(null);
  const [categorizing, setCategorizing] = useState(false);

  const handleVendorBlur = async () => {
    if (!vendor) return;
    setCategorizing(true);
    const amountNum = parseFloat(amount);
    const result = await categorizeTransaction(base44, vendor, {
      amount: Number.isFinite(amountNum) ? (isExpense ? -Math.abs(amountNum) : Math.abs(amountNum)) : undefined,
      useLLM: true,
    });
    if (result.category !== category) setCategory(result.category);
    setAiConfidence(result.confidenceLabel || result.confidence);
    setCategorizing(false);
  };

  const handleCategoryChange = (newCat) => {
    const prev = category;
    setCategory(newCat);
    if (vendor && newCat !== prev && existingTx) {
      const catLabel = CATEGORIES.find((c) => c.value === newCat)?.label || newCat;
      setOverridePrompt({ vendor, newCategory: newCat, categoryLabel: catLabel });
    }
  };

  const handleSave = () => {
    if (!amount || !label) return;
    triggerHaptic('success');
    const type = isExpense ? 'expense' : 'income';
    const data = {
      type,
      amount: parseFloat(amount),
      label,
      vendor: vendor || undefined,
      category,
      paymentMethod,
      note: note || undefined,
    };
    onClose?.();
    onSuccess?.();
    if (existingTx && !String(existingTx.id).startsWith('opt-tx-')) {
      updateTransaction(existingTx.id, data);
    } else if (!existingTx) {
      createTransaction(data);
    }
  };

  return (
    <AnchorSheet
      isOpen={isOpen}
      onClose={onClose}
      title={existingTx ? 'Redigera' : 'Ny transaktion'}
      maxHeight="min(88dvh, 720px)"
      headerRight={
        <AnchorPressable
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--copilot-bg-card)] organic-surface"
          aria-label="Stäng"
        >
          <X className="w-4 h-4" />
        </AnchorPressable>
      }
    >
      <div className="space-y-4 -mx-1">
        <CopilotFreeMoneyHero
          previewAmount={amount ? parseFloat(amount) : null}
          isExpensePreview={isExpense}
          className="!p-4"
        />

        <div className="flex rounded-2xl bg-[var(--copilot-bg-card)] p-1 organic-surface">
          <AnchorPressable
            type="button"
            minTouch={false}
            onClick={() => setIsExpense(true)}
            className={`flex-1 py-2.5 min-h-12 rounded-xl text-sm font-semibold active:scale-[0.98] ${
              isExpense ? 'bg-rose-500/25 text-rose-200 border border-rose-400/30' : 'text-[var(--copilot-text-muted)]'
            }`}
          >
            − Utgift
          </AnchorPressable>
          <AnchorPressable
            type="button"
            minTouch={false}
            onClick={() => setIsExpense(false)}
            className={`flex-1 py-2.5 min-h-12 rounded-xl text-sm font-semibold active:scale-[0.98] ${
              !isExpense ? 'bg-[rgba(79, 174, 130, 0.2)] text-[var(--copilot-accent-green)] border border-[rgba(79, 174, 130, 0.35)]' : 'text-[var(--copilot-text-muted)]'
            }`}
          >
            + Inkomst
          </AnchorPressable>
        </div>

        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full h-14 rounded-2xl text-center text-2xl font-semibold tabular-nums outline-none organic-surface bg-[var(--copilot-bg-card)] ${
              isExpense ? 'text-rose-300' : 'text-[var(--copilot-accent-green)]'
            }`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-[var(--copilot-text-muted)]">kr</span>
        </div>

        <input
          type="text"
          placeholder="Butik / plats"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          onBlur={handleVendorBlur}
          className={copilotInputClass}
        />
        <input
          type="text"
          placeholder="Beskrivning *"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className={copilotInputClass}
        />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] uppercase tracking-wide text-[var(--copilot-text-muted)]">Kategori</p>
            {categorizing && <Skeleton className="h-3 w-12 rounded-full" />}
            {aiConfidence === 'high' && (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                <Check className="w-2.5 h-2.5" /> Säker
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <AnchorPressable
                key={c.value}
                type="button"
                minTouch={false}
                onClick={() => handleCategoryChange(c.value)}
                className={`${copilotChipClass(category === c.value)} min-h-10`}
              >
                {c.label}
              </AnchorPressable>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-[var(--copilot-text-muted)] mb-2">Betalmetod</p>
          <div className="flex gap-2 flex-wrap">
            {PAYMENT_METHODS.map((m) => (
              <AnchorPressable
                key={m}
                type="button"
                minTouch={false}
                onClick={() => setPaymentMethod(m)}
                className={`${copilotChipClass(paymentMethod === m)} min-h-10`}
              >
                {m}
              </AnchorPressable>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="Anteckning (valfri)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={copilotInputClass}
        />

        {overridePrompt && (
          <CategoryOverridePrompt
            vendor={overridePrompt.vendor}
            newCategory={overridePrompt.newCategory}
            categoryLabel={overridePrompt.categoryLabel}
            onDismiss={() => setOverridePrompt(null)}
          />
        )}

        <AnchorPressable
          type="button"
          onClick={handleSave}
          disabled={!amount || !label}
          className={`${copilotPrimaryBtnClass} flex items-center justify-center gap-2`}
        >
          <Check className="w-4 h-4" />
          {existingTx ? 'Spara ändringar' : 'Spara transaktion'}
        </AnchorPressable>
      </div>
    </AnchorSheet>
  );
}
