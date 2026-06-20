/**
 * Anchor design system — Revolut / Monzo / Apple Wallet inspired.
 * One canvas, typography-led hierarchy, dividers instead of nested boxes.
 */

export const ANCHOR_PAGE_GRADIENT =
  'linear-gradient(145deg, #0a0f6b 0%, #1228cc 50%, #0d1a9e 100%)';

/** Legacy glass — use only for sheets/modals */
export function glassSurface(overrides = {}) {
  return {
    background:
      'linear-gradient(165deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.04) 40%, rgba(4,10,28,0.85) 100%)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    boxShadow: 'var(--anchor-shadow-1)',
    boxShadow: '0 24px 56px rgba(2, 6, 20, 0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
    ...overrides,
  };
}

/** Single elevated surface per viewport (drawers, modals) */
export function elevatedSheet(overrides = {}) {
  return {
    background: 'rgba(12, 18, 38, 0.94)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 -16px 48px rgba(0,0,0,0.35)',
    ...overrides,
  };
}

export const dashboardGlassSurface = glassSurface;

/** Sentence-case section titles — not uppercase labels */
export const sectionTitleClass = 'anchor-dash-heading anchor-dash-heading--section tracking-tight text-white';

/** Titlar inuti cards/widgets */
export const cardTitleClass = 'anchor-card-title';

/** Liten etikett ovanför card-titel */
export const cardEyebrowClass = 'anchor-card-eyebrow';

export const sectionLabelClass = sectionTitleClass;

export const sectionSubtitleClass = 'text-[13px] text-white/50 leading-relaxed';

export const sectionMetaClass = 'text-[13px] font-medium text-white/45 tabular-nums';

/** @deprecated Prefer sectionTitleClass */
export const sectionLabelClassLegacy =
  'text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45';

export const anchorPageClass =
  'min-h-screen min-h-[100dvh] overflow-x-hidden anchor-page anchor-page-pad-bottom';

// Slightly tighter horizontal padding on the smallest screens
export const anchorZoneClass = 'px-4 sm:px-6';

export const anchorDisplayClass =
  'font-semibold leading-none tracking-tight text-white tabular-nums';

export const anchorDividerClass = 'h-px bg-white/[0.08]';

export const anchorListRowClass =
  'flex items-center gap-3 py-3.5 w-full text-left transition-opacity active:opacity-60';

export const anchorGlassCardClass = 'rounded-2xl p-5 sm:p-6';

export const anchorButtonBaseClass =
  'anchor-btn inline-flex items-center justify-center transition-colors disabled:opacity-50 touch-manipulation';

export const anchorPrimaryButtonClass =
  `${anchorButtonBaseClass} anchor-btn--default anchor-btn--rounded text-[#0a1628] bg-white hover:bg-white/95 shadow-[0_8px_24px_rgba(0,0,0,0.18)]`;

export const anchorSecondaryButtonClass =
  `${anchorButtonBaseClass} anchor-btn--default anchor-btn--rounded text-white/90 bg-white/[0.08] hover:bg-white/[0.12]`;

export const anchorGhostButtonClass =
  `${anchorButtonBaseClass} anchor-btn--compact text-white/70 hover:text-white`;

export const anchorIconButtonClass =
  `${anchorButtonBaseClass} anchor-btn--icon rounded-full bg-white/[0.08] text-white/80 hover:bg-white/[0.12] anchor-pressable`;

export const anchorInputBaseClass =
  'anchor-input organic-input w-full transition-all focus-visible:shadow-[0_0_0_3px_rgba(74,122,255,0.25)]';

export const anchorInputClass = `${anchorInputBaseClass} anchor-input--field`;

export const anchorInputAmountClass = `${anchorInputBaseClass} anchor-input--amount`;

export const anchorInputLabelClass = 'anchor-input-label';

export const anchorInputSuffixClass = 'anchor-input-suffix';
