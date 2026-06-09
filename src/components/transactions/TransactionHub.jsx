import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowLeftRight, History, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOptimisticTransactions } from '@/hooks/useOptimisticTransactions';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';
import TintIconCard from '@/components/ui-premium/copilot/TintIconCard';
import VisualSavingsGoalRing from '@/components/savings/VisualSavingsGoalRing';
import { copilotChipClass, copilotPrimaryBtnClass, copilotInputClass } from '@/lib/copilotTheme';
import TheSwipe from './TheSwipe';

const fmt = (v) => Math.round(v || 0).toLocaleString('sv-SE');

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];
const INCOME_LABELS = ['Lön', 'Swish', 'Present', 'Frilans', 'Bidrag', 'Övrigt'];

function AddIncomeTab({ onSave }) {
  const [amount, setAmount] = useState(0);
  const [label, setLabel] = useState('Lön');
  const [customLabel, setCustomLabel] = useState('');
  const [done, setDone] = useState(false);

  const handleSave = () => {
    if (amount <= 0) return;
    if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
    onSave({
      type: 'income',
      amount,
      label: label === 'Övrigt' ? (customLabel || 'Inkomst') : label,
    });
    setDone(true);
    setTimeout(() => { setDone(false); setAmount(0); }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {INCOME_LABELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLabel(l)}
            className={copilotChipClass(label === l)}
          >
            {l}
          </button>
        ))}
      </div>
      {label === 'Övrigt' && (
        <input
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
          placeholder="Vad är det för?"
          className={copilotInputClass}
        />
      )}
      <div className="grid grid-cols-3 gap-2">
        {QUICK_AMOUNTS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAmount(a)}
            className={copilotChipClass(amount === a)}
          >
            {fmt(a)} kr
          </button>
        ))}
      </div>
      <div className="relative">
        <input
          type="number"
          value={amount || ''}
          onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
          className={`${copilotInputClass} text-center text-lg font-bold`}
          placeholder="Belopp"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--copilot-text-muted)] text-sm">kr</span>
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={amount <= 0 || done}
        className={copilotPrimaryBtnClass}
      >
        {done ? (
          <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Registrerat!</span>
        ) : (
          `Registrera +${fmt(amount)} kr`
        )}
      </button>
    </div>
  );
}

function HistoryTab() {
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 30),
    staleTime: 0,
  });

  const typeCategory = {
    income: 'income',
    expense: 'other',
    savings_deposit: 'savings',
    savings_withdrawal: 'savings',
    transfer_to_savings: 'savings',
    transfer_to_spending: 'savings',
  };

  if (transactions.length === 0) {
    return (
      <p className="text-center py-10 text-[var(--copilot-text-muted)] text-sm">
        Inga händelser ännu. Börja registrera transaktioner!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const isPositive = tx.amount > 0 || tx.type === 'income';
        return (
          <TintIconCard
            key={tx.id}
            category={typeCategory[tx.type] || 'other'}
            title={tx.label}
            subtitle={new Date(tx.created_date).toLocaleDateString('sv-SE', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
            amount={`${isPositive ? '+' : '−'}${fmt(Math.abs(tx.amount))} kr`}
            amountPositive={isPositive}
          />
        );
      })}
    </div>
  );
}

export default function TransactionHub({ isOpen, onClose, profile }) {
  const [tab, setTab] = useState('income');
  const queryClient = useQueryClient();
  const { createTransaction } = useOptimisticTransactions();

  const goal = profile?.savingsGoal || 0;
  const saved = profile?.savingsCurrentBalance || 0;
  const goalPct = goal > 0 ? Math.min(100, (saved / goal) * 100) : 0;

  const getFreshProfile = async () => {
    const profiles = await base44.entities.FinancialProfile.list();
    return profiles[0] || null;
  };

  const saveTransaction = (txData) => {
    createTransaction(txData);
    if (txData.type === 'income' || txData.type === 'expense') {
      getFreshProfile()
        .then((fresh) => {
          if (!fresh?.id) return;
          const delta = txData.type === 'income' ? txData.amount : -txData.amount;
          return base44.entities.FinancialProfile.update(fresh.id, {
            buffer: Math.max(0, (fresh.buffer || 0) + delta),
          });
        })
        .then(() => queryClient.invalidateQueries({ queryKey: ['financialProfile'] }))
        .catch(() => {});
    }
  };

  const handleTransfer = (direction, amount) => {
    getFreshProfile()
      .then((fresh) => {
        if (!fresh?.id) return null;
        if (direction === 'to_savings') {
          return base44.entities.FinancialProfile.update(fresh.id, {
            savingsCurrentBalance: (fresh.savingsCurrentBalance || 0) + amount,
            buffer: Math.max(0, (fresh.buffer || 0) - amount),
          }).then(() => {
            createTransaction({
              type: 'transfer_to_savings',
              amount,
              label: `Överföring till spar: +${fmt(amount)} kr`,
            });
          });
        }
        return base44.entities.FinancialProfile.update(fresh.id, {
          savingsCurrentBalance: Math.max(0, (fresh.savingsCurrentBalance || 0) - amount),
          buffer: (fresh.buffer || 0) + amount,
        }).then(() => {
          createTransaction({
            type: 'transfer_to_spending',
            amount,
            label: `Överföring från spar: +${fmt(amount)} kr`,
          });
        });
      })
      .then(() => queryClient.invalidateQueries({ queryKey: ['financialProfile'] }))
      .catch(() => {});
  };

  const TABS = [
    { id: 'income', label: 'Inkomst', icon: Plus },
    { id: 'transfer', label: 'Flytta', icon: ArrowLeftRight },
    { id: 'history', label: 'Historik', icon: History },
  ];

  return (
    <AnchorSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Hantera pengar"
      subtitle="Inkomst, flytta till sparmål eller historik"
      maxHeight="min(88dvh, 640px)"
    >
      {goal > 0 && (
        <div className="flex items-center gap-4 mb-5 p-4 rounded-2xl border border-[var(--copilot-border)] bg-[rgba(34,217,122,0.08)]">
          <VisualSavingsGoalRing
            pct={goalPct}
            size={72}
            stroke={5}
            imageUrl={profile?.savingsGoalVisualType === 'image' ? profile?.savingsGoalImageUrl : null}
            iconId={profile?.savingsGoalIcon || 'default'}
            showMilestones
          />
          <div>
            <p className="text-[13px] font-semibold text-white">{profile?.savingsGoalName || 'Sparmål'}</p>
            <p className="text-[12px] text-[var(--copilot-text-muted)] tabular-nums">
              {fmt(saved)} / {fmt(goal)} kr · {Math.round(goalPct)}%
            </p>
          </div>
        </div>
      )}

      <div className="flex rounded-2xl overflow-hidden border border-[var(--copilot-border)] mb-5 bg-[var(--copilot-bg-card)]">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                tab === t.id
                  ? 'bg-[var(--copilot-accent-blue)] text-white'
                  : 'text-[var(--copilot-text-secondary)] hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {tab === 'income' && <AddIncomeTab onSave={saveTransaction} />}
          {tab === 'transfer' && <TheSwipe profile={profile} onTransfer={handleTransfer} />}
          {tab === 'history' && <HistoryTab />}
        </motion.div>
      </AnimatePresence>
    </AnchorSheet>
  );
}
