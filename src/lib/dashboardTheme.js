/** Dashboard surfaces — delegates to premium design tokens. */

import { layout, type, radius } from './designTokens';

export const dashZone = layout.zoneWide;

export const dashLabel = type.label;

export const dashTitle =
  'text-[20px] font-semibold tracking-tight leading-snug text-[var(--color-text-primary)]';

export const dashHeroNumber =
  'font-light tracking-[-0.04em] tabular-nums text-[var(--color-text-primary)] leading-[0.92]';

export const dashHeroGlow =
  'pointer-events-none absolute -inset-x-8 top-1/2 -translate-y-1/2 h-[140%] opacity-60 blur-3xl';

export const dashRail =
  'flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:-mx-7 sm:px-7 snap-x snap-mandatory scrollbar-none overscroll-x-contain';

export const dashRailCard = `snap-center flex-shrink-0 w-[min(82vw,280px)] max-w-[calc(100vw-2rem)] rounded-[${radius.lg}] p-4 relative overflow-hidden bg-white anchor-elev-1`;

export const dashRailCardInner = 'absolute inset-0 bg-transparent';

export const dashRailCardBorder = `absolute inset-0 rounded-[${radius.lg}] ring-1 ring-inset ring-[var(--color-border)]`;

export const dashPill =
  'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]';

export const dashDockBtn =
  'anchor-btn anchor-btn--default anchor-btn--pill flex-1 min-w-0 inline-flex items-center justify-center anchor-pressable';

export const dashSignalLine =
  'border-l-2 border-[rgba(37,99,235,0.5)] pl-4 py-1';

export const dashTimelineDot = 'w-2 h-2 rounded-full ring-4 ring-[#F7F9FC]';
