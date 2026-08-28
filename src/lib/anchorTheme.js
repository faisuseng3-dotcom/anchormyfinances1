/**
 * Lago design system — Revolut / Monzo / Apple Wallet inspired.
 * One canvas, typography-led hierarchy, dividers instead of nested boxes.
 */

export const ANCHOR_PAGE_GRADIENT = '#F7F9FC';

/** Legacy glass — use only for sheets/modals */
export function glassSurface(overrides = {}) {
  return {
    background: '#FFFFFF',
    boxShadow: 'var(--anchor-shadow-3)',
    border: '1px solid var(--color-border)',
    ...overrides,
  };
}

/** Single elevated surface per viewport (drawers, modals) */
export function elevatedSheet(overrides = {}) {
  return {
    background: '#FFFFFF',
    borderTop: '1px solid var(--color-border)',
    boxShadow: '0 -16px 48px rgba(11,18,32,0.12)',
    ...overrides,
  };
}

export const dashboardGlassSurface = glassSurface;

/** Sentence-case section titles — not uppercase labels */
export const sectionTitleClass = 'anchor-dash-heading anchor-dash-heading--section tracking-tight';

/** Titlar inuti cards/widgets */
export const cardTitleClass = 'anchor-card-title';

/** Liten etikett ovanför card-titel */
export const cardEyebrowClass = 'anchor-card-eyebrow';

export const sectionLabelClass = sectionTitleClass;

export const sectionSubtitleClass = 'text-[13px] leading-relaxed text-[var(--color-text-secondary)]';

export const sectionMetaClass = 'text-[13px] font-medium tabular-nums text-[var(--color-text-secondary)]';

/** @deprecated Prefer sectionTitleClass */
export const sectionLabelClassLegacy =
  'text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]';

export const anchorPageClass =
  'min-h-screen min-h-[100dvh] overflow-x-hidden anchor-page anchor-page-pad-bottom';

// Slightly tighter horizontal padding on the smallest screens
export const anchorZoneClass = 'px-4 sm:px-6';

export const anchorDisplayClass =
  'font-semibold leading-none tracking-tight tabular-nums text-[var(--color-text-primary)]';

export const anchorDividerClass = 'h-px bg-[var(--color-border)]';

export const anchorListRowClass =
  'flex items-center gap-3 py-3.5 w-full text-left transition-opacity active:opacity-60';

export const anchorGlassCardClass = 'rounded-2xl p-5 sm:p-6';

export const anchorButtonBaseClass =
  'anchor-btn inline-flex items-center justify-center transition-colors disabled:opacity-50 touch-manipulation';

export const anchorPrimaryButtonClass =
  `${anchorButtonBaseClass} anchor-btn--default anchor-btn--rounded text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] shadow-[0_4px_14px_rgba(37,99,235,0.28)]`;

export const anchorSecondaryButtonClass =
  `${anchorButtonBaseClass} anchor-btn--default anchor-btn--rounded text-[var(--color-text-primary)] bg-white border border-[var(--color-border)] hover:bg-[var(--color-background-secondary)]`;

export const anchorGhostButtonClass =
  `${anchorButtonBaseClass} anchor-btn--compact text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]`;

export const anchorIconButtonClass =
  `${anchorButtonBaseClass} anchor-btn--icon rounded-full bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] hover:bg-[#e2e8f0] anchor-pressable`;

export const anchorInputBaseClass =
  'anchor-input organic-input w-full transition-all focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.15)]';

export const anchorInputClass = `${anchorInputBaseClass} anchor-input--field`;

export const anchorInputAmountClass = `${anchorInputBaseClass} anchor-input--amount`;

export const anchorInputLabelClass = 'anchor-input-label';

export const anchorInputSuffixClass = 'anchor-input-suffix';
