import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Clock } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { DashboardDivider, DashboardListRow, DashboardSection } from './DashboardChrome';
import { sectionMetaClass } from '@/lib/anchorTheme';

const CATEGORY_META = {
  food: { emoji: '🍽️' },
  transport: { emoji: '🚊' },
  entertainment: { emoji: '🎮' },
  shopping: { emoji: '🛍️' },
  health: { emoji: '💊' },
  home: { emoji: '🏠' },
  savings: { emoji: '🐷' },
  travel: { emoji: '✈️' },
  income: { emoji: '🏦' },
  other: { emoji: '📦' },
};

function getEmoji(category, amount, override) {
  if (override) return override;
  if (category && CATEGORY_META[category]) return CATEGORY_META[category].emoji;
  return amount > 0 ? '🏦' : '📦';
}

function fmt(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

const ALEX_PENDING = [
  { id: 'ap_rent', label: 'Hyra', category: 'home', amount: -9500, dueDate: '2026-06-01T12:00:00' },
  { id: 'ap_spotify', label: 'Spotify', category: 'entertainment', amount: -119, dueDate: '2026-06-15T12:00:00' },
  { id: 'ap_sats', label: 'SATS Gym', category: 'health', emoji: '🏋️', amount: -549, dueDate: '2026-06-25T12:00:00' },
];

function buildPendingFromProfile(profile) {
  if (!profile) return [];
  const now = new Date();
  const results = [];
  const RULES = [
    { match: 'hyra', category: 'home', day: 1, nextMonth: true, label: 'Hyra' },
    { match: 'spotify', category: 'entertainment', day: 15, nextMonth: true, label: 'Spotify' },
    { match: 'netflix', category: 'entertainment', day: 26, nextMonth: false, label: 'Netflix' },
    { match: 'disney', category: 'entertainment', day: 30, nextMonth: true, label: 'Disney+' },
    { match: 'sl', category: 'transport', day: 28, nextMonth: false, label: 'SL Månadskort' },
    { match: 'csn', category: 'other', day: 26, nextMonth: false, label: 'CSN' },
  ];

  (profile.fixedCostItems || []).forEach((item) => {
    const lower = item.label.toLowerCase();
    const rule = RULES.find((r) => lower.includes(r.match));
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
    });
  });
  return results;
}

function amountColor(amount) {
  return amount >= 0 ? 'text-emerald-300/90' : 'text-rose-300/90';
}

const VISIBLE_PAID = 5;
const VISIBLE_PENDING = 3;

export default function SpendingHubModule({ transactions = [], profile }) {
  const navigate = useNavigate();
  const isAlexMode = profile?._alexMode === true;

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const paidItems = useMemo(() => {
    return (transactions || [])
      .filter((tx) => {
        if (tx.context === 'BUSINESS') return false;
        if (tx._pending) return false;
        if (['savings_deposit', 'transfer_to_savings'].includes(tx.type)) return false;
        if (isAlexMode && !tx.is_recurring) return false;
        const d = new Date(tx.created_date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [transactions, thisMonth, thisYear, isAlexMode]);

  const pendingItems = useMemo(() => {
    return isAlexMode ? ALEX_PENDING : buildPendingFromProfile(profile);
  }, [isAlexMode, profile]);

  const visiblePaid = paidItems.slice(0, VISIBLE_PAID);
  const hiddenPaidCount = Math.max(0, paidItems.length - visiblePaid.length);
  const sortedPending = useMemo(
    () => [...pendingItems].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [pendingItems],
  );
  const visiblePending = sortedPending.slice(0, VISIBLE_PENDING);
  const hiddenPendingCount = Math.max(0, sortedPending.length - visiblePending.length);

  const hasAny = paidItems.length > 0 || pendingItems.length > 0;
  const historyUrl = createPageUrl('TransactionHistory');

  return (
    <DashboardSection
      title="Betalningar"
      subtitle={hasAny ? `${paidItems.length} betalda denna månad` : undefined}
      actionHref={historyUrl}
      actionLabel={paidItems.length > VISIBLE_PAID ? `Alla ${paidItems.length}` : 'Historik'}
    >
      {!hasAny && (
        <p className="text-[14px] text-white/45 py-4">Inga transaktioner denna månad.</p>
      )}

      {visiblePending.length > 0 && (
        <>
          <p className={`${sectionMetaClass} flex items-center gap-1.5 mb-1`}>
            <Clock className="w-3.5 h-3.5 text-amber-200/70" />
            Kommande
          </p>
          {visiblePending.map((item, i) => (
              <React.Fragment key={item.id}>
                {i > 0 && <DashboardDivider />}
                <DashboardListRow
                  leading={<span className="text-lg">{getEmoji(item.category, item.amount, item.emoji)}</span>}
                  title={item.label}
                  subtitle={fmt(item.dueDate)}
                  trailing={
                    <span className={amountColor(item.amount)}>
                      {item.amount >= 0 ? '+' : ''}
                      {item.amount.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                    </span>
                  }
                  trailingClassName={`text-[15px] font-semibold tabular-nums ${amountColor(item.amount)}`}
                />
              </React.Fragment>
            ))}
          {hiddenPendingCount > 0 && (
            <Link
              to={historyUrl}
              className="mt-2 flex items-center justify-center gap-1 py-2 text-[14px] font-medium text-white/50 hover:text-white/70"
            >
              +{hiddenPendingCount} kommande
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </>
      )}

      {visiblePending.length > 0 && visiblePaid.length > 0 && <DashboardDivider className="my-3" />}

      {visiblePaid.length > 0 && (
        <>
          <p className={`${sectionMetaClass} mb-1`}>Denna månad</p>
          {visiblePaid.map((tx, i) => {
            const isPositive = tx.amount > 0 || tx.type === 'income';
            const amt = isPositive ? tx.amount : -Math.abs(tx.amount);
            return (
              <React.Fragment key={tx.id}>
                {i > 0 && <DashboardDivider />}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <DashboardListRow
                    onClick={() =>
                      navigate(`${createPageUrl('TransactionHistory')}?category=${tx.category || ''}`)
                    }
                    leading={<span className="text-lg">{getEmoji(tx.category, tx.amount)}</span>}
                    title={tx.vendor || tx.label}
                    subtitle={fmt(tx.created_date)}
                    trailing={
                      <span className={amountColor(amt)}>
                        {isPositive ? '+' : ''}
                        {Math.abs(tx.amount).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                      </span>
                    }
                    trailingClassName={`text-[15px] font-semibold tabular-nums ${amountColor(amt)}`}
                  />
                </motion.div>
              </React.Fragment>
            );
          })}
          {hiddenPaidCount > 0 && (
            <Link
              to={historyUrl}
              className="mt-3 flex items-center justify-center gap-1 py-2.5 text-[14px] font-medium text-white/55 hover:text-white/75 border-t border-white/[0.06]"
            >
              Visa alla {paidItems.length} transaktioner
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </>
      )}
    </DashboardSection>
  );
}
