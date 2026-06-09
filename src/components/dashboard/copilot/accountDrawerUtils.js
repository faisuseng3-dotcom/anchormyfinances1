import { getMonthlyMargin, getTotalFixedCosts } from '@/lib/financialUtils';
import { fmtKr } from './copilotDashboardUtils';

const BUFFER_TX = new Set(['transfer_to_spending', 'transfer_to_savings', 'income', 'expense', 'shopping']);
const SAVINGS_TX = new Set(['transfer_to_savings', 'transfer_to_spending', 'savings_deposit', 'savings_withdrawal']);

function formatTransferDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const txDay = new Date(date);
  txDay.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - txDay.getTime()) / 86400000);
  if (diff === 0) return 'Idag';
  if (diff === 1) return 'Igår';
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

/** Senaste överföringar per konto */
export function getAccountTransferHistory(accountId, transactions = [], limit = 6) {
  const filterSet = accountId === 'savings' ? SAVINGS_TX : BUFFER_TX;
  return [...transactions]
    .filter((tx) => tx.context !== 'BUSINESS' && filterSet.has(tx.type))
    .sort(
      (a, b) =>
        new Date(b.created_date || b.date).getTime() - new Date(a.created_date || a.date).getTime(),
    )
    .slice(0, limit)
    .map((tx) => {
      const incoming =
        tx.type === 'transfer_to_spending' && accountId === 'buffer'
        || tx.type === 'transfer_to_savings' && accountId === 'savings'
        || tx.type === 'income' && accountId === 'buffer';
      const label = tx.label || tx.vendor || tx.description || 'Överföring';
      return {
        id: tx.id,
        label,
        dateLabel: formatTransferDate(tx.created_date || tx.date),
        amount: Math.abs(tx.amount),
        incoming,
        signed: incoming ? '+' : '−',
      };
    });
}

/** Pedagogisk marginalnedbrytning */
export function buildMarginBreakdown(profile) {
  const income = profile?.income || 0;
  const fixed = getTotalFixedCosts(profile);
  const autoSave = profile?.savingsGoalMonthlyTarget || 0;
  const margin = getMonthlyMargin(profile);
  const afterAuto = Math.max(0, margin - autoSave);

  return {
    income,
    fixed,
    autoSave,
    margin,
    afterAuto,
    rows: [
      { key: 'income', label: 'Total inkomst', amount: income, sign: '+' },
      { key: 'fixed', label: 'Fasta räkningar', amount: fixed, sign: '−' },
      ...(autoSave > 0
        ? [{ key: 'auto', label: 'Planerat auto-sparande', amount: autoSave, sign: '−' }]
        : []),
    ],
  };
}

/** Motiverande jämförelse — stabil heuristik utifrån spargrad */
export function getPeerSavingsPercentile(profile) {
  const income = profile?.income || 0;
  if (income <= 0) return 55;
  const rate = getMonthlyMargin(profile) / income;
  return Math.min(92, Math.max(38, Math.round(42 + rate * 110)));
}

export function accountGoalPct(current, target) {
  if (!target || target <= 0) return null;
  return Math.min(100, Math.round(((current || 0) / target) * 100));
}

export { fmtKr };
