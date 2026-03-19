import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, Trash2, Edit2, X, Check, Bot } from 'lucide-react';
import TransactionForm from '@/components/transactions/TransactionForm';

const CATEGORY_ICONS = {
  food: '🍔', transport: '🚌', entertainment: '🎮', travel: '✈️',
  health: '💊', home: '🏠', shopping: '🛍️', income: '💰',
  savings: '🏦', other: '📦'
};

const TYPE_LABELS = {
  income: 'Inkomst', expense: 'Utgift', savings_deposit: 'Insättning',
  savings_withdrawal: 'Uttag', transfer_to_savings: 'Till sparande',
  transfer_to_spending: 'Till konto'
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Idag';
  if (d.toDateString() === yesterday.toDateString()) return 'Igår';
  return d.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
}

function groupByDay(transactions) {
  const groups = {};
  transactions.forEach(tx => {
    const day = new Date(tx.created_date).toDateString();
    if (!groups[day]) groups[day] = [];
    groups[day].push(tx);
  });
  return Object.entries(groups).map(([day, txs]) => ({ day, txs }));
}

function TransactionRow({ tx, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const longPressTimer = useRef(null);

  const isPositive = tx.amount > 0 || ['income', 'savings_withdrawal', 'transfer_to_spending'].includes(tx.type);
  const amountColor = isPositive ? 'text-emerald-400' : 'text-red-400';
  const amountSign = isPositive ? '+' : '-';
  const icon = CATEGORY_ICONS[tx.category] || '📦';

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => setShowActions(true), 500);
  };
  const handleLongPressEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  return (
    <div>
      <motion.div
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onClick={() => !showActions && setExpanded(!expanded)}
        className="flex items-center gap-3 px-4 py-3.5 active:bg-white/5 cursor-pointer select-none"
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-2xl bg-white/8 flex items-center justify-center text-xl flex-shrink-0">
          {icon}
        </div>

        {/* Label + vendor */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{tx.vendor || tx.label}</p>
          <p className="text-xs text-slate-500 truncate">{tx.vendor ? tx.label : (TYPE_LABELS[tx.type] || tx.type)}</p>
        </div>

        {/* Time */}
        <div className="text-center flex-shrink-0">
          <p className="text-xs text-slate-500">{formatTime(tx.created_date)}</p>
          {tx.paymentMethod && (
            <p className="text-[10px] text-slate-600 mt-0.5">{tx.paymentMethod}</p>
          )}
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0 min-w-[64px]">
          <p className={`text-sm font-bold ${amountColor}`}>
            {amountSign}{Math.abs(tx.amount).toLocaleString('sv-SE')} kr
          </p>
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-600 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </motion.div>

      {/* Actions overlay (long press) */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-4 pb-3 overflow-hidden"
          >
            <button
              onClick={() => { onEdit(tx); setShowActions(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold"
            >
              <Edit2 className="w-3.5 h-3.5" /> Redigera
            </button>
            <button
              onClick={() => { onDelete(tx.id); setShowActions(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/20 border border-red-400/30 text-red-400 text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" /> Ta bort
            </button>
            <button
              onClick={() => setShowActions(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/8 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable detail / kvitto */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-3 p-3 rounded-2xl bg-white/5 border border-white/8 space-y-2">
              {tx.note && (
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Anteckning</p>
                  <p className="text-xs text-slate-300">{tx.note}</p>
                </div>
              )}
              {tx.aiNote && (
                <div className="flex gap-2 p-2 rounded-xl bg-purple-500/10 border border-purple-400/20">
                  <Bot className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-purple-400 font-semibold mb-0.5">{tx.aiAgent || 'Beteende-AI'}</p>
                    <p className="text-xs text-purple-200">{tx.aiNote}</p>
                  </div>
                </div>
              )}
              <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                <span>ID: {tx.id?.slice(-6)}</span>
                <span>{new Date(tx.created_date).toLocaleString('sv-SE')}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DayGroup({ day, txs, onDelete, onEdit }) {
  const dayTotal = txs.reduce((sum, tx) => {
    const pos = ['income', 'savings_withdrawal', 'transfer_to_spending'].includes(tx.type);
    return sum + (pos ? tx.amount : -Math.abs(tx.amount));
  }, 0);
  const totalColor = dayTotal >= 0 ? 'text-emerald-400' : 'text-red-400';

  return (
    <div>
      {/* Day header */}
      <div className="flex items-center justify-between px-4 py-2 sticky top-0 bg-[#0a0e1a]/90 backdrop-blur-sm z-10">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{formatDate(txs[0].created_date)}</p>
        <p className={`text-xs font-bold ${totalColor}`}>
          {dayTotal >= 0 ? '+' : ''}{dayTotal.toLocaleString('sv-SE')} kr
        </p>
      </div>
      {/* Transactions */}
      <div className="divide-y divide-white/5">
        {txs.map(tx => (
          <TransactionRow key={tx.id} tx={tx} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}

export default function TransactionHistory() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 200)
  });

  const handleDelete = async (id) => {
    await base44.entities.Transaction.delete(id);
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  const handleEdit = (tx) => {
    setEditingTx(tx);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTx(null);
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  const groups = groupByDay(transactions);

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-white">Transaktionslogg</h1>
        <p className="text-slate-500 text-sm mt-0.5">{transactions.length} transaktioner</p>
      </div>

      {/* Summary bar */}
      {transactions.length > 0 && (() => {
        const totalIn = transactions.filter(t => ['income', 'savings_withdrawal', 'transfer_to_spending'].includes(t.type)).reduce((s, t) => s + t.amount, 0);
        const totalOut = transactions.filter(t => !['income', 'savings_withdrawal', 'transfer_to_spending'].includes(t.type)).reduce((s, t) => s + t.amount, 0);
        return (
          <div className="mx-4 mb-4 p-4 rounded-2xl bg-white/5 border border-white/8 flex justify-around">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">In</p>
              <p className="text-sm font-bold text-emerald-400">+{totalIn.toLocaleString('sv-SE')} kr</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Ut</p>
              <p className="text-sm font-bold text-red-400">-{totalOut.toLocaleString('sv-SE')} kr</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Netto</p>
              <p className={`text-sm font-bold ${totalIn - totalOut >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {(totalIn - totalOut).toLocaleString('sv-SE')} kr
              </p>
            </div>
          </div>
        );
      })()}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-1 px-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-16 rounded-2xl skeleton" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-white font-semibold text-lg">Inga transaktioner än</p>
          <p className="text-slate-500 text-sm mt-1">Tryck på + för att lägga till din första transaktion</p>
        </div>
      )}

      {/* Transaction groups */}
      <div>
        {groups.map(({ day, txs }) => (
          <DayGroup key={day} day={day} txs={txs} onDelete={handleDelete} onEdit={handleEdit} />
        ))}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => { setEditingTx(null); setShowForm(true); }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/40 flex items-center justify-center z-40"
      >
        <Plus className="w-7 h-7 text-white" />
      </motion.button>

      {/* Transaction Form Modal */}
      <AnimatePresence>
        {showForm && (
          <TransactionForm
            existingTx={editingTx}
            onSuccess={handleFormSuccess}
            onClose={() => { setShowForm(false); setEditingTx(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}