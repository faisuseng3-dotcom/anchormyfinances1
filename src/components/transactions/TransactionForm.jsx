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
import { anchorInputClass, anchorIconButtonClass } from '@/lib/anchorTheme';

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
        <AnchorPressable onClick={onClose} className={anchorIconButtonClass} aria-label="Stäng">
          <X className="w-4 h-4" />
        </AnchorPressable>
      }
    >
      <div className="space-y-4 -mx-1">
        <div className="flex rounded-[var(--anchor-radius-lg)] bg-white/[0.05] p-1 ring-1 ring-white/[0.08]">
          <AnchorPressable
            type="button"
            minTouch={false}
            onClick={() => setIsExpense(true)}
            className={`flex-1 py-2.5 min-h-11 rounded-[var(--anchor-radius-md)] text-sm font-semibold ${
              isExpense ? 'bg-rose-400/90 text-white' : 'text-white/45'
            }`}
          >
            − Utgift
          </AnchorPressable>
          <AnchorPressable
            type="button"
            minTouch={false}
            onClick={() => setIsExpense(false)}
            className={`flex-1 py-2.5 min-h-11 rounded-[var(--anchor-radius-md)] text-sm font-semibold ${
              !isExpense ? 'bg-emerald-400/90 text-[#050d28]' : 'text-white/45'
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
            className={`w-full h-14 rounded-[var(--anchor-radius-lg)] text-center text-2xl font-semibold tabular-nums outline-none anchor-elev-1 ${
              isExpense ? 'text-rose-300' : 'text-emerald-300'
            } bg-white/[0.06] ring-1 ring-white/[0.1]`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-white/40">kr</span>
        </div>

        <input
          type="text"
          placeholder="Butik / plats"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          onBlur={handleVendorBlur}
          className={anchorInputClass}
        />
        <input
          type="text"
          placeholder="Beskrivning *"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className={anchorInputClass}
        />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="anchor-type-body-sm text-white/45">Kategori</p>
            {categorizing && <Skeleton className="h-3 w-12 rounded-full" />}
            {aiConfidence === 'high' && (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                <Check className="w-2.5 h-2.5" /> Säker
              </span>
            )}
            {aiConfidence === 'low' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-200">
                ? Osäker
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
                className={`px-3 py-2 min-h-10 rounded-full text-xs font-semibold ${
                  category === c.value
                    ? 'bg-[var(--color-text-primary)] text-[#050d28]'
                    : 'bg-white/[0.06] text-white/60 ring-1 ring-white/[0.08]'
                }`}
              >
                {c.label}
              </AnchorPressable>
            ))}
          </div>
        </div>

        <div>
          <p className="anchor-type-body-sm text-white/45 mb-2">Betalmetod</p>
          <div className="flex gap-2 flex-wrap">
            {PAYMENT_METHODS.map((m) => (
              <AnchorPressable
                key={m}
                type="button"
                minTouch={false}
                onClick={() => setPaymentMethod(m)}
                className={`px-3 py-2 min-h-10 rounded-full text-xs font-semibold ${
                  paymentMethod === m
                    ? 'bg-white/[0.14] text-white ring-1 ring-white/20'
                    : 'bg-white/[0.06] text-white/55 ring-1 ring-white/[0.08]'
                }`}
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
          className={anchorInputClass}
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
          className="w-full h-12 rounded-full bg-[var(--color-text-primary)] text-[#050d28] font-semibold disabled:opacity-40 anchor-elev-2 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          {existingTx ? 'Spara ändringar' : 'Spara transaktion'}
        </AnchorPressable>
      </div>
    </AnchorSheet>
  );
}
