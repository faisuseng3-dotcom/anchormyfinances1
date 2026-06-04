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
  'relative overflow-hidden rounded-[26px] ring-1 ring-inset ring-white/[0.1]';

export const techInsetBg =
  'absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent pointer-events-none';

/** Hero-band på undersidor */
export const techHeroWrap =
  'relative overflow-hidden rounded-[28px] px-5 py-5 -mt-1 mb-1';

export const techHeroMesh =
  'absolute inset-0 opacity-80 pointer-events-none';

/** Undertext under sidtitlar */
export const techPageTitle = 'text-[28px] sm:text-[30px] font-light tracking-tight text-white';

export const techPageBackHeader = 'px-5 sm:px-7 pt-9 sm:pt-11 pb-5';

/** Ersätt "Genererar…" / AI-knappar */
export const techCta =
  'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full text-[14px] font-semibold bg-white text-[#050d28] hover:bg-white/95 transition-colors disabled:opacity-50';

export const techCtaGhost =
  'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full text-[14px] font-medium text-white/80 bg-white/[0.07] ring-1 ring-white/[0.1] hover:bg-white/[0.1]';
