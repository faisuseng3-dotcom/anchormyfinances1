import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, Plus, ArrowLeftRight, History, Check, PiggyBank, TrendingUp, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import TheSwipe from './TheSwipe';

const fmt = (v) => Math.round(v || 0).toLocaleString('sv-SE');

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const INCOME_LABELS = ['Lön', 'Swish', 'Present', 'Frilans', 'Bidrag', 'Övrigt'];



function AddIncomeTab({ onSave }) {
  const [amount, setAmount] = useState(0);
  const [label, setLabel] = useState('Lön');
  const [customLabel, setCustomLabel] = useState('');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [particles, setParticles] = useState([]);

  const triggerParticles = () => {
    const p = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 160 - 80,
      y: -(Math.random() * 80 + 40),
    }));
    setParticles(p);
    setTimeout(() => setParticles([]), 800);
  };

  const handleSave = async () => {
    if (amount <= 0 || saving) return;
    setSaving(true);
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
    await onSave({ type: 'income', amount, label: label === 'Övrigt' ? (customLabel || 'Inkomst') : label });
    triggerParticles();
    setDone(true);
    setSaving(false);
    setTimeout(() => { setDone(false); setAmount(0); }, 2500);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {INCOME_LABELS.map(l => (
          <button
            key={l}
            onClick={() => setLabel(l)}
            className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${label === l ? 'bg-emerald-500 text-white' : 'bg-white/8 text-slate-300 hover:bg-white/12'}`}
          >
            {l}
          </button>
        ))}
      </div>
      {label === 'Övrigt' && (
        <input
          value={customLabel}
          onChange={e => setCustomLabel(e.target.value)}
          placeholder="Vad är det för?"
          className="w-full h-11 rounded-xl bg-white/8 border border-white/10 text-white px-4 text-sm focus:outline-none focus:border-emerald-500/70"
        />
      )}

      <div className="grid grid-cols-3 gap-2">
        {QUICK_AMOUNTS.map(a => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${amount === a ? 'bg-emerald-500 text-white' : 'bg-white/8 text-slate-300 hover:bg-white/12'}`}
          >
            {fmt(a)} kr
          </button>
        ))}
      </div>
      <div className="relative">
        <input
          type="number"
          value={amount || ''}
          onChange={e => setAmount(parseInt(e.target.value) || 0)}
          className="w-full h-12 rounded-xl bg-white/8 border border-white/10 text-white text-center text-lg font-bold focus:outline-none focus:border-emerald-500/70"
          placeholder="Belopp"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">kr</span>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSave}
        disabled={amount <= 0 || done}
        className={`w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 ${done ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30'}`}
      >
        {done ? <><Check className="w-4 h-4" /> Registrerat!</> : <><Plus className="w-4 h-4" /> Registrera +{fmt(amount)} kr</>}
      </motion.button>
    </div>
  );
}

function HistoryTab() {
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 30)
  });

  const typeConfig = {
    income: { icon: '💰', color: 'text-emerald-400', sign: '+' },
    expense: { icon: '💸', color: 'text-rose-400', sign: '-' },
    savings_deposit: { icon: '🐷', color: 'text-blue-400', sign: '+' },
    savings_withdrawal: { icon: '↩️', color: 'text-amber-400', sign: '-' },
    transfer_to_savings: { icon: '→🐷', color: 'text-emerald-400', sign: '' },
    transfer_to_spending: { icon: '🐷→', color: 'text-amber-400', sign: '' },
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        Inga händelser ännu. Börja registrera transaktioner!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx, i) => {
        const cfg = typeConfig[tx.type] || { icon: '💳', color: 'text-slate-400', sign: '' };
        return (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8"
          >
            <span className="text-lg">{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{tx.label}</p>
              <p className="text-slate-500 text-xs">
                {new Date(tx.created_date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <p className={`text-sm font-bold ${cfg.color}`}>
              {cfg.sign}{fmt(tx.amount)} kr
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function TransactionHub({ isOpen, onClose, profile }) {
  const [tab, setTab] = useState('income');
  const queryClient = useQueryClient();

  const saveTransaction = async (txData) => {
    await base44.entities.Transaction.create(txData);

    // Atomically update the buffer balance on the profile
    if (profile?.id) {
      if (txData.type === 'income') {
        await base44.entities.FinancialProfile.update(profile.id, {
          buffer: (profile.buffer || 0) + txData.amount,
        });
      } else if (txData.type === 'expense') {
        await base44.entities.FinancialProfile.update(profile.id, {
          buffer: Math.max(0, (profile.buffer || 0) - txData.amount),
        });
      }
    }

    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
  };

  const handleTransfer = async (direction, amount) => {
    const profileId = profile?.id;
    if (!profileId) return;

    if (direction === 'to_savings') {
      const newSavings = (profile.savingsCurrentBalance || 0) + amount;
      const newBuffer = Math.max(0, (profile.buffer || 0) - amount);
      await base44.entities.FinancialProfile.update(profileId, {
        savingsCurrentBalance: newSavings,
        buffer: newBuffer,
      });
      await saveTransaction({ type: 'transfer_to_savings', amount, label: `Överföring till Spar: +${fmt(amount)} kr` });
    } else {
      const newSavings = Math.max(0, (profile.savingsCurrentBalance || 0) - amount);
      const newBuffer = (profile.buffer || 0) + amount;
      await base44.entities.FinancialProfile.update(profileId, {
        savingsCurrentBalance: newSavings,
        buffer: newBuffer,
      });
      await saveTransaction({ type: 'transfer_to_spending', amount, label: `Överföring från Spar: +${fmt(amount)} kr` });
    }
    queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
  };

  const TABS = [
    { id: 'income', label: 'Inkomst', icon: Plus },
    { id: 'transfer', label: 'Flytta', icon: ArrowLeftRight },
    { id: 'history', label: 'Historik', icon: History },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 2rem)' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-5 pt-2">
                <h2 className="text-white font-bold text-lg">Hantera Pengar</h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex rounded-xl overflow-hidden border border-white/10 mb-5">
                {TABS.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${tab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-300'}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {tab === 'income' && (
                    <AddIncomeTab onSave={saveTransaction} />
                  )}
                  {tab === 'transfer' && (
                    <TheSwipe profile={profile} onTransfer={handleTransfer} />
                  )}
                  {tab === 'history' && <HistoryTab />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}