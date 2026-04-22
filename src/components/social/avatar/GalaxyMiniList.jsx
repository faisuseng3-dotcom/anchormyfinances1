// Galaxy Explorer mini sidebar list — shown alongside AvatarBuilder
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart } from 'lucide-react';
import { AvatarSVG } from '../AvatarBuilder';

const DEMO = [
  { id: 'd1', username: 'elias_kth',    followers: 2334, likes: 177, bg: '#4B7CF3', avatar_style: { skin: '#FDBCB4', hair: 'short_clean', hairColor: '#3D2B1F', top: 'tshirt', topColor: '#4B7CF3', bg: '#4B7CF3' } },
  { id: 'd2', username: 'sarah_design', followers: 2383, likes: 15,  bg: '#A78BFA', avatar_style: { skin: '#C68642', hair: 'bun_top',    hairColor: '#1A0A00', top: 'blazer', topColor: '#A78BFA', bg: '#A78BFA' } },
  { id: 'd3', username: 'marcus_tech',  followers: 2084, likes: 385, bg: '#0FDEBD', avatar_style: { skin: '#8D5524', hair: 'short_clean', hairColor: '#1C1C1C', top: 'hoodie', topColor: '#0FDEBD', bg: '#0FDEBD' } },
  { id: 'd4', username: 'name_lumis',   followers: 2676, likes: 372, bg: '#F6AD55', avatar_style: { skin: '#FFDBAC', hair: 'medium_wave', hairColor: '#8B4513', top: 'blazer', topColor: '#F6AD55', bg: '#F6AD55' } },
];

export default function GalaxyMiniList({ realProfiles = [] }) {
  const profiles = [...DEMO, ...realProfiles.slice(0, 3)];

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center justify-between px-3 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>GALAXY EXPLORER</p>
        <Users className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.2)' }} />
      </div>

      {profiles.map((p, i) => {
        const bg = p.bg || p.avatar_style?.bg || '#4B7CF3';
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 300 }}
            className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-all hover:bg-white/[0.03]"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            {/* Avatar thumbnail */}
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{
                background: `${bg}25`,
                border: `1.5px solid ${bg}50`,
                boxShadow: `0 0 10px ${bg}30`,
              }}
            >
              <AvatarSVG style={p.avatar_style} size={34} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate">@{p.username}</p>
              <div className="flex items-center gap-2.5 mt-0.5">
                <span className="flex items-center gap-1 text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <Users className="w-2.5 h-2.5" />
                  {p.followers?.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-[9px]" style={{ color: 'rgba(255,100,100,0.5)' }}>
                  <Heart className="w-2.5 h-2.5" />
                  {p.likes}
                </span>
              </div>
            </div>

            {/* Color dot */}
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: bg, boxShadow: `0 0 6px ${bg}` }} />
          </motion.div>
        );
      })}
    </div>
  );
}