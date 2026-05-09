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
import { dashboardGlassSurface, dashboardSectionLabelClass } from '@/components/dashboard/dashboardGlass';

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

function getEmoji(category, amount, override) {
  if (override) return override;
  if (category && CATEGORY_META[category]) return CATEGORY_META[category].emoji;
  return amount > 0 ? '🏦' : '📦';
}

// Lokalt datumformat: "25 maj", "1 jun"
function fmt(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

// Alex Mode: hårdkodade kommande betalningar
const ALEX_PENDING = [
  {
    id: 'ap_rent',
    label: 'Hyra',
    category: 'home',
    amount: -9500,
    dueDate: '2026-06-01T12:00:00',
  },
  {
    id: 'ap_spotify',
    label: 'Spotify',
    category: 'entertainment',
    amount: -119,
    dueDate: '2026-06-15T12:00:00',
  },
  {
    id: 'ap_sats',
    label: 'SATS Gym',
    category: 'health',
    emoji: '🏋️',
    amount: -549,
    dueDate: '2026-06-25T12:00:00',
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

  // ── Betalda: i Alex Mode bara is_recurring, annars alla denna månaden ──
  const paidItems = useMemo(() => {
    return (transactions || [])
      .filter(tx => {
        if (tx.context === 'BUSINESS') return false;
        if (tx._pending) return false;
        if (['savings_deposit', 'transfer_to_savings'].includes(tx.type)) return false;
        if (isAlexMode && !tx.is_recurring) return false;
        const d = new Date(tx.created_date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }, [transactions, thisMonth, thisYear, isAlexMode]);

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
      className="mx-4 sm:mx-5 mt-3 rounded-[26px] overflow-hidden"
      style={dashboardGlassSurface()}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 pt-4 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-sm font-semibold text-white/90">
          Betalningslinje
        </p>
        <span className="text-[11px] font-medium text-white/45">
          {paidItems.length} betalda
        </span>
      </div>

      {!hasAny && (
        <p className="text-sm text-center py-10 px-4 text-white/45">
          Inga transaktioner denna månad.
        </p>
      )}

      {/* ── KOMMANDE ── */}
      {pendingItems.length > 0 && (
        <div className="px-3 pt-3 pb-2">
          {/* Sektion-label */}
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Clock className="w-3.5 h-3.5 text-amber-200/80" />
            <p className={`${dashboardSectionLabelClass} !tracking-[0.16em]`}>
              Kommande
            </p>
          </div>

          {/* Kommande-ram */}
          <div
            className="rounded-[18px] overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            {[...pendingItems]
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .map((item, i, arr) => (
                <div
                  key={item.id}
                  className="flex items-center px-3 py-3"
                  style={{
                    borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  {/* Datum — 20% */}
                  <div className="flex-shrink-0" style={{ width: '22%' }}>
                    <p className="text-xs font-semibold tabular-nums text-white/70">
                      {fmt(item.dueDate)}
                    </p>
                  </div>

                  {/* Emoji + Namn — flex-1 */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-base flex-shrink-0">{getEmoji(item.category, item.amount, item.emoji)}</span>
                    <p className="text-sm font-medium truncate text-white/90">
                      {item.label}
                    </p>
                  </div>

                  {/* Belopp — 28% */}
                  <p
                    className="font-semibold text-sm tabular-nums text-right flex-shrink-0"
                    style={{ width: '28%', color: item.amount >= 0 ? '#9AE6B4' : '#FCA5A5' }}
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
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200/80" />
            <p className={dashboardSectionLabelClass}>
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
                  borderBottom: i < paidItems.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                {/* Datum — 20% */}
                <div className="flex-shrink-0" style={{ width: '22%' }}>
                  <p className="text-xs font-medium tabular-nums text-white/55">
                    {fmt(tx.created_date)}
                  </p>
                </div>

                {/* Emoji + Namn — flex-1 */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm flex-shrink-0">{getEmoji(tx.category, tx.amount)}</span>
                  <p className="text-xs truncate text-white/75">
                    {tx.vendor || tx.label}
                  </p>
                </div>

                {/* Belopp — 28% */}
                <p
                  className="text-xs font-bold flex-shrink-0 text-right"
                  style={{ width: '28%', color: isPositive ? '#9AE6B4' : '#FCA5A5' }}
                >
                  {isPositive ? '+' : ''}
                  {Math.abs(tx.amount).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                </p>

                <ChevronRight className="w-3.5 h-3.5 ml-1 flex-shrink-0 text-white/30" />
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}