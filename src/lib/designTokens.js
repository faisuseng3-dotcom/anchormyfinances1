/**
 * Anchor Premium Design System — ui-ux-pro-max aligned.
 * 4/8pt spacing grid, semantic color, elevation, typography, z-index.
 */

/** Spacing scale (4pt base) */
export const space = {
  0: '0',
  1: '0.25rem', // 4
  2: '0.5rem', // 8
  3: '0.75rem', // 12
  4: '1rem', // 16
  5: '1.25rem', // 20
  6: '1.5rem', // 24
  8: '2rem', // 32
  10: '2.5rem', // 40
  12: '3rem', // 48
};

/** Border radius — cards 16–24dp */
export const radius = {
  sm: 'var(--anchor-radius-sm)', // 14px chips
  md: 'var(--anchor-radius-md)', // 18px inputs
  lg: 'var(--anchor-radius-lg)', // 22px cards
  xl: 'var(--anchor-radius-xl)', // 28px sheets
  full: '9999px',
};

/** Z-index layers */
export const zIndex = {
  base: 0,
  ambient: 1,
  content: 10,
  sticky: 20,
  fab: 40,
  sheet: 50,
  modal: 60,
  toast: 100,
};

/** Elevation shadows — soft blur, low opacity */
export const elevation = {
  0: 'none',
  1: 'var(--anchor-shadow-1)',
  2: 'var(--anchor-shadow-2)',
  3: 'var(--anchor-shadow-3)',
  4: 'var(--anchor-shadow-4)',
};

/** Typography scale */
export const type = {
  display: 'text-[32px] sm:text-[36px] font-light tracking-[-0.03em] leading-[1.05] text-[var(--color-text-primary)]',
  title: 'text-[22px] sm:text-[24px] font-light tracking-tight leading-[1.15] text-[var(--color-text-primary)]',
  headline: 'text-[18px] font-medium tracking-tight leading-snug text-[var(--color-text-primary)]',
  body: 'text-[15px] font-normal leading-[1.55] text-[var(--color-text-secondary)]',
  bodySm: 'text-[14px] font-normal leading-[1.5] text-[var(--color-text-secondary)]',
  label: 'text-[12px] font-medium tracking-wide text-[var(--color-text-muted)]',
  meta: 'text-[13px] font-medium tabular-nums text-white/45',
};

/** Touch — min 48×48dp hit area */
export const touch = {
  min: 'min-w-12 min-h-12',
  hitSlop: 'p-3', // expands 12px around icon
  active: 'active:opacity-[0.62] active:scale-[0.97] transition-[opacity,transform] duration-150 ease-out',
};

/** Layout zones */
export const layout = {
  zone: 'px-4 sm:px-6 w-full max-w-lg mx-auto box-border',
  zoneWide: 'px-4 sm:px-7 w-full max-w-lg mx-auto box-border',
  sectionGap: 'space-y-8',
  asymmetricGrid: 'grid grid-cols-[1fr_auto] gap-4 items-start',
};

/** Semantic surfaces — no pure #FFF / #000 */
export const surface = {
  page: 'anchor-page',
  card: 'anchor-elev-2 rounded-[var(--anchor-radius-lg)] bg-[var(--color-surface-raised)] ring-1 ring-white/[0.08]',
  cardInset: 'anchor-elev-1 rounded-[var(--anchor-radius-lg)] bg-white/[0.04] ring-1 ring-inset ring-white/[0.08]',
  overlay: 'anchor-overlay',
};
