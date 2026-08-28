/**
 * Delad tech-yta för hela appen — undvik Base44-rutor och AI-copy.
 */
export {
  dashZone,
  dashLabel,
  dashTitle,
  dashHeroNumber,
  dashRail,
  dashRailCard,
  dashRailCardInner,
  dashRailCardBorder,
  dashPill,
  dashDockBtn,
  dashSignalLine,
  dashTimelineDot,
} from '@/lib/dashboardTheme';

/** Organisk panel — inte fyrkantig glass-box */
export const techInset =
  'relative overflow-hidden rounded-[26px] shadow-[var(--anchor-shadow-1)]';

export const techInsetBg =
  'absolute inset-0 bg-transparent pointer-events-none';

/** Hero-band på undersidor */
export const techHeroWrap =
  'relative overflow-hidden rounded-[28px] px-5 py-5 -mt-1 mb-1';

export const techHeroMesh =
  'absolute inset-0 opacity-80 pointer-events-none';

/** Undertext under sidtitlar */
export const techPageTitle =
  'text-[24px] sm:text-[30px] font-light tracking-tight text-[var(--color-text-primary)] break-words';

export const techPageBackHeader =
  'px-4 sm:px-7 pt-[max(2.25rem,env(safe-area-inset-top,0px))] sm:pt-11 pb-5 w-full max-w-lg mx-auto box-border';

/** Ersätt "Genererar…" / AI-knappar */
export const techCta =
  'anchor-btn anchor-btn--compact anchor-btn--pill inline-flex items-center justify-center bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50';

export const techCtaGhost =
  'anchor-btn anchor-btn--compact anchor-btn--pill inline-flex items-center justify-center text-[var(--color-text-primary)] bg-white ring-1 ring-[var(--color-border)] hover:bg-[var(--color-background-secondary)]';
