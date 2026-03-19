import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const CATEGORIES = [
  { value: 'food', label: 'Mat', icon: '🍔' },
  { value: 'transport', label: 'Transport', icon: '🚌' },
  { value: 'entertainment', label: 'Nöje', icon: '🎮' },
  { value: 'travel', label: 'Resa', icon: '✈️' },
  { value: 'health', label: 'Hälsa', icon: '💊' },
  { value: 'home', label: 'Hem', icon: '🏠' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'income', label: 'Inkomst', icon: '💰' },
  { value: 'savings', label: 'Sparande', icon: '🏦' },
  { value: 'other', label: 'Övrigt', icon: '📦' },
];

const PAYMENT_METHODS = ['Konto', 'Kredit', 'Klarna', 'Swish', 'Kontant'];

export default function TransactionForm({ existingTx, onSuccess, onClose }) {
  const [isExpense, setIsExpense] = useState(existingTx ? !['income', 'savings_withdrawal', 'transfer_to_spending'].includes(existingTx.type) : true);
  const [amount, setAmount] = useState(existingTx ? String(Math.abs(existingTx.amount)) : '');
  const [label, setLabel] = useState(existingTx?.label || '');
  const [vendor, setVendor] = useState(existingTx?.vendor || '');
  const [category, setCategory] = useState(existingTx?.category || 'other');
  const [paymentMethod, setPaymentMethod] = useState(existingTx?.paymentMethod || 'Konto');
  const [note, setNote] = useState(existingTx?.note || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || !label) return;
    setSaving(true);
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
    if (existingTx) {
      await base44.entities.Transaction.update(existingTx.id, data);
    } else {
      await base44.entities.Transaction.create(data);
    }
    setSaving(false);
    onSuccess();
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
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{existingTx ? 'Redigera' : 'Ny transaktion'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Expense / Income toggle */}
        <div className="flex rounded-2xl bg-white/5 p-1 mb-5">
          <button
            onClick={() => setIsExpense(true)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${isExpense ? 'bg-red-500 text-white' : 'text-slate-400'}`}
          >
            − Utgift
          </button>
          <button
            onClick={() => setIsExpense(false)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${!isExpense ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
          >
            + Inkomst
          </button>
        </div>

        <div className="space-y-3">
          {/* Amount */}
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full rounded-2xl px-4 py-3.5 text-2xl font-bold text-center focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', color: isExpense ? '#f87171' : '#34d399', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">kr</span>
          </div>

          {/* Vendor */}
          <input
            type="text"
            placeholder="Butik / Plats (t.ex. Hemköp, Steam)"
            value={vendor}
            onChange={e => setVendor(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }}
          />

          {/* Label */}
          <input
            type="text"
            placeholder="Beskrivning *"
            value={label}
            onChange={e => setLabel(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }}
          />

          {/* Category picker */}
          <div>
            <p className="text-xs text-slate-500 mb-2 px-1">Kategori</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    category === c.value
                      ? 'bg-indigo-500 border-indigo-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div>
            <p className="text-xs text-slate-500 mb-2 px-1">Betalmetod</p>
            <div className="flex gap-2 flex-wrap">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m}
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

          {/* Note */}
          <input
            type="text"
            placeholder="Anteckning (valfri)"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* Save button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={!amount || !label || saving}
          className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><Check className="w-4 h-4" /> {existingTx ? 'Spara ändringar' : 'Spara transaktion'}</>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}