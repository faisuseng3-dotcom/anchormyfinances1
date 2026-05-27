/**
 * Anchor design system — Revolut / Monzo / Apple Wallet inspired.
 * One canvas, typography-led hierarchy, dividers instead of nested boxes.
 */

export const ANCHOR_PAGE_GRADIENT =
  'linear-gradient(165deg, #1a3dff 0%, #0f2a9e 28%, #081858 55%, #050d28 82%, #030610 100%)';

/** Legacy glass — use only for sheets/modals */
export function glassSurface(overrides = {}) {
  return {
    background:
      'linear-gradient(165deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.04) 40%, rgba(4,10,28,0.85) 100%)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.12)',
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
export const sectionTitleClass = 'text-[17px] font-semibold tracking-tight text-white';

export const sectionLabelClass = sectionTitleClass;

export const sectionSubtitleClass = 'text-[13px] text-white/50 leading-relaxed';

export const sectionMetaClass = 'text-[13px] font-medium text-white/45 tabular-nums';

/** @deprecated Prefer sectionTitleClass */
export const sectionLabelClassLegacy =
  'text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45';

export const anchorPageClass = 'min-h-screen pb-32 overflow-x-hidden anchor-page';

// Slightly tighter horizontal padding on the smallest screens
export const anchorZoneClass = 'px-4 sm:px-6';

export const anchorDisplayClass =
  'font-semibold leading-none tracking-tight text-white tabular-nums';

export const anchorDividerClass = 'h-px bg-white/[0.08]';

export const anchorListRowClass =
  'flex items-center gap-3 py-3.5 w-full text-left transition-opacity active:opacity-60';

export const anchorGlassCardClass = 'rounded-2xl p-5 sm:p-6';

export const anchorPrimaryButtonClass =
  'inline-flex items-center justify-center gap-2 h-[52px] px-6 rounded-xl text-[15px] font-semibold text-[#0a1628] bg-white hover:bg-white/95 transition-colors disabled:opacity-50 shadow-[0_8px_24px_rgba(0,0,0,0.18)]';

export const anchorSecondaryButtonClass =
  'inline-flex items-center justify-center gap-2 h-[52px] px-6 rounded-xl text-[15px] font-semibold text-white/90 bg-white/[0.08] hover:bg-white/[0.12] transition-colors disabled:opacity-50';

export const anchorGhostButtonClass =
  'inline-flex items-center justify-center gap-1.5 text-[15px] font-medium text-white/70 hover:text-white transition-colors';

export const anchorIconButtonClass =
  'w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.08] text-white/80 hover:bg-white/[0.12] transition-colors';

export const anchorInputClass =
  'flex w-full h-12 rounded-xl border-0 px-4 text-[15px] text-white bg-white/[0.08] placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/25 disabled:opacity-50';
