/**
 * Copilot Design DNA — shared tokens matching the premium Dashboard.
 */

import { getMonthlyMargin } from '@/lib/financialUtils';

export const COPILOT_GRADIENT = '#0b0f0d';

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
  bgDeep: '#0b0f0d',
  bgMid: '#0b0f0d',
  card: 'rgba(255,255,255,0.05)',
  cardHover: 'rgba(255,255,255,0.08)',
  accentGreen: '#4fae82',
  accentCyan: '#4fae82',
  accentBlue: '#4fae82',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.62)',
  textMuted: 'rgba(255,255,255,0.38)',
  border: 'rgba(255,255,255,0.08)',
  danger: '#e2857a',
};

/**
 * Category tint backgrounds — icons via anchorIcons CategoryIcon.
 * Expense categories share one neutral tint (differentiated by icon shape +
 * label, not hue). The accent color is reserved for money moving in
 * (income/savings) — the one place a color actually carries meaning.
 */
const NEUTRAL_TINT = { bg: 'rgba(255,255,255,0.06)', accent: 'rgba(255,255,255,0.75)' };
const POSITIVE_TINT = { bg: 'rgba(79,174,130,0.14)', accent: '#4fae82' };

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
      ? 'bg-[var(--copilot-accent-blue)] text-[#08110c] shadow-[0_4px_20px_rgba(79,174,130,0.35)]'
      : 'bg-[var(--copilot-bg-card)] text-[var(--copilot-text-secondary)] hover:bg-[var(--copilot-bg-card-hover)]',
  ].join(' ');

export const copilotPrimaryBtnClass =
  'anchor-btn anchor-btn--default anchor-btn--pill w-full inline-flex items-center justify-center bg-[#4fae82] text-[#08110c] disabled:opacity-40 shadow-[0_8px_32px_rgba(79,174,130,0.35)] transition-transform active:scale-[0.97]';

export const copilotSecondaryBtnClass =
  'anchor-btn anchor-btn--default anchor-btn--pill w-full inline-flex items-center justify-center bg-[var(--copilot-bg-card)] text-[var(--copilot-text-secondary)] hover:bg-[var(--copilot-bg-card-hover)] hover:text-white shadow-[var(--anchor-shadow-1)] transition-all active:scale-[0.97]';

export const copilotGhostBtnClass =
  'anchor-btn anchor-btn--compact anchor-btn--pill inline-flex items-center justify-center text-[var(--copilot-text-secondary)] hover:text-white hover:bg-[var(--copilot-bg-card)] transition-all active:scale-[0.97]';

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
