/**
 * Copilot Design DNA — shared tokens matching the premium Dashboard.
 */

import { getMonthlyMargin } from '@/lib/financialUtils';

export const COPILOT_GRADIENT = '#F7F9FC';

/** Organic premium radii — ui-ux-pro-max / MASTER.md */
export const ORGANIC_RADIUS = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  pill: 9999,
};

export const ORGANIC_SHADOW = {
  soft: 'var(--organic-shadow-soft)',
  float: 'var(--organic-shadow-float)',
  lift: 'var(--organic-shadow-lift)',
};

export const copilotColors = {
  bgDeep: '#F7F9FC',
  bgMid: '#F7F9FC',
  card: '#FFFFFF',
  cardHover: '#F1F5F9',
  accentGreen: '#16A34A',
  accentCyan: '#2563EB',
  accentBlue: '#2563EB',
  textPrimary: '#0B1220',
  textSecondary: '#64748B',
  textMuted: 'rgba(11,18,32,0.42)',
  border: 'rgba(11,18,32,0.08)',
  danger: '#DC2626',
};

/**
 * Category tint backgrounds — icons via anchorIcons CategoryIcon.
 * Expense categories share one neutral tint (differentiated by icon shape +
 * label, not hue). Green is reserved for money moving in (income/savings) —
 * the one place a color actually carries semantic meaning.
 */
const NEUTRAL_TINT = { bg: '#EEF2F7', accent: '#64748B' };
const POSITIVE_TINT = { bg: 'rgba(22,163,74,0.1)', accent: '#16A34A' };

export const CATEGORY_TINTS = {
  food: NEUTRAL_TINT,
  transport: NEUTRAL_TINT,
  entertainment: NEUTRAL_TINT,
  travel: NEUTRAL_TINT,
  health: NEUTRAL_TINT,
  home: NEUTRAL_TINT,
  shopping: NEUTRAL_TINT,
  income: POSITIVE_TINT,
  savings: POSITIVE_TINT,
  savings_deposit: POSITIVE_TINT,
  subscription: NEUTRAL_TINT,
  other: NEUTRAL_TINT,
};

export function getCategoryTint(category) {
  return CATEGORY_TINTS[category] || CATEGORY_TINTS.other;
}

export const copilotPageClass =
  'min-h-screen min-h-[100dvh] overflow-x-hidden anchor-page copilot-subpage';

export const copilotCardClass =
  'copilot-surface-card organic-card organic-surface rounded-[24px] p-5 transition-all duration-300 active:scale-[0.98]';

export const copilotPanelClass =
  'organic-surface rounded-[24px] p-5 transition-transform active:scale-[0.99]';

import { anchorInputClass } from '@/lib/anchorTheme';

export const copilotInputClass = anchorInputClass;

export const copilotChipClass = (active) =>
  [
    'anchor-btn anchor-btn--compact anchor-btn--pill organic-pill transition-all duration-200 active:scale-[0.97] inline-flex items-center justify-center',
    active
      ? 'bg-[var(--copilot-accent-blue)] text-white shadow-[0_4px_14px_rgba(37,99,235,0.28)]'
      : 'bg-[var(--copilot-bg-card)] text-[var(--copilot-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--copilot-bg-card-hover)]',
  ].join(' ');

export const copilotPrimaryBtnClass =
  'anchor-btn anchor-btn--default anchor-btn--pill w-full inline-flex items-center justify-center bg-[var(--color-accent)] text-white disabled:opacity-40 shadow-[0_4px_14px_rgba(37,99,235,0.28)] transition-transform active:scale-[0.97]';

export const copilotSecondaryBtnClass =
  'anchor-btn anchor-btn--default anchor-btn--pill w-full inline-flex items-center justify-center bg-[var(--copilot-bg-card)] text-[var(--copilot-text-primary)] border border-[var(--color-border)] hover:bg-[var(--copilot-bg-card-hover)] transition-all active:scale-[0.97]';

export const copilotGhostBtnClass =
  'anchor-btn anchor-btn--compact anchor-btn--pill inline-flex items-center justify-center text-[var(--copilot-text-secondary)] hover:text-[var(--copilot-text-primary)] hover:bg-[var(--copilot-bg-card)] transition-all active:scale-[0.97]';

/** Månadsmarginal minus utgifter denna månad — "dina fria pengar". */
export function computeFreeMoney(profile, transactions = []) {
  const margin = getMonthlyMargin(profile);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const spent = (transactions || [])
    .filter((tx) => {
      const d = new Date(tx.created_date || tx.date || 0);
      return d >= monthStart && tx.amount < 0 && tx.type !== 'transfer_to_savings';
    })
    .reduce((s, tx) => s + Math.abs(tx.amount), 0);
  return Math.max(0, margin - spent);
}
