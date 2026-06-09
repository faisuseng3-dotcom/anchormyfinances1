/**
 * Copilot Design DNA — shared tokens matching the premium Dashboard.
 * Use these across pages, sheets, and modals for visual consistency.
 */

export const COPILOT_GRADIENT =
  'linear-gradient(145deg, #0a0f6b 0%, #1228cc 50%, #0d1a9e 100%)';

export const copilotColors = {
  bgDeep: '#0a0f6b',
  bgMid: '#1228cc',
  card: 'rgba(255,255,255,0.07)',
  cardHover: 'rgba(255,255,255,0.11)',
  accentGreen: '#22d97a',
  accentCyan: '#4fc3f7',
  accentBlue: '#4a7aff',
  textPrimary: '#ffffff',
  textSecondary: '#8fa8d8',
  textMuted: '#5a78c0',
  border: 'rgba(255,255,255,0.08)',
  danger: '#f87171',
};

/** Category tint backgrounds for asymmetric cards */
export const CATEGORY_TINTS = {
  food: { bg: 'rgba(74,122,255,0.12)', accent: '#4a7aff', emoji: '🍎' },
  transport: { bg: 'rgba(79,195,247,0.12)', accent: '#4fc3f7', emoji: '🚗' },
  entertainment: { bg: 'rgba(167,139,250,0.12)', accent: '#a78bfa', emoji: '🎯' },
  travel: { bg: 'rgba(74,122,255,0.1)', accent: '#4a7aff', emoji: '✈️' },
  health: { bg: 'rgba(34,217,122,0.12)', accent: '#22d97a', emoji: '💊' },
  home: { bg: 'rgba(79,195,247,0.1)', accent: '#4fc3f7', emoji: '🏠' },
  shopping: { bg: 'rgba(244,114,182,0.12)', accent: '#f472b6', emoji: '🛍️' },
  income: { bg: 'rgba(34,217,122,0.14)', accent: '#22d97a', emoji: '💰' },
  savings: { bg: 'rgba(34,217,122,0.14)', accent: '#22d97a', emoji: '🐷' },
  savings_deposit: { bg: 'rgba(34,217,122,0.14)', accent: '#22d97a', emoji: '🐷' },
  subscription: { bg: 'rgba(74,122,255,0.12)', accent: '#4a7aff', emoji: '🎵' },
  other: { bg: 'rgba(255,255,255,0.06)', accent: '#8fa8d8', emoji: '📦' },
};

export function getCategoryTint(category) {
  return CATEGORY_TINTS[category] || CATEGORY_TINTS.other;
}

export const copilotPageClass =
  'min-h-screen min-h-[100dvh] overflow-x-hidden anchor-page copilot-subpage';

export const copilotCardClass =
  'copilot-surface-card rounded-2xl border border-[var(--copilot-border)] transition-all duration-150';

export const copilotInputClass =
  'w-full h-12 rounded-2xl bg-[var(--copilot-bg-card)] border border-[var(--copilot-border)] px-4 text-[15px] text-white placeholder:text-[var(--copilot-text-muted)] outline-none focus:border-[rgba(74,122,255,0.5)] transition-colors';

export const copilotChipClass = (active) =>
  [
    'px-4 py-2.5 min-h-11 rounded-full text-[13px] font-medium transition-all duration-150',
    active
      ? 'bg-[var(--copilot-accent-blue)] text-white border border-[rgba(74,122,255,0.4)]'
      : 'bg-[var(--copilot-bg-card)] text-[var(--copilot-text-secondary)] border border-[var(--copilot-border)] hover:bg-[var(--copilot-bg-card-hover)]',
  ].join(' ');

export const copilotPrimaryBtnClass =
  'w-full h-12 rounded-full bg-gradient-to-r from-[#4a7aff] to-[#6d4aff] text-white font-semibold text-[15px] disabled:opacity-40 shadow-[0_4px_20px_rgba(74,122,255,0.35)] transition-transform active:scale-[0.98]';
