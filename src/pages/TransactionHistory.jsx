import React, { useState, useRef, useMemo, useEffect } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Bot, Search, Filter, FileUp, ChevronDown, ArrowLeft, List, TrendingUp, LineChart, BookOpen } from 'lucide-react';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionInsightsPanel from '@/components/transactions/TransactionInsightsPanel';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useModeContext } from '@/components/modes/ModeContext';
import FinancialTrendsPanel from '@/components/history/FinancialTrendsPanel';
import LedgerVaultPanel from '@/components/history/LedgerVaultPanel';
import {
  DEFAULT_HISTORY_TAB,
  HISTORY_LEDGER_TAB,
  HISTORY_TABS,
  normalizeHistoryTab,
} from '@/lib/historyTabs';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useOptimisticTransactions } from '@/hooks/useOptimisticTransactions';
import { TransactionListSkeleton } from '@/components/loading/SkeletonBlocks';
import { createPageUrl } from '@/utils';
import PageShell from '@/components/layout/PageShell';
import SegmentTabs from '@/components/ui/SegmentTabs';
import { DashboardStatStrip } from '@/components/dashboard/DashboardChrome';
import { sectionSubtitleClass } from '@/lib/anchorTheme';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import TintIconCard from '@/components/ui-premium/copilot/TintIconCard';
import StreakBadge from '@/components/ui-premium/copilot/StreakBadge';
import CopilotCard from '@/components/ui-premium/copilot/CopilotCard';
import { copilotInputClass, copilotChipClass } from '@/lib/copilotTheme';
import { calcUnderBudgetStreak } from '@/lib/budgetStreak';
import { calcSavingsStreak } from '@/lib/microWins';
import { cn } from '@/lib/utils';

const filterChipClass = (active) => copilotChipClass(active);

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

  const handleLongPressStart = () => { longPressTimer.current = setTimeout(() => setShowActions(true), 500); };
  const handleLongPressEnd = () => { clearTimeout(longPressTimer.current); };

  const amountLabel = `${isPositive ? '+' : '−'}${Math.abs(tx.amount).toLocaleString('sv-SE')} kr`;

  return (
    <div className={tx._optimistic ? 'opacity-70' : ''}>
      <div
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
      >
        <TintIconCard
          category={tx.category || (isPositive ? 'income' : 'other')}
          title={tx.vendor || tx.label}
          subtitle={`${CATEGORY_LABELS[tx.category] || 'Övrigt'} · ${getTxDate(tx).toLocaleDateString('sv-SE')}`}
          amount={amountLabel}
          amountPositive={isPositive}
          onClick={() => { if (!showActions) onEdit(tx); }}
        />
      </div>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 mt-2 overflow-hidden"
          >
            <AnchorPressable
              type="button"
              onClick={() => { onEdit(tx); setShowActions(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-semibold min-h-10 bg-[rgba(74,122,255,0.15)] text-[var(--copilot-accent-cyan)] border border-[rgba(74,122,255,0.25)]"
            >
              <Edit2 className="w-3.5 h-3.5" /> Redigera
            </AnchorPressable>
            <AnchorPressable
              type="button"
              onClick={() => { onDelete(tx.id); setShowActions(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-semibold bg-rose-500/15 text-rose-200 border border-rose-400/30 min-h-10"
            >
              <Trash2 className="w-3.5 h-3.5" /> Ta bort
            </AnchorPressable>
          </motion.div>
        )}
      </AnimatePresence>

      {tx.aiNote && (
        <div className="mt-2 px-3 pb-1">
          <p className="text-[12px] text-[var(--copilot-text-secondary)] flex gap-2">
            <Bot className="w-4 h-4 flex-shrink-0 text-[var(--copilot-accent-blue)]" />
            {tx.aiNote}
          </p>
        </div>
      )}
    </div>
  );
}

function MonthGroup({ group, onDelete, onEdit, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const net = netAmount(group.txs);
  const totalOut = group.txs.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalIn = group.txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="mb-3">
      {/* Month header — tappable to expand/collapse */}
      <AnchorPressable
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3 min-h-12"
        minTouch={false}
      >
        <div className="flex items-center gap-3">
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          </motion.div>
          <div className="text-left">
            <p className="text-[17px] font-semibold text-[var(--color-text-primary)] capitalize">{group.label}</p>
            <p className="text-[13px] text-[var(--color-text-tertiary)]">{group.txs.length} transaktioner</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-[15px] font-semibold tabular-nums ${net >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {net >= 0 ? '+' : ''}{net.toLocaleString('sv-SE')} kr
          </p>
          <p className="text-[12px] text-[var(--color-text-tertiary)] tabular-nums">
            <span className="text-emerald-300/80">+{totalIn.toLocaleString('sv-SE')}</span>
            {' · '}
            <span className="text-rose-300/80">-{totalOut.toLocaleString('sv-SE')}</span>
          </p>
        </div>
      </AnchorPressable>

      <AnimatePresence initial={false}>
        {open &&
        <motion.div
          key="content"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden">
            <div className="space-y-2 pt-1">
              {group.txs.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} onDelete={onDelete} onEdit={onEdit} />
              ))}
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}

export default function TransactionHistory() {
  const { deleteTransaction } = useOptimisticTransactions();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isBusiness } = useModeContext();
  const { profile } = useFinancialProfile();
  const { transactions, isLoading } = useTransactions({ personalOnly: true, limit: 1000 });
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const activeTab = normalizeHistoryTab(searchParams.get('tab'), { includeLedger: isBusiness });

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setFilterCategory(cat);
      setShowFilters(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isBusiness && searchParams.get('tab') === 'ledger') {
      setSearchParams({}, { replace: true });
    }
  }, [isBusiness, searchParams, setSearchParams]);

  useEffect(() => {
    if (activeTab !== 'insights' || window.location.hash !== '#leakage-detector') return;
    const t = setTimeout(() => {
      document.getElementById('leakage-detector')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
    return () => clearTimeout(t);
  }, [activeTab]);

  const switchTab = (tab) => {
    const next = normalizeHistoryTab(tab, { includeLedger: isBusiness });
    const params = new URLSearchParams(searchParams);
    if (next === DEFAULT_HISTORY_TAB) {
      params.delete('tab');
    } else {
      params.set('tab', next);
    }
    if (next !== 'list') {
      params.delete('category');
      setFilterCategory('');
    }
    setSearchParams(params, { replace: true });
  };

  const historyTabs = [
    ...HISTORY_TABS.map((t) => ({
      id: t.id,
      label: t.label,
      icon: t.id === 'list' ? List : t.id === 'insights' ? TrendingUp : LineChart,
    })),
    ...(isBusiness ? [{ id: HISTORY_LEDGER_TAB.id, label: HISTORY_LEDGER_TAB.label, icon: BookOpen }] : []),
  ];


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

  const handleDelete = (id) => {
    deleteTransaction(id);
  };

  const handleEdit = (tx) => {setEditingTx(tx);setShowForm(true);};
  const handleFormSuccess = () => {setShowForm(false);setEditingTx(null);};

  const activeFilterCount = [filterType, filterCategory].filter(Boolean).length;

  const headerExtra = filterCategory ? (
    <AnchorPressable
      type="button"
      onClick={() => { setFilterCategory(''); navigate(createPageUrl('TransactionHistory')); }}
      className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-[var(--color-accent)] min-h-0 h-auto px-0 py-1"
      minTouch={false}
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      Tillbaka till översikt
    </AnchorPressable>
  ) : null;

  return (
    <PageShell
      title="Historik"
      subtitle={
        activeTab === 'insights' ? 'Insikter & kategorier'
          : activeTab === 'trends' ? 'Utveckling över tid'
            : activeTab === 'ledger' ? 'Företagsverifikat'
              : filterCategory ? `Filtrerat: ${CATEGORY_LABELS[filterCategory] || filterCategory}`
                : 'Transaktioner & filter'
      }
      backHref={createPageUrl('Dashboard')}
    >
      {headerExtra}

      <SegmentTabs
        value={activeTab}
        onChange={switchTab}
        className="mb-4"
        tabs={historyTabs}
      />

      {activeTab === 'insights' ? (
        <TransactionInsightsPanel
          transactions={transactions}
          isLoading={isLoading}
          profile={profile}
        />
      ) : activeTab === 'trends' ? (
        <FinancialTrendsPanel />
      ) : activeTab === 'ledger' ? (
        <LedgerVaultPanel />
      ) : (
        <>
      <div className="flex flex-wrap gap-2 mb-3">
        <StreakBadge count={calcUnderBudgetStreak(profile, transactions)} label="dagar under budget" variant="budget" />
        <StreakBadge count={calcSavingsStreak(transactions)} label="dagars sparande" variant="save" />
      </div>

      <p className={`${sectionSubtitleClass} mb-3`}>{filtered.length} poster</p>

      <div className="flex gap-2 mb-2">
        <div className={`flex-1 flex items-center gap-2 px-4 min-h-12 ${copilotInputClass}`}>
          <Search className="w-4 h-4 flex-shrink-0 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sök ICA, Hyra..."
            className="flex-1 text-[15px] outline-none bg-transparent min-w-0 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]" />
          {search && (
            <AnchorPressable
              type="button"
              onClick={() => setSearch('')}
              aria-label="Rensa sökning"
              className="min-h-0 min-w-0 h-8 w-8 rounded-full"
            >
              <X className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
            </AnchorPressable>
          )}
        </div>
        <AnchorPressable
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-label="Filter"
          className={cn(
            'relative w-12 h-12 rounded-[var(--anchor-radius-md)] flex items-center justify-center shrink-0',
            showFilters
              ? 'bg-[var(--color-text-primary)] text-[var(--color-background-primary)] anchor-elev-2'
              : 'bg-white/[0.08] text-[var(--color-text-secondary)] anchor-elev-1',
          )}
        >
          <Filter className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </AnchorPressable>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters &&
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          className="mt-2 overflow-hidden">
          
            <CopilotCard className="!p-4">
              <div>
                <p className="text-[13px] text-[var(--color-text-tertiary)] mb-2">Typ</p>
                <div className="flex gap-2 flex-wrap">
                  {TYPE_OPTIONS.map((o) => (
                    <AnchorPressable
                      key={o.value}
                      type="button"
                      onClick={() => setFilterType(o.value)}
                      className={filterChipClass(filterType === o.value)}
                      minTouch={false}
                    >
                      {o.label}
                    </AnchorPressable>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[13px] text-[var(--color-text-tertiary)] mb-2">Kategori</p>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORY_OPTIONS.map((o) => (
                    <AnchorPressable
                      key={o.value}
                      type="button"
                      onClick={() => setFilterCategory(o.value)}
                      className={filterChipClass(filterCategory === o.value)}
                      minTouch={false}
                    >
                      {o.label}
                    </AnchorPressable>
                  ))}
                </div>
              </div>
            </CopilotCard>
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
      {isLoading && (
        <div className="mt-4 px-1">
          <TransactionListSkeleton rows={7} />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileUp className="w-10 h-10 mb-4 text-[var(--color-text-tertiary)]" />
          <p className="text-[17px] font-semibold text-[var(--color-text-primary)] mb-1">Inga transaktioner än</p>
          <p className={sectionSubtitleClass}>Importera från bank eller lägg till manuellt.</p>
          <div className="flex flex-col gap-3 w-full max-w-xs mt-6">
            <Link to="/Import" className="anchor-btn-primary w-full">
              <FileUp className="w-4 h-4" /> Importera
            </Link>
            <AnchorPressable
              type="button"
              onClick={() => setShowForm(true)}
              className="anchor-btn-secondary w-full min-h-[52px]"
            >
              Lägg till manuellt
            </AnchorPressable>
          </div>
        </div>
      )}

      {/* No search results */}
      {!isLoading && transactions.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="w-10 h-10 mb-3 text-[var(--color-text-tertiary)]" />
          <p className="text-[17px] font-semibold text-[var(--color-text-primary)]">Inga resultat</p>
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
      <AnchorPressable
        onClick={() => { setEditingTx(null); setShowForm(true); }}
        aria-label="Lägg till transaktion"
        className="fixed bottom-24 right-4 sm:right-6 w-14 h-14 rounded-full z-40 bg-[var(--color-text-primary)] text-[var(--color-background-primary)] anchor-elev-3"
      >
        <Plus className="w-7 h-7" />
      </AnchorPressable>
        </>
      )}

      <TransactionForm
        isOpen={showForm}
        existingTx={editingTx}
        onSuccess={handleFormSuccess}
        onClose={() => { setShowForm(false); setEditingTx(null); }}
      />
    </PageShell>
  );

}

export const pageSeo = pageSeoFor('TransactionHistory');
