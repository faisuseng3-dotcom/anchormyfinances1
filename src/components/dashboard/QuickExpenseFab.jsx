import React from 'react';
import { Plus } from 'lucide-react';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

/** Primär utgiftsväg — flytande + med elevation och tryck-feedback. */
export default function QuickExpenseFab({ onClick }) {
  return (
    <AnchorPressable
      onClick={onClick}
      aria-label="Lägg till utgift"
      className="fixed z-40 left-4 sm:left-6 w-14 h-14 rounded-full bg-[var(--color-text-primary)] text-[#050d28] anchor-elev-3 ring-1 ring-white/25"
      style={{ bottom: 'calc(var(--anchor-nav-height) + var(--anchor-safe-bottom) + 0.75rem)' }}
    >
      <Plus className="w-7 h-7" strokeWidth={2.25} />
    </AnchorPressable>
  );
}
