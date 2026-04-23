// Galaxy Explorer mini sidebar list — shown alongside AvatarBuilder
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart } from 'lucide-react';
import { AvatarSVG } from '../avatar/PBREngine';

const DEMO = [
  { id: 'd1', username: 'elias_kth',    followers: 2334, bg: '#4B7CF3', avatar_config: { skinColor: '#FDBCB4', hair: { style:'short_clean', color:'#3D2B1F' }, outfit: { style:'tshirt', color:'#4B7CF3' }, bg:'#4B7CF3', eyes:{type:'almond',color:'#2D3436'}, eyebrows:{type:'natural'}, eyelashes:{type:'natural'}, nose:{type:'button'}, mouth:{type:'smile',lipColor:'#C48A8A'}, faceShape:'oval', accessory:'none', expression:'neutral' } },
  { id: 'd2', username: 'sarah_design', followers: 2383, bg: '#A78BFA', avatar_config: { skinColor: '#C68642', hair: { style:'bun_top',    color:'#1A0A00' }, outfit: { style:'blazer', color:'#A78BFA' }, bg:'#A78BFA', eyes:{type:'round',color:'#4A7C59'},  eyebrows:{type:'arched'}, eyelashes:{type:'dramatic'}, nose:{type:'narrow'}, mouth:{type:'pouty',lipColor:'#E91E63'}, faceShape:'heart', accessory:'earrings', expression:'happy' } },
  { id: 'd3', username: 'marcus_tech',  followers: 2084, bg: '#0FDEBD', avatar_config: { skinColor: '#8D5524', hair: { style:'short_clean', color:'#1C1C1C' }, outfit: { style:'hoodie', color:'#0FDEBD' }, bg:'#0FDEBD', eyes:{type:'hooded',color:'#3B2314'}, eyebrows:{type:'thick'},  eyelashes:{type:'none'}, nose:{type:'wide'}, mouth:{type:'smile',lipColor:'#C48A8A'}, faceShape:'square', accessory:'glasses_round', expression:'neutral' } },
  { id: 'd4', username: 'name_lumis',   followers: 2676, bg: '#F6AD55', avatar_config: { skinColor: '#FFDBAC', hair: { style:'medium_wave', color:'#8B4513' }, outfit: { style:'blazer', color:'#F6AD55' }, bg:'#F6AD55', eyes:{type:'cat',color:'#7B68EE'},    eyebrows:{type:'arched'}, eyelashes:{type:'natural'}, nose:{type:'button'}, mouth:{type:'smirk',lipColor:'#F06292'}, faceShape:'oval', accessory:'sunglasses', expression:'focused' } },
];

export default function GalaxyMiniList({ realProfiles = [] }) {
  const profiles = [...DEMO, ...realProfiles.slice(0, 3)];

  return (
    <div
      className="flex flex-col gap-0 h-full"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[8px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>GALAXY</p>
        <Users className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.18)' }} />
      </div>

      {profiles.map((p, i) => {
        const bg = p.bg || p.avatar_style?.bg || '#4B7CF3';
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 300 }}
            className="flex flex-col items-center gap-1 px-2 py-2.5 cursor-pointer transition-all"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              background: 'rgba(255,255,255,0)',
            }}
            whileHover={{ background: 'rgba(255,255,255,0.04)' }}
          >
            {/* Avatar thumbnail — glassmorphism circle */}
            <div
              className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{
                background: `${bg}22`,
                border: `1.5px solid ${bg}55`,
                boxShadow: `0 0 14px ${bg}38, inset 0 1px 0 rgba(255,255,255,0.12)`,
                backdropFilter: 'blur(6px)',
              }}
            >
              <AvatarSVG config={p.avatar_config} size={38} />
            </div>

            {/* Username */}
            <p className="text-[8px] font-black text-center truncate w-full" style={{ color: 'rgba(255,255,255,0.65)' }}>
              @{p.username.split('_')[0]}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {(p.followers / 1000).toFixed(1)}k
              </span>
              <div className="w-1 h-1 rounded-full" style={{ background: bg, boxShadow: `0 0 4px ${bg}` }}/>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}