import React from 'react';
import { Star } from 'lucide-react';

/** Kompakt demo-status — utan gamification-copy */
export default function AlexGalaxyBadge() {
  return (
    <div className="rounded-xl px-4 py-3 border border-white/[0.1] bg-white/[0.04] flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center">
        <Star className="w-5 h-5 text-white/70" />
      </div>
      <div>
        <p className="text-[13px] font-medium text-white/45">Demoläge</p>
        <p className="text-[15px] font-medium text-white">Alex-profil — jämför med exempelprofiler</p>
      </div>
    </div>
  );
}
