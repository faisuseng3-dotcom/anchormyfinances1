/**
 * SpendingHubModule — "Vart pengarna går"
 * Dynamisk kategoriöversikt med klickbar deep-dive navigation till TransactionHistory.
 * Inkluderar framtida/schemalagda utgifter och real-time sync.
 */
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, TrendingUp } from 'lucide-react';
import { createPageUrl } from '@/utils';

const CATEGORY_META = {
  food:          { label: 'Mat & dryck',   emoji: '🍽️', color: '#4B7CF3' },
  transport:     { label: 'Transport',      emoji: '🚊', color: '#3DAA7A' },
  entertainment: { label: 'Nöje',           emoji: '🎮', color: '#C8923A' },
  shopping:      { label: 'Shopping',       emoji: '🛍️', color: '#B06CF3' },
  health:        { label: 'Hälsa',          emoji: '💊', color: '#3DAABB' },
  home:          { label: 'Bostad',         emoji: '🏠', color: '#5C7CF3' },
  savings:       { label: 'Sparande',       emoji: '🐷', color: '#F6AD55' },
  travel:        { label: 'Resa',           emoji: '✈️', color: '#7C6CF3' },
  other:         { label: 'Övrigt',         emoji: '📦', color: '#8B97A8' },
};

// Planerade/schemalagda framtida utgifter från profil
function buildPendingItems(profile) {
  if (!profile) return [];
  const pending = [];

  // Fasta kostnadsposter med känt nästa dragdatum
  const SCHEDULED = [
    { labelMatch: 'hyra',    dueLabel: 'Dras 1:a varje månad',  category: 'home' },
    { labelMatch: 'csn',     dueLabel: 'Dras 26:e varje månad', category: 'other' },
    { labelMatch: 'sl ',     dueLabel: 'Dras månadsvis',         category: 'transport' },
    { labelMatch: 'netflix', dueLabel: 'Dras nästa månad',       category: 'entertainment' },
    { labelMatch: 'spotify', dueLabel: 'Dras 15:e juni',         category: 'entertainment' },
    { labelMatch: 'disney',  dueLabel: 'Dras nästa månad',       category: 'entertainment' },
  ];

  (profile.fixedCostItems || []).forEach(item => {
    const lower = item.label.toLowerCase();
    const sched = SCHEDULED.find(s => lower.includes(s.labelMatch));
    if (sched) {
      pending.push({
        id: `pending_${item.id}`,
        label: item.label,
        amount: item.amount,
        dueLabel: sched.dueLabel,
        category: sched.category,
      });
    }
  });

  // Abonnemang utan matchande fixedCostItem
  (profile.subscriptions || []).forEach(sub => {
    const alreadyIn = pending.some(p => p.label.toLowerCase().includes(sub.name.toLowerCase()));
    if (!alreadyIn) {
      pending.push({
        id: `pending_sub_${sub.name}`,
        label: sub.name,
        amount: sub.amount,
        dueLabel: 'Dras nästa period',
        category: sub.category === 'streaming' ? 'entertainment' : (sub.category || 'other'),
      });
    }
  });

  return pending;
}

export default function SpendingHubModule({ transactions = [], profile }) {
  const navigate = useNavigate();

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  // Aggregera utgifter per kategori för aktuell månad
  // OBS: Använd lokal tid (inte UTC) för månadsfilter — undviker timezone-bug
  const categoryTotals = useMemo(() => {
    const map = {};
    (transactions || []).forEach(tx => {
      if (tx.context === 'BUSINESS') return;
      if (tx.amount >= 0) return; // bara utgifter
      if (['savings_deposit', 'transfer_to_savings', 'income'].includes(tx.type)) return;

      // Lokal tid — viktigt för att undvika UTC-offsetfel (t.ex. +02:00 Stockholm)
      const dateStr = tx.created_date || tx.date || '';
      const localDate = new Date(dateStr);
      const txMonth = localDate.getMonth();  // lokal tid
      const txYear = localDate.getFullYear(); // lokal tid

      if (txMonth !== thisMonth || txYear !== thisYear) return;

      const cat = tx.category || 'other';
      map[cat] = (map[cat] || 0) + Math.abs(tx.amount);
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amount]) => ({ cat, amount }));
  }, [transactions, thisMonth, thisYear]);

  const pendingItems = useMemo(() => buildPendingItems(profile), [profile]);

  const totalSpent = categoryTotals.reduce((s, c) => s + c.amount, 0);
  const maxAmount = categoryTotals[0]?.amount || 1;

  const handleCategoryClick = (cat) => {
    // Navigera till TransactionHistory med förinställt kategorifilter via URL
    navigate(`${createPageUrl('TransactionHistory')}?category=${cat}`);
  };

  const hasData = categoryTotals.length > 0;

  return (
    <div className="mx-5 mt-3 rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            📊 Vart pengarna går
          </p>
          {hasData && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Totalt spenderat: {totalSpent.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr denna månad
            </p>
          )}
        </div>
        <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
      </div>

      {/* Kategorirad */}
      <div className="px-5 pt-3 pb-2 space-y-2">
        {!hasData && pendingItems.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
            Inga utgifter registrerade än för denna månad.
          </p>
        )}

        {categoryTotals.map(({ cat, amount }, i) => {
          const meta = CATEGORY_META[cat] || CATEGORY_META.other;
          const pct = (amount / maxAmount) * 100;
          return (
            <motion.button
              key={cat}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => handleCategoryClick(cat)}
              className="w-full flex items-center gap-3 py-2.5 rounded-xl px-3 text-left transition-colors active:opacity-70"
              style={{ background: 'rgba(0,0,0,0.02)' }}
            >
              <span className="text-base w-6 flex-shrink-0">{meta.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    {meta.label}
                  </span>
                  <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color: 'var(--color-text-primary)' }}>
                    {amount.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.04 }}
                    className="h-full rounded-full"
                    style={{ background: meta.color }}
                  />
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            </motion.button>
          );
        })}
      </div>

      {/* Planerade/framtida utgifter */}
      {pendingItems.length > 0 && (
        <div className="px-5 pb-4 pt-1">
          <p className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5"
            style={{ color: 'var(--color-text-muted)' }}>
            <Clock className="w-3 h-3" /> Kommande
          </p>
          <div className="space-y-1.5">
            {pendingItems.map(item => {
              const meta = CATEGORY_META[item.category] || CATEGORY_META.other;
              return (
                <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px dashed rgba(0,0,0,0.08)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{meta.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                        {item.label}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {item.dueLabel}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-bold" style={{ color: 'var(--color-danger)' }}>
                    -{item.amount.toLocaleString('sv-SE')} kr
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}