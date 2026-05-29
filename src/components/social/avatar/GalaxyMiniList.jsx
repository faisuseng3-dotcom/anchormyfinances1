import React from 'react';
import { Users } from 'lucide-react';
import { AvatarSVG } from '../avatar/PBREngine';
import { GALAXY_DEMO_PROFILES } from '@/lib/galaxyProfiles';

export default function GalaxyMiniList({ realProfiles = [], onSelect }) {
  const profiles = [...GALAXY_DEMO_PROFILES.slice(0, 4), ...realProfiles.slice(0, 2)];

  return (
    <div className="flex flex-col h-full border-l border-white/[0.08] bg-white/[0.02]">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06]">
        <p className="text-[12px] font-medium text-white/45">Jämför</p>
        <Users className="w-3.5 h-3.5 text-white/30" />
      </div>

      {profiles.map((p) => {
        const bg = p.avatar_config?.bg || '#7FA0FF';
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect?.(p)}
            className="flex flex-col items-center gap-1 px-2 py-2.5 border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors w-full"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: `${bg}22`, border: `1px solid ${bg}44` }}
            >
              <AvatarSVG config={p.avatar_config} size={34} />
            </div>
            <p className="text-[10px] font-medium text-white/65 truncate w-full text-center">
              {p.display_name}
            </p>
          </button>
        );
      })}
    </div>
  );
}
