import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Bot, ChevronRight } from 'lucide-react';
import TransactionForm from '@/components/transactions/TransactionForm';

const CATEGORY_COLORS = {
  food: '#4B7CF3', transport: '#3DAA7A', entertainment: '#C8923A',
  travel: '#7C6CF3', health: '#3DAABB', home: '#5C7CF3',
  shopping: '#B06CF3', income: '#3DAA7A', savings: '#3DAA7A', other: '#8B97A8'
};

const CATEGORY_LABELS = {
  food: 'Mat', transport: 'Transport', entertainment: 'Nöje',
  travel: 'Resa', health: 'Hälsa', home: 'Bostad',
  shopping: 'Shopping', income: 'Inkomst', savings: 'Sparande', other: 'Övrigt'
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
  const color = CATEGORY_COLORS[tx.category] || '#8B97A8';

  const handleLongPressStart = () => { longPressTimer.current = setTimeout(() => setShowActions(true), 500); };
  const handleLongPressEnd = () => { clearTimeout(longPressTimer.current); };

  return (
    <div className="border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <motion.div
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onClick={() => !showActions && setExpanded(!expanded)}
        className="flex items-center gap-4 px-5 py-4 cursor-pointer active:opacity-70"
        whileTap={{ scale: 0.99 }}
      >
        {/* Category dot */}
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />

        {/* Label */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
            {tx.vendor || tx.label}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {CATEGORY_LABELS[tx.category] || 'Övrigt'} · {new Date(tx.created_date).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Amount */}
        <p className="text-sm font-bold flex-shrink-0" style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
          {isPositive ? '+' : '-'}{Math.abs(tx.amount).toLocaleString('sv-SE')} kr
        </p>
      </motion.div>

      {/* Long-press actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 px-5 pb-3 overflow-hidden"
          >
            <button onClick={() => { onEdit(tx); setShowActions(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(75,124,243,0.15)', color: 'var(--color-accent)', border: '1px solid rgba(75,124,243,0.3)' }}>
              <Edit2 className="w-3.5 h-3.5" /> Redigera
            </button>
            <button onClick={() => { onDelete(tx.id); setShowActions(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(217,95,95,0.15)', color: 'var(--color-danger)', border: '1px solid rgba(217,95,95,0.3)' }}>
              <Trash2 className="w-3.5 h-3.5" /> Ta bort
            </button>
            <button onClick={() => setShowActions(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (tx.note || tx.aiNote) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-5 mb-3 p-4 rounded-xl space-y-2" style={{ background: 'var(--color-surface)' }}>
              {tx.note && <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{tx.note}</p>}
              {tx.aiNote && (
                <div className="flex gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(75,124,243,0.1)', border: '1px solid rgba(75,124,243,0.2)' }}>
                  <Bot className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{tx.aiNote}</p>
                </div>
              )}
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

  return (
    <div className="mb-3">
      {/* Day header */}
      <div className="flex items-center justify-between px-5 py-2">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          {formatDate(txs[0].created_date)}
        </p>
        <p className="text-xs font-semibold" style={{ color: dayTotal >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {dayTotal >= 0 ? '+' : ''}{dayTotal.toLocaleString('sv-SE')} kr
        </p>
      </div>

      {/* Card grouping */}
      <div className="mx-5 rounded-2xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
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

  const handleEdit = (tx) => { setEditingTx(tx); setShowForm(true); };
  const handleFormSuccess = () => { setShowForm(false); setEditingTx(null); queryClient.invalidateQueries({ queryKey: ['transactions'] }); };

  const groups = groupByDay(transactions);

  // Summary totals
  const totalIn = transactions.filter(t => ['income', 'savings_withdrawal', 'transfer_to_spending'].includes(t.type)).reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => !['income', 'savings_withdrawal', 'transfer_to_spending'].includes(t.type)).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--color-background-primary)' }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-2">
        <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>Historik</p>
        <h1 className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>Transaktioner</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{transactions.length} poster</p>
      </div>

      {/* Summary card */}
      {transactions.length > 0 && (
        <div className="mx-5 mt-4 mb-2 rounded-2xl p-5 grid grid-cols-3 gap-4"
          style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>In</p>
            <p className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>+{totalIn.toLocaleString('sv-SE')} kr</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Ut</p>
            <p className="text-sm font-bold" style={{ color: 'var(--color-danger)' }}>-{totalOut.toLocaleString('sv-SE')} kr</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Netto</p>
            <p className="text-sm font-bold" style={{ color: (totalIn - totalOut) >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {(totalIn - totalOut).toLocaleString('sv-SE')} kr
            </p>
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-2 px-5 mt-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-2xl skeleton" />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>Inga transaktioner än</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Tryck på + för att lägga till</p>
        </div>
      )}

      {/* Groups */}
      <div className="mt-2">
        {groups.map(({ day, txs }) => (
          <DayGroup key={day} day={day} txs={txs} onDelete={handleDelete} onEdit={handleEdit} />
        ))}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => { setEditingTx(null); setShowForm(true); }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center z-40 shadow-lg"
        style={{ background: 'var(--color-accent)' }}
      >
        <Plus className="w-7 h-7 text-white" />
      </motion.button>

      {/* Form modal */}
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