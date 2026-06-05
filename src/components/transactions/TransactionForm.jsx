import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { categorizeTransaction } from '@/lib/categoryRouter';
import CategoryOverridePrompt from './CategoryOverridePrompt';
import { useOptimisticTransactions } from '@/hooks/useOptimisticTransactions';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function TransactionForm({ existingTx, onSuccess, onClose }) {
  const { createTransaction, updateTransaction } = useOptimisticTransactions();
  const [isExpense, setIsExpense] = useState(existingTx ? !['income', 'savings_withdrawal', 'transfer_to_spending'].includes(existingTx.type) : true);
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
    if (result.category !== category) {
      setCategory(result.category);
    }
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-md rounded-t-3xl bg-[#111827] border border-white/10 p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{existingTx ? 'Redigera' : 'Ny transaktion'}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="flex rounded-2xl bg-white/5 p-1 mb-5">
          <button
            type="button"
            onClick={() => setIsExpense(true)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${isExpense ? 'bg-red-500 text-white' : 'text-slate-400'}`}
          >
            − Utgift
          </button>
          <button
            type="button"
            onClick={() => setIsExpense(false)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${!isExpense ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
          >
            + Inkomst
          </button>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-2xl px-4 py-3.5 text-2xl font-bold text-center focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', color: isExpense ? '#f87171' : '#34d399', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">kr</span>
          </div>

          <input
            type="text"
            placeholder="Butik / Plats (t.ex. Hemköp, Steam)"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            onBlur={handleVendorBlur}
            className="w-full rounded-2xl px-4 py-3 text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }}
          />

          <input
            type="text"
            placeholder="Beskrivning *"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }}
          />

          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <p className="text-xs text-slate-500">Kategori</p>
              {categorizing && <Skeleton className="h-3 w-12 rounded-full" />}
              {aiConfidence === 'high' && (
                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(13,115,119,0.2)', color: '#0D7377' }}>
                  <Check className="w-2.5 h-2.5" /> Säker
                </span>
              )}
              {aiConfidence === 'low' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(214,158,46,0.2)', color: '#D69E2E' }}>
                  ? Osäker
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => handleCategoryChange(c.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    category === c.value
                      ? 'bg-indigo-500 border-indigo-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2 px-1">Betalmetod</p>
            <div className="flex gap-2 flex-wrap">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    paymentMethod === m
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            placeholder="Anteckning (valfri)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {overridePrompt && (
          <CategoryOverridePrompt
            vendor={overridePrompt.vendor}
            newCategory={overridePrompt.newCategory}
            categoryLabel={overridePrompt.categoryLabel}
            onDismiss={() => setOverridePrompt(null)}
          />
        )}

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={!amount || !label}
          className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" /> {existingTx ? 'Spara ändringar' : 'Spara transaktion'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
