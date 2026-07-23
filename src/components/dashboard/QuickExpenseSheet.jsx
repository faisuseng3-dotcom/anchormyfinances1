import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Type } from 'lucide-react';
import { useOptimisticTransactions } from '@/hooks/useOptimisticTransactions';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';
import { copilotChipClass, copilotPrimaryBtnClass } from '@/lib/copilotTheme';
import { getCategoryTint } from '@/lib/copilotTheme';
import { CategoryIcon } from '@/lib/anchorIcons';

const CATEGORIES = [
  { id: 'food', label: 'Mat' },
  { id: 'transport', label: 'Transport' },
  { id: 'entertainment', label: 'Nöje' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'subscriptions', label: 'Abonnemang' },
  { id: 'other', label: 'Övrigt' },
];

const QUICK_AMOUNTS = [89, 150, 250, 500, 1000];

const LAST_CAT_KEY = 'anchor_last_expense_category';
const RECENT_WINDOW_DAYS = 60;
const MAX_RECENT = 4;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** De mest återkommande utgifterna senaste 60 dagarna — snabbaste vägen att logga en vana. */
function buildRecentPayees(transactions) {
  const cutoff = Date.now() - RECENT_WINDOW_DAYS * 86400000;
  const byVendor = {};

  (transactions || []).forEach((tx) => {
    const isExpense = tx.type === 'expense' || (tx.amount < 0 && tx.type !== 'income');
    if (!isExpense) return;
    const d = new Date(tx.created_date).getTime();
    if (!d || d < cutoff) return;
    const key = (tx.vendor || tx.label || '').trim();
    if (!key) return;
    if (!byVendor[key]) byVendor[key] = { key, count: 0, amounts: [], category: tx.category || 'other' };
    byVendor[key].count += 1;
    byVendor[key].amounts.push(Math.abs(tx.amount || 0));
  });

  return Object.values(byVendor)
    .filter((p) => p.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_RECENT)
    .map((p) => ({
      ...p,
      amount: Math.round(p.amounts.reduce((s, a) => s + a, 0) / p.amounts.length),
    }));
}

export default function QuickExpenseSheet({ isOpen, onClose, profile, transactions, onSwitchToWrite }) {
  const { createTransaction } = useOptimisticTransactions();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');

  const recentPayees = useMemo(() => buildRecentPayees(transactions), [transactions]);

  useEffect(() => {
    if (!isOpen) return;
    setAmount('');
    try {
      const last = localStorage.getItem(LAST_CAT_KEY);
      if (last && CATEGORIES.some((c) => c.id === last)) setCategory(last);
    } catch {
      /* ignore */
    }
  }, [isOpen]);

  const saveExpense = (cat, amt, vendorLabel) => {
    const parsed = parseInt(String(amt).replace(/\s/g, ''), 10);
    if (!parsed || parsed <= 0) return;

    const catLabel = vendorLabel || CATEGORIES.find((c) => c.id === cat)?.label || 'Utgift';
    createTransaction({
      type: 'expense',
      amount: parsed,
      label: catLabel,
      vendor: catLabel,
      category: cat,
      created_date: new Date(`${todayIso()}T12:00:00`).toISOString(),
    });

    try {
      localStorage.setItem(LAST_CAT_KEY, cat);
    } catch {
      /* ignore */
    }

    if (navigator.vibrate) navigator.vibrate(20);
    onClose?.();
  };

  const savePayee = (payee) => {
    saveExpense(payee.category, payee.amount, payee.key);
  };

  const handleCategoryTap = (catId) => {
    setCategory(catId);
    if (amount && parseInt(amount, 10) > 0) {
      saveExpense(catId, amount);
    }
  };

  const parsedAmount = parseInt(amount, 10) || 0;

  return (
    <AnchorSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Ny utgift"
      subtitle="2 steg — belopp + kategori"
      maxHeight="min(78dvh, 560px)"
      headerRight={onSwitchToWrite && (
        <button
          type="button"
          onClick={onSwitchToWrite}
          className="flex items-center gap-1.5 text-[13px] font-medium text-white/50 hover:text-white/80 transition-colors shrink-0 pt-1"
        >
          <Type size={14} />
          Skriv/tala
        </button>
      )}
    >
      <div className="space-y-5 -mx-1">
        {recentPayees.length > 0 && (
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--copilot-text-muted)] mb-2 block">
              Vanliga — ett tryck
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
              {recentPayees.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => savePayee(p)}
                  className="shrink-0 flex flex-col items-start gap-1 px-3.5 py-2.5 rounded-2xl anchor-pressable"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="text-[13px] font-medium text-white">{p.key}</span>
                  <span className="text-[12px] text-white/45 tabular-nums">~{p.amount.toLocaleString('sv-SE')} kr</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--copilot-text-muted)] mb-2 block">
            Belopp
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
              className="w-full h-16 rounded-2xl bg-[var(--copilot-bg-card)] organic-surface text-center text-3xl font-bold text-white tabular-nums outline-none focus:border-[rgba(79, 174, 130, 0.5)]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-[var(--copilot-text-muted)]">
              kr
            </span>
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(String(q))}
                className={copilotChipClass(amount === String(q))}
              >
                {q} kr
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--copilot-text-muted)] mb-2 block">
            Kategori — tryck för att spara
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => {
              const tint = getCategoryTint(cat.id);
              const active = category === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleCategoryTap(cat.id)}
                  className={`flex items-center gap-2.5 p-3.5 rounded-3xl text-left transition-all ${
                    active
                      ? 'border-[var(--copilot-accent-blue)] bg-[rgba(79, 174, 130, 0.2)]'
                      : ' bg-[var(--copilot-bg-card)] hover:bg-[var(--copilot-bg-card-hover)]'
                  }`}
                  style={active ? undefined : { background: `linear-gradient(135deg, ${tint.bg}, var(--copilot-bg-card))` }}
                >
                  <CategoryIcon category={cat.id} size={18} color={tint.accent} />
                  <span className="text-[14px] font-medium text-white">{cat.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {parsedAmount > 0 && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => saveExpense(category, amount)}
            className={copilotPrimaryBtnClass}
          >
            Spara {parsedAmount.toLocaleString('sv-SE')} kr
          </motion.button>
        )}
      </div>
    </AnchorSheet>
  );
}
