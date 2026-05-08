/**
 * SpendingHubModule — "Betalningslinje"
 * Kronologisk rad-baserad vy av utgifter och inkomster.
 * Delade i "Betalda" och "Kommande".
 */
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
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
  income:        { label: 'Inkomst',        emoji: '🏦', color: '#3DAA7A' },
  other:         { label: 'Övrigt',         emoji: '📦', color: '#8B97A8' },
};

// Formatera datum som "25 maj" eller "1 juni"
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

// Bygg planerade/kommande poster från profil
function buildPendingItems(profile) {
  if (!profile) return [];
  const now = new Date();
  const pending = [];

  const SCHEDULED = [
    { labelMatch: 'hyra',    dueLabel: 'Dras 1:a varje månad',  category: 'home',          dayOfMonth: 1  },
    { labelMatch: 'csn',     dueLabel: 'Dras 26:e varje månad', category: 'other',         dayOfMonth: 26 },
    { labelMatch: 'sl',      dueLabel: 'Dras månadsvis',         category: 'transport',     dayOfMonth: 28 },
    { labelMatch: 'netflix', dueLabel: 'Dras nästa månad',       category: 'entertainment', dayOfMonth: 30 },
    { labelMatch: 'spotify', dueLabel: 'Dras 15:e juni',         category: 'entertainment', dayOfMonth: 15, nextMonth: true },
    { labelMatch: 'disney',  dueLabel: 'Dras nästa månad',       category: 'entertainment', dayOfMonth: 30 },
  ];

  (profile.fixedCostItems || []).forEach(item => {
    const lower = item.label.toLowerCase();
    const sched = SCHEDULED.find(s => lower.includes(s.labelMatch));
    if (sched) {
      // Räkna ut nästa dragdatum
      const nextDate = new Date(now.getFullYear(), sched.nextMonth ? now.getMonth() + 1 : now.getMonth(), sched.dayOfMonth, 12, 0, 0);
      // Om datumet redan passerat denna månad, skjut till nästa
      if (nextDate <= now && !sched.nextMonth) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      pending.push({
        id: `pending_${item.id}`,
        label: item.label,
        vendor: item.label,
        amount: -item.amount,
        dueLabel: sched.dueLabel,
        category: sched.category,
        created_date: nextDate.toISOString(),
        _pending: true,
      });
    }
  });

  // Abonnemang utan matchande fixedCostItem
  (profile.subscriptions || []).forEach(sub => {
    const alreadyIn = pending.some(p => p.label.toLowerCase().includes(sub.name.toLowerCase()));
    if (!alreadyIn) {
      const nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 5, 12, 0, 0);
      pending.push({
        id: `pending_sub_${sub.name}`,
        label: sub.name,
        vendor: sub.name,
        amount: -sub.amount,
        dueLabel: 'Dras nästa period',
        category: sub.category === 'streaming' ? 'entertainment' : (sub.category || 'other'),
        created_date: nextDate.toISOString(),
        _pending: true,
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

  // Hämta transaktioner för aktuell månad (lokal tid)
  const paidItems = useMemo(() => {
    return (transactions || [])
      .filter(tx => {
        if (tx.context === 'BUSINESS') return false;
        if (['savings_deposit', 'transfer_to_savings'].includes(tx.type)) return false;
        const d = new Date(tx.created_date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [transactions, thisMonth, thisYear]);

  const pendingItems = useMemo(() => buildPendingItems(profile), [profile]);

  const handleRowClick = (tx) => {
    if (tx._pending) return; // Kommande — ingen deep-dive ännu
    navigate(`${createPageUrl('TransactionHistory')}?category=${tx.category || ''}`);
  };

  const hasAny = paidItems.length > 0 || pendingItems.length > 0;

  return (
    <div className="mx-5 mt-3 rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          💳 Betalningslinje
        </p>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {paidItems.length} poster
        </span>
      </div>

      {!hasAny && (
        <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
          Inga transaktioner denna månad.
        </p>
      )}

      {/* Kommande */}
      {pendingItems.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 px-5 pt-3 pb-1">
            <Clock className="w-3 h-3" style={{ color: 'var(--color-warning)' }} />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-warning)' }}>
              Kommande
            </p>
          </div>
          <div className="mx-3 mb-2 rounded-xl overflow-hidden"
            style={{ background: 'rgba(214,158,46,0.06)', border: '1px dashed rgba(214,158,46,0.25)' }}>
            {pendingItems
              .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
              .map((item, i) => {
                const meta = CATEGORY_META[item.category] || CATEGORY_META.other;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-0 px-3 py-2.5"
                    style={{ borderBottom: i < pendingItems.length - 1 ? '1px solid rgba(214,158,46,0.12)' : 'none' }}
                  >
                    {/* Datum */}
                    <div className="w-[20%] flex-shrink-0">
                      <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        {formatDate(item.created_date)}
                      </p>
                      <p className="text-[9px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
                        {item.dueLabel}
                      </p>
                    </div>
                    {/* Ikon + Namn */}
                    <div className="flex-1 flex items-center gap-1.5 min-w-0">
                      <span className="text-sm flex-shrink-0">{meta.emoji}</span>
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-secondary)' }}>
                        {item.label}
                      </p>
                    </div>
                    {/* Belopp */}
                    <p className="text-xs font-bold flex-shrink-0 w-[30%] text-right"
                      style={{ color: item.amount >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {item.amount >= 0 ? '+' : ''}{item.amount.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                    </p>
                  </motion.div>
                );
              })}
          </div>
        </div>
      )}

      {/* Betalda */}
      {paidItems.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 px-5 pt-2 pb-1">
            <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--color-success)' }} />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              Denna månad
            </p>
          </div>
          <div className="pb-2">
            {paidItems.map((tx, i) => {
              const meta = CATEGORY_META[tx.category] || (tx.amount > 0 ? CATEGORY_META.income : CATEGORY_META.other);
              const isPositive = tx.amount > 0 || tx.type === 'income';
              return (
                <motion.button
                  key={tx.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleRowClick(tx)}
                  className="w-full flex items-center px-5 py-2.5 text-left active:opacity-70"
                  style={{ borderBottom: i < paidItems.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                >
                  {/* Datum */}
                  <div className="w-[20%] flex-shrink-0">
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                      {formatDate(tx.created_date)}
                    </p>
                  </div>
                  {/* Ikon + Namn */}
                  <div className="flex-1 flex items-center gap-1.5 min-w-0">
                    <span className="text-sm flex-shrink-0">{meta.emoji}</span>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                      {tx.vendor || tx.label}
                    </p>
                  </div>
                  {/* Belopp */}
                  <p className="text-xs font-bold flex-shrink-0 w-[30%] text-right"
                    style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {isPositive ? '+' : ''}{Math.abs(tx.amount).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                  </p>
                  <ChevronRight className="w-3 h-3 ml-1 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}