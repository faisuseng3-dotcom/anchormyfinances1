import React from 'react';
import { Star } from 'lucide-react';

/** Kompakt demo-status — utan gamification-copy */
export default function AlexGalaxyBadge() {
  return (
    <div className="rounded-xl px-4 py-3 border border-[var(--color-border)] bg-white flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[var(--color-background-secondary)] flex items-center justify-center">
        <Star className="w-5 h-5 text-[var(--color-text-secondary)]" />
      </div>
      <div>
        <p className="text-[13px] font-medium text-[var(--color-text-muted)]">Demoläge</p>
        <p className="text-[15px] font-medium text-[var(--color-text-primary)]">Alex-profil — jämför med exempelprofiler</p>
      </div>
    </div>
  );
}
