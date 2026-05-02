import React, { useState, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Bot, Search, Filter, FileUp, ChevronDown } from 'lucide-react';
import TransactionForm from '@/components/transactions/TransactionForm';
import { Link } from 'react-router-dom';

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

const TYPE_OPTIONS = [
  { value: '', label: 'Alla typer' },
  { value: 'expense', label: 'Utgifter' },
  { value: 'income', label: 'Inkomster' },
  { value: 'savings_deposit', label: 'Insättning' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Alla kategorier' },
  ...Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))
];

// Extract real date from bank transaction labels like "Kortköp 260414 ICA" → 2026-04-14
// Format: YYMMDD
function extractDateFromLabel(label) {
  if (!label) return null;
  const m = label.match(/\b(\d{6})\b/);
  if (!m) return null;
  const s = m[1];
  const yy = parseInt(s.slice(0, 2), 10);
  const mm = parseInt(s.slice(2, 4), 10);
  const dd = parseInt(s.slice(4, 6), 10);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const year = 2000 + yy;
  const d = new Date(year, mm - 1, dd);
  if (isNaN(d.getTime())) return null;
  return d;
}

// Get the best available date for a transaction
function getTxDate(tx) {
  const fromLabel = extractDateFromLabel(tx.label) || extractDateFromLabel(tx.vendor);
  if (fromLabel) return fromLabel;
  return new Date(tx.created_date);
}

function isTodayDate(d) {
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

// Group into: "Idag", then by month (e.g. "April 2026", "Mars 2026")
function groupByMonth(transactions) {
  const today = new Date();
  const todayStr = today.toDateString();

  const todayTxs = [];
  const monthMap = {};

  transactions.forEach(tx => {
    const d = getTxDate(tx);
    if (d.toDateString() === todayStr) {
      todayTxs.push(tx);
    } else {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { label: d.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' }), txs: [] };
      monthMap[key].txs.push(tx);
    }
  });

  const groups = [];
  if (todayTxs.length > 0) {
    groups.push({ key: 'today', label: 'Idag', txs: todayTxs });
  }
  // Sort months descending
  Object.entries(monthMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .forEach(([key, val]) => groups.push({ key, label: val.label, txs: val.txs }));

  return groups;
}

function netAmount(txs) {
  return txs.reduce((s, t) => {
    const isPositive = t.amount > 0 || ['income', 'savings_withdrawal', 'transfer_to_spending'].includes(t.type);
    return s + (isPositive ? Math.abs(t.amount) : -Math.abs(t.amount));
  }, 0);
}

function TransactionRow({ tx, onDelete, onEdit }) {
  const [showActions, setShowActions] = useState(false);
  const longPressTimer = useRef(null);
  const isPositive = tx.amount > 0 || ['income', 'savings_withdrawal', 'transfer_to_spending'].includes(tx.type);
  const color = CATEGORY_COLORS[tx.category] || '#8B97A8';

  const handleLongPressStart = () => { longPressTimer.current = setTimeout(() => setShowActions(true), 500); };
  const handleLongPressEnd = () => { clearTimeout(longPressTimer.current); };

  return (
    <div className="border-b last:border-b-0" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
      <motion.div
        onTouchStart={handleLongPressStart} onTouchEnd={handleLongPressEnd}
        onMouseDown={handleLongPressStart} onMouseUp={handleLongPressEnd} onMouseLeave={handleLongPressEnd}
        onClick={() => { if (!showActions) onEdit(tx); }}
        className="flex items-center gap-4 px-5 py-4 cursor-pointer active:opacity-70"
        whileTap={{ scale: 0.99 }}
      >
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{tx.vendor || tx.label}</p>
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {CATEGORY_LABELS[tx.category] || 'Övrigt'} · {getTxDate(tx).toLocaleDateString('sv-SE')}
          </p>
        </div>
        <p className="text-sm font-bold flex-shrink-0" style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {isPositive ? '+' : '-'}{Math.abs(tx.amount).toLocaleString('sv-SE')} kr
        </p>
      </motion.div>

      <AnimatePresence>
        {showActions && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 px-5 pb-3 overflow-hidden">
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
            <button onClick={() => setShowActions(false)} className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {tx.aiNote && (
        <div className="mx-5 mb-3">
          <div className="flex gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(75,124,243,0.08)', border: '1px solid rgba(75,124,243,0.15)' }}>
            <Bot className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{tx.aiNote}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MonthGroup({ group, onDelete, onEdit, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const net = netAmount(group.txs);
  const totalOut = group.txs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalIn = group.txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="mb-3">
      {/* Month header — tappable to expand/collapse */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3"
      >
        <div className="flex items-center gap-3">
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </motion.div>
          <div className="text-left">
            <p className="text-sm font-black capitalize" style={{ color: 'var(--color-text-primary)' }}>{group.label}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{group.txs.length} transaktioner</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold" style={{ color: net >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {net >= 0 ? '+' : ''}{net.toLocaleString('sv-SE')} kr
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span style={{ color: 'var(--color-success)' }}>+{totalIn.toLocaleString('sv-SE')}</span>
            {' / '}
            <span style={{ color: 'var(--color-danger)' }}>-{totalOut.toLocaleString('sv-SE')}</span>
          </p>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="mx-5 rounded-2xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
              {group.txs.map(tx => (
                <TransactionRow key={tx.id} tx={tx} onDelete={onDelete} onEdit={onEdit} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TransactionHistory() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 500)
  });

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (search && !`${tx.label} ${tx.vendor || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType && tx.type !== filterType) return false;
      if (filterCategory && tx.category !== filterCategory) return false;
      return true;
    });
  }, [transactions, search, filterType, filterCategory]);

  const groups = useMemo(() => groupByMonth(filtered), [filtered]);

  const totalIn = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const handleDelete = async (id) => {
    await base44.entities.Transaction.delete(id);
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  const handleEdit = (tx) => { setEditingTx(tx); setShowForm(true); };
  const handleFormSuccess = () => { setShowForm(false); setEditingTx(null); queryClient.invalidateQueries({ queryKey: ['transactions'] }); };

  const activeFilterCount = [filterType, filterCategory].filter(Boolean).length;

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--color-background-primary)' }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-2">
        <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>Historik</p>
        <h1 className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>Transaktioner</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{filtered.length} poster</p>
      </div>

      {/* Search + Filter bar */}
      <div className="px-5 mt-3 flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Sök ICA, Hyra..."
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--color-text-primary)' }}
          />
          {search && (
            <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} /></button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className="relative w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: showFilters ? 'var(--color-accent)' : 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}
        >
          <Filter className="w-4 h-4" style={{ color: showFilters ? '#fff' : 'var(--color-text-muted)' }} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: 'var(--color-danger)', fontSize: 10 }}>{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="px-5 mt-2 overflow-hidden"
          >
            <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div>
                <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Typ</p>
                <div className="flex gap-2 flex-wrap">
                  {TYPE_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => setFilterType(o.value)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: filterType === o.value ? 'var(--color-accent)' : 'var(--color-surface)', color: filterType === o.value ? '#fff' : 'var(--color-text-secondary)' }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Kategori</p>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORY_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => setFilterCategory(o.value)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: filterCategory === o.value ? 'var(--color-accent)' : 'var(--color-surface)', color: filterCategory === o.value ? '#fff' : 'var(--color-text-secondary)' }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      {filtered.length > 0 && (
        <div className="mx-5 mt-3 mb-2 rounded-2xl p-4 grid grid-cols-3 gap-4"
          style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
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

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2 px-5 mt-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-2xl skeleton" />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <FileUp className="w-12 h-12 mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <p className="font-bold text-xl mb-1" style={{ color: 'var(--color-text-primary)' }}>Inga transaktioner än</p>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Importera från din bank eller lägg till ett köp manuellt.</p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link to="/Import">
              <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white" style={{ background: 'var(--color-accent)' }}>
                <FileUp className="w-4 h-4" /> Importera bank-data
              </button>
            </Link>
            <button onClick={() => setShowForm(true)} className="w-full py-3.5 rounded-2xl font-semibold text-sm"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)', border: '1px solid rgba(0,0,0,0.08)' }}>
              + Lägg till manuellt
            </button>
          </div>
        </div>
      )}

      {/* No search results */}
      {!isLoading && transactions.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <Search className="w-10 h-10 mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Inga resultat</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Prova ett annat sökord eller filter.</p>
        </div>
      )}

      {/* Month groups */}
      <div className="mt-2">
        {groups.map((group, i) => (
          <MonthGroup
            key={group.key}
            group={group}
            onDelete={handleDelete}
            onEdit={handleEdit}
            defaultOpen={i === 0} // Only today/latest month open by default
          />
        ))}
      </div>

      {/* FAB */}
      <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
        onClick={() => { setEditingTx(null); setShowForm(true); }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center z-40 shadow-lg"
        style={{ background: 'var(--color-accent)' }}>
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