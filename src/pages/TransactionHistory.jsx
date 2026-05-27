import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Bot, Search, Filter, FileUp, ChevronDown, ArrowLeft, List, TrendingUp } from 'lucide-react';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionInsightsPanel from '@/components/transactions/TransactionInsightsPanel';
import { Link, useNavigate } from 'react-router-dom';
import { useDemoMode } from '@/components/demo/DemoMode';
import { createPageUrl } from '@/utils';
import PageShell from '@/components/layout/PageShell';
import SegmentTabs from '@/components/ui/SegmentTabs';
import { DashboardDivider, DashboardStatStrip } from '@/components/dashboard/DashboardChrome';
import { anchorInputClass, sectionSubtitleClass } from '@/lib/anchorTheme';

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
{ value: 'savings_deposit', label: 'Insättning' }];


const CATEGORY_OPTIONS = [
{ value: '', label: 'Alla kategorier' },
...Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))];


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

  transactions.forEach((tx) => {
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
  Object.entries(monthMap).
  sort((a, b) => b[0].localeCompare(a[0])).
  forEach(([key, val]) => groups.push({ key, label: val.label, txs: val.txs }));

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

  const handleLongPressStart = () => {longPressTimer.current = setTimeout(() => setShowActions(true), 500);};
  const handleLongPressEnd = () => {clearTimeout(longPressTimer.current);};

  return (
    <div>
      <motion.div
        onTouchStart={handleLongPressStart} onTouchEnd={handleLongPressEnd}
        onMouseDown={handleLongPressStart} onMouseUp={handleLongPressEnd} onMouseLeave={handleLongPressEnd}
        onClick={() => {if (!showActions) onEdit(tx);}}
        className="flex items-center gap-3 py-3.5 cursor-pointer active:opacity-60"
        whileTap={{ scale: 0.99 }}>
        
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-white truncate">{tx.vendor || tx.label}</p>
          <p className="text-[13px] text-white/45 truncate mt-0.5">
            {CATEGORY_LABELS[tx.category] || 'Övrigt'} · {getTxDate(tx).toLocaleDateString('sv-SE')}
          </p>
        </div>
        <p className={`text-[15px] font-semibold tabular-nums flex-shrink-0 ${isPositive ? 'text-emerald-300' : 'text-rose-300'}`}>
          {isPositive ? '+' : '-'}{Math.abs(tx.amount).toLocaleString('sv-SE')} kr
        </p>
      </motion.div>

      <AnimatePresence>
        {showActions &&
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
        className="flex gap-2 px-5 pb-3 overflow-hidden">
            <button onClick={() => {onEdit(tx);setShowActions(false);}}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold"
          style={{ background: 'rgba(75,124,243,0.15)', color: 'var(--color-accent)', border: '1px solid rgba(75,124,243,0.3)' }}>
              <Edit2 className="w-3.5 h-3.5" /> Redigera
            </button>
            <button onClick={() => {onDelete(tx.id);setShowActions(false);}}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold"
          style={{ background: 'rgba(217,95,95,0.15)', color: 'var(--color-danger)', border: '1px solid rgba(217,95,95,0.3)' }}>
              <Trash2 className="w-3.5 h-3.5" /> Ta bort
            </button>
            <button onClick={() => setShowActions(false)} className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        }
      </AnimatePresence>

      {tx.aiNote &&
      <div className="pb-3 pl-5">
          <p className="text-[13px] text-white/55 flex gap-2">
            <Bot className="w-4 h-4 flex-shrink-0 text-[#9FB5FF]" />
            {tx.aiNote}
          </p>
        </div>
      }
    </div>);

}

function MonthGroup({ group, onDelete, onEdit, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const net = netAmount(group.txs);
  const totalOut = group.txs.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalIn = group.txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="mb-3">
      {/* Month header — tappable to expand/collapse */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3 active:opacity-70">
        <div className="flex items-center gap-3">
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-white/45" />
          </motion.div>
          <div className="text-left">
            <p className="text-[17px] font-semibold text-white capitalize">{group.label}</p>
            <p className="text-[13px] text-white/45">{group.txs.length} transaktioner</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-[15px] font-semibold tabular-nums ${net >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {net >= 0 ? '+' : ''}{net.toLocaleString('sv-SE')} kr
          </p>
          <p className="text-[12px] text-white/40 tabular-nums">
            <span className="text-emerald-300/80">+{totalIn.toLocaleString('sv-SE')}</span>
            {' · '}
            <span className="text-rose-300/80">-{totalOut.toLocaleString('sv-SE')}</span>
          </p>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open &&
        <motion.div
          key="content"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden">
            {group.txs.map((tx, i) => (
              <React.Fragment key={tx.id}>
                {i > 0 && <DashboardDivider />}
                <TransactionRow tx={tx} onDelete={onDelete} onEdit={onEdit} />
              </React.Fragment>
            ))}
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}

export default function TransactionHistory() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isDemoMode, demoTransactions } = useDemoMode();
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  // Läs flik och kategorifilter från URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const tab = params.get('tab');
    if (cat) {
      setFilterCategory(cat);
      setShowFilters(true);
      setActiveTab('list');
    } else if (tab === 'insights') {
      setActiveTab('insights');
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'insights' || window.location.hash !== '#leakage-detector') return;
    const t = setTimeout(() => {
      document.getElementById('leakage-detector')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
    return () => clearTimeout(t);
  }, [activeTab]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    if (tab === 'insights') {
      params.set('tab', 'insights');
      params.delete('category');
      setFilterCategory('');
    } else {
      params.delete('tab');
    }
    const qs = params.toString();
    navigate(`${createPageUrl('TransactionHistory')}${qs ? `?${qs}` : ''}`, { replace: true });
  };

  const { data: dbTransactions = [], isLoading } = useQuery({
    queryKey: ['transactions', 'personal'],
    queryFn: async () => {
      const all = await base44.entities.Transaction.list('-created_date', 1000);
      return (all || []).filter(t => t.context !== 'BUSINESS');
    },
    enabled: !isDemoMode,
  });

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    },
    enabled: activeTab === 'insights' && !isDemoMode,
  });

  // I demo-läge: använd hårdkodat Alex-data, annars riktig DB
  const transactions = isDemoMode ? demoTransactions : dbTransactions;

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (search && !`${tx.label} ${tx.vendor || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType && tx.type !== filterType) return false;
      if (filterCategory && tx.category !== filterCategory) return false;
      return true;
    });
  }, [transactions, search, filterType, filterCategory]);

  const groups = useMemo(() => groupByMonth(filtered), [filtered]);

  const totalIn = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const handleDelete = async (id) => {
    await base44.entities.Transaction.delete(id);
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  const handleEdit = (tx) => {setEditingTx(tx);setShowForm(true);};
  const handleFormSuccess = () => {setShowForm(false);setEditingTx(null);queryClient.invalidateQueries({ queryKey: ['transactions'] });};

  const activeFilterCount = [filterType, filterCategory].filter(Boolean).length;

  const headerExtra = filterCategory ? (
    <button
      type="button"
      onClick={() => { setFilterCategory(''); navigate(createPageUrl('TransactionHistory')); }}
      className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-[#9FB5FF]"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      Tillbaka till översikt
    </button>
  ) : null;

  return (
    <PageShell
      title="Transaktioner"
      subtitle={activeTab === 'insights' ? 'Insikter & kategorier' : filterCategory ? `Filtrerat: ${CATEGORY_LABELS[filterCategory] || filterCategory}` : 'Historik'}
      backHref={createPageUrl('Dashboard')}
    >
      {headerExtra}

      <SegmentTabs
        value={activeTab}
        onChange={switchTab}
        className="mb-4"
        tabs={[
          { id: 'list', label: 'Lista', icon: List },
          { id: 'insights', label: 'Insikter', icon: TrendingUp },
        ]}
      />

      {activeTab === 'insights' ? (
        <TransactionInsightsPanel
          transactions={transactions}
          isLoading={isLoading}
          profile={profile}
        />
      ) : (
        <>
      <p className={`${sectionSubtitleClass} mb-3`}>{filtered.length} poster</p>

      <div className="flex gap-2 mb-2">
        <div className={`flex-1 flex items-center gap-2 px-4 ${anchorInputClass}`}>
          <Search className="w-4 h-4 flex-shrink-0 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sök ICA, Hyra..."
            className="flex-1 text-[15px] outline-none bg-transparent min-w-0 text-white placeholder:text-white/35" />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label="Rensa sökning">
              <X className="w-3.5 h-3.5 text-white/40" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={`relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            showFilters ? 'bg-white text-[#0a1628]' : 'bg-white/[0.08] text-white/70'
          }`}
        >
          <Filter className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters &&
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          className="mt-2 overflow-hidden">
          
            <div className="space-y-4 py-2">
              <div>
                <p className="text-[13px] text-white/45 mb-2">Typ</p>
                <div className="flex gap-2 flex-wrap">
                  {TYPE_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setFilterType(o.value)}
                      className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                        filterType === o.value ? 'bg-white text-[#0a1628]' : 'bg-white/[0.08] text-white/70'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[13px] text-white/45 mb-2">Kategori</p>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORY_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setFilterCategory(o.value)}
                      className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                        filterCategory === o.value ? 'bg-white text-[#0a1628]' : 'bg-white/[0.08] text-white/70'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      {filtered.length > 0 && (
        <DashboardStatStrip
          items={[
            { label: 'In', value: `+${totalIn.toLocaleString('sv-SE')} kr` },
            { label: 'Ut', value: `-${totalOut.toLocaleString('sv-SE')} kr` },
            {
              label: 'Netto',
              value: `${(totalIn - totalOut).toLocaleString('sv-SE')} kr`,
            },
          ]}
        />
      )}

      {/* Loading */}
      {isLoading &&
      <div className="space-y-2 px-4 sm:px-5 mt-4">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 rounded-2xl skeleton" />)}
        </div>
      }

      {/* Empty state */}
      {!isLoading && transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileUp className="w-10 h-10 mb-4 text-white/35" />
          <p className="text-[17px] font-semibold text-white mb-1">Inga transaktioner än</p>
          <p className={sectionSubtitleClass}>Importera från bank eller lägg till manuellt.</p>
          <div className="flex flex-col gap-3 w-full max-w-xs mt-6">
            <Link to="/Import" className="anchor-btn-primary w-full">
              <FileUp className="w-4 h-4" /> Importera
            </Link>
            <button type="button" onClick={() => setShowForm(true)} className="anchor-btn-secondary w-full">
              Lägg till manuellt
            </button>
          </div>
        </div>
      )}

      {/* No search results */}
      {!isLoading && transactions.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="w-10 h-10 mb-3 text-white/35" />
          <p className="text-[17px] font-semibold text-white">Inga resultat</p>
          <p className={sectionSubtitleClass}>Prova ett annat sökord eller filter.</p>
        </div>
      )}

      {/* Month groups */}
      <div className="mt-6 space-y-6">
        {groups.map((group, i) =>
        <MonthGroup
          key={group.key}
          group={group}
          onDelete={handleDelete}
          onEdit={handleEdit}
          defaultOpen={i === 0} // Only today/latest month open by default
        />
        )}
      </div>

      {/* FAB */}
      <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
      onClick={() => {setEditingTx(null);setShowForm(true);}}
      className="fixed bottom-24 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center z-40 bg-white text-slate-900 shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
        <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
      </motion.button>
        </>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm &&
        <TransactionForm
          existingTx={editingTx}
          onSuccess={handleFormSuccess}
          onClose={() => {setShowForm(false);setEditingTx(null);}} />

        }
      </AnimatePresence>
    </PageShell>
  );

}