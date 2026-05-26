/**
 * Anchor global design system — Revolut-inspired dark fintech.
 */

export const ANCHOR_PAGE_GRADIENT =
  'linear-gradient(180deg, #2f5cff 0%, #1846e7 22%, #0a239e 52%, #060f4a 78%, #040814 100%)';

export function glassSurface(overrides = {}) {
  return {
    background:
      'linear-gradient(165deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 38%, rgba(6,14,32,0.78) 100%)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    border: '1px solid rgba(255,255,255,0.14)',
    boxShadow:
      '0 22px 48px rgba(2, 8, 26, 0.42), inset 0 1px 0 rgba(255,255,255,0.08)',
    ...overrides,
  };
}

/** @deprecated Use glassSurface — kept for dashboard imports */
export const dashboardGlassSurface = glassSurface;

export const sectionLabelClass =
  'text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45';

export const anchorPageClass = 'min-h-screen pb-32 overflow-x-hidden anchor-page';

export const anchorGlassCardClass =
  'rounded-[26px] p-5 sm:p-6 border border-white/14';

export const anchorPrimaryButtonClass =
  'h-12 sm:h-14 rounded-2xl font-semibold text-slate-900 bg-white shadow-[0_14px_32px_rgba(0,0,0,0.22)] hover:bg-white/95 transition-colors';

export const anchorSecondaryButtonClass =
  'h-12 sm:h-14 rounded-2xl font-semibold text-white/90 bg-white/8 border border-white/16 hover:bg-white/12 transition-colors';

export const anchorIconButtonClass =
  'w-10 h-10 rounded-full flex items-center justify-center bg-white/10 border border-white/14 text-white/75 hover:bg-white/15 transition-colors';

export const anchorInputClass =
  'h-12 rounded-2xl text-sm bg-white/8 border border-white/14 text-white placeholder:text-white/35 focus:border-white/30 focus:ring-0';
