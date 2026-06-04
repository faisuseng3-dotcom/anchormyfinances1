/**
 * Mobil-layout — safe areas, bottennav och maxbredd för telefon.
 * Använd klasser här i stället för hårdkodade px-värden.
 */

/** Centrerad kolumn — läsbar på telefon, inte utdragen på surfplatta */
export const mobileFrame = 'w-full max-w-lg mx-auto box-border';

/** Horisontell padding med tight mobil */
export const mobilePadX = 'px-4 sm:px-6';

/** Sidfot under fixerad bottennav + safe area */
export const mobilePageBottom =
  'pb-[calc(5.5rem+env(safe-area-inset-bottom,0px)+1.25rem)]';

/** Dashboard med extra utrymme för FAB / Flöde-knapp */
export const mobileDashboardBottom =
  'pb-[calc(5.5rem+env(safe-area-inset-bottom,0px)+6.5rem)]';

export const mobileSafeTop = 'pt-[max(0.75rem,env(safe-area-inset-top,0px))]';

/** Fixerad knapp ovanför röst-FAB */
export const mobileFabStackBottom =
  'bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px)+4.25rem)]';

/** Röst-FAB (synkas med Layout) */
export const mobileVoiceFabBottom =
  'bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px)+0.65rem)]';

/** Botten-sheet med safe area */
export const mobileSheetPb = 'pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]';
