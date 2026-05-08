/**
 * SpendingHubModule — "Betalningslinje"
 * Kronologisk timeline-vy. Flexbox: [Datum 20%] [Emoji+Namn 50%] [Belopp 30%]
 * Separerar "Betalda" (denna månaden) och "Kommande" (framtida).
 */
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { createPageUrl } from '@/utils';

const CATEGORY_META = {
  food:          { emoji: '🍽️' },
  transport:     { emoji: '🚊' },
  entertainment: { emoji: '🎮' },
  shopping:      { emoji: '🛍️' },
  health:        { emoji: '💊' },
  home:          { emoji: '🏠' },
  savings:       { emoji: '🐷' },
  travel:        { emoji: '✈️' },
  income:        { emoji: '🏦' },
  other:         { emoji: '📦' },
};

function getEmoji(category, amount) {
  if (category && CATEGORY_META[category]) return CATEGORY_META[category].emoji;
  return amount > 0 ? '🏦' : '📦';
}

// Lokalt datumformat: "25 maj", "1 jun"
function fmt(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

// Alex Mode: hårdkodade kommande betalningar (Hyra 1 juni, Spotify 15 juni)
const ALEX_PENDING = [
  {
    id: 'ap_rent',
    label: 'Hyra',
    category: 'home',
    amount: -9500,
    dueDate: '2026-06-01T12:00:00',
    dueLabel: 'Dras 1 juni',
  },
  {
    id: 'ap_spotify',
    label: 'Spotify',
    category: 'entertainment',
    amount: -119,
    dueDate: '2026-06-15T12:00:00',
    dueLabel: 'Dras 15 juni',
  },
];

// Bygg generiska kommande-poster från profil (non-Alex)
function buildPendingFromProfile(profile) {
  if (!profile) return [];
  const now = new Date();
  const results = [];

  const RULES = [
    { match: 'hyra',    category: 'home',          day: 1,  nextMonth: true,  label: 'Hyra' },
    { match: 'spotify', category: 'entertainment',  day: 15, nextMonth: true,  label: 'Spotify' },
    { match: 'netflix', category: 'entertainment',  day: 26, nextMonth: false, label: 'Netflix' },
    { match: 'disney',  category: 'entertainment',  day: 30, nextMonth: true,  label: 'Disney+' },
    { match: 'sl',      category: 'transport',      day: 28, nextMonth: false, label: 'SL Månadskort' },
    { match: 'csn',     category: 'other',          day: 26, nextMonth: false, label: 'CSN' },
  ];

  (profile.fixedCostItems || []).forEach(item => {
    const lower = item.label.toLowerCase();
    const rule = RULES.find(r => lower.includes(r.match));
    if (!rule) return;

    const month = rule.nextMonth ? now.getMonth() + 1 : now.getMonth();
    const dueDate = new Date(now.getFullYear(), month, rule.day, 12, 0, 0);
    if (dueDate <= now) dueDate.setMonth(dueDate.getMonth() + 1);

    results.push({
      id: `pend_${item.id}`,
      label: rule.label || item.label,
      category: rule.category,
      amount: -item.amount,
      dueDate: dueDate.toISOString(),
      dueLabel: `Dras ${rule.day}:${rule.day === 1 ? 'a' : 'e'}`,
    });
  });

  return results;
}

export default function SpendingHubModule({ transactions = [], profile }) {
  const navigate = useNavigate();
  const isAlexMode = profile?._alexMode === true;

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  // ── Betalda: transaktioner denna månaden, exkl. sparande ──
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

  // ── Kommande: Alex-hårdkodad eller byggt från profil ──
  const pendingItems = useMemo(() => {
    return isAlexMode ? ALEX_PENDING : buildPendingFromProfile(profile);
  }, [isAlexMode, profile]);

  const handlePaidClick = (tx) => {
    navigate(`${createPageUrl('TransactionHistory')}?category=${tx.category || ''}`);
  };

  const hasAny = paidItems.length > 0 || pendingItems.length > 0;

  return (
    <div
      className="mx-5 mt-3 rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 pt-4 pb-3"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
      >
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          💳 Betalningslinje
        </p>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {paidItems.length} betalda
        </span>
      </div>

      {!hasAny && (
        <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
          Inga transaktioner denna månad.
        </p>
      )}

      {/* ── KOMMANDE ── */}
      {pendingItems.length > 0 && (
        <div className="px-3 pt-3 pb-2">
          {/* Sektion-label */}
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Clock className="w-3 h-3" style={{ color: '#D69E2E' }} />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#D69E2E' }}>
              Kommande
            </p>
          </div>

          {/* Kommande-ram */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: 'rgba(214,158,46,0.07)', border: '1px dashed rgba(214,158,46,0.30)' }}
          >
            {[...pendingItems]
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .map((item, i, arr) => (
                <div
                  key={item.id}
                  className="flex items-center px-3 py-3"
                  style={{
                    borderBottom: i < arr.length - 1 ? '1px solid rgba(214,158,46,0.12)' : 'none',
                  }}
                >
                  {/* Datum — 20% */}
                  <div className="flex-shrink-0" style={{ width: '22%' }}>
                    <p className="text-xs font-black" style={{ color: '#E9A825' }}>
                      {fmt(item.dueDate)}
                    </p>
                    <p className="text-[9px] leading-tight mt-0.5" style={{ color: 'rgba(214,158,46,0.65)' }}>
                      {item.dueLabel}
                    </p>
                  </div>

                  {/* Emoji + Namn — flex-1 */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-base flex-shrink-0">{getEmoji(item.category, item.amount)}</span>
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {item.label}
                    </p>
                  </div>

                  {/* Belopp — 28% */}
                  <p
                    className="font-black text-sm text-right flex-shrink-0"
                    style={{ width: '28%', color: item.amount >= 0 ? '#3DAA7A' : '#E53E3E' }}
                  >
                    {item.amount >= 0 ? '+' : ''}
                    {item.amount.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── BETALDA ── */}
      {paidItems.length > 0 && (
        <div className="pb-2">
          {/* Sektion-label */}
          <div className="flex items-center gap-1.5 px-5 pt-3 pb-1">
            <CheckCircle2 className="w-3 h-3" style={{ color: '#3DAA7A' }} />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              Denna månad
            </p>
          </div>

          {paidItems.map((tx, i) => {
            const isPositive = tx.amount > 0 || tx.type === 'income';
            return (
              <motion.button
                key={tx.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025 }}
                onClick={() => handlePaidClick(tx)}
                className="w-full flex items-center px-5 py-2.5 text-left active:opacity-70 transition-opacity"
                style={{
                  borderBottom: i < paidItems.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                }}
              >
                {/* Datum — 20% */}
                <div className="flex-shrink-0" style={{ width: '22%' }}>
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    {fmt(tx.created_date)}
                  </p>
                </div>

                {/* Emoji + Namn — flex-1 */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm flex-shrink-0">{getEmoji(tx.category, tx.amount)}</span>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                    {tx.vendor || tx.label}
                  </p>
                </div>

                {/* Belopp — 28% */}
                <p
                  className="text-xs font-bold flex-shrink-0 text-right"
                  style={{ width: '28%', color: isPositive ? '#3DAA7A' : '#E53E3E' }}
                >
                  {isPositive ? '+' : ''}
                  {Math.abs(tx.amount).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                </p>

                <ChevronRight className="w-3 h-3 ml-1 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}