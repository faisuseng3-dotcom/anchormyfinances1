import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SKINS   = ['#FDDBB4', '#F0C27F', '#C68642', '#8D5524', '#FFE0BD', '#FFDBAC'];
const HAIRS   = ['short', 'medium', 'long', 'curly', 'bun', 'bald'];
const HAIR_COLORS = ['#1a1a1a', '#4a3000', '#c8860a', '#d4a017', '#ff6b6b', '#a78bfa', '#60a5fa'];
const TOPS    = ['casual', 'hoodie', 'suit', 'tshirt', 'sport'];
const TOP_COLORS  = ['#0D7377', '#4B7CF3', '#E53E3E', '#D69E2E', '#A78BFA', '#0FDEBD', '#1a1a2e'];
const BGS     = ['#0D7377', '#4B7CF3', '#A78BFA', '#F6AD55', '#FC8181', '#0FDEBD'];

function AvatarSVG({ style, size = 96 }) {
  const s = style || {};
  const skin = s.skin || '#FDDBB4';
  const hair = s.hair || 'short';
  const hc   = s.hairColor || '#1a1a1a';
  const top  = s.top || 'casual';
  const tc   = s.topColor || '#0D7377';
  const bg   = s.bg || '#0D7377';

  const hairPaths = {
    short:  <rect x="18" y="10" width="44" height="18" rx="8" fill={hc} />,
    medium: <><rect x="18" y="10" width="44" height="18" rx="8" fill={hc} /><rect x="18" y="20" width="8" height="18" rx="4" fill={hc} /><rect x="54" y="20" width="8" height="18" rx="4" fill={hc} /></>,
    long:   <><rect x="18" y="10" width="44" height="18" rx="8" fill={hc} /><rect x="16" y="20" width="9" height="30" rx="4" fill={hc} /><rect x="55" y="20" width="9" height="30" rx="4" fill={hc} /></>,
    curly:  <ellipse cx="40" cy="18" rx="24" ry="12" fill={hc} />,
    bun:    <><rect x="22" y="14" width="36" height="14" rx="7" fill={hc} /><circle cx="40" cy="10" r="8" fill={hc} /></>,
    bald:   null,
  };
  const topPaths = {
    casual: <path d="M10 80 Q10 64 40 62 Q70 64 70 80 L80 96 L0 96 Z" fill={tc} />,
    hoodie: <><path d="M8 78 Q8 62 40 60 Q72 62 72 78 L80 96 L0 96 Z" fill={tc} /><path d="M28 60 Q40 54 52 60 L50 70 Q40 66 30 70 Z" fill={tc} opacity="0.6" /></>,
    suit:   <><path d="M10 80 Q10 64 40 62 Q70 64 70 80 L80 96 L0 96 Z" fill={tc} /><path d="M36 62 L40 78 L44 62" fill="white" opacity="0.8" /></>,
    tshirt: <path d="M12 80 Q12 66 40 64 Q68 66 68 80 L80 96 L0 96 Z" fill={tc} />,
    sport:  <path d="M10 78 Q10 62 40 60 Q70 62 70 78 L80 96 L0 96 Z" fill={tc} />,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* BG circle */}
      <circle cx="40" cy="40" r="40" fill={bg} opacity="0.25" />
      {/* Hair back */}
      {hairPaths[hair]}
      {/* Face */}
      <ellipse cx="40" cy="36" rx="19" ry="22" fill={skin} />
      {/* Eyes */}
      <ellipse cx="33" cy="34" rx="2.5" ry="3" fill="#1a1a1a" />
      <ellipse cx="47" cy="34" rx="2.5" ry="3" fill="#1a1a1a" />
      {/* Smile */}
      <path d="M33 43 Q40 49 47 43" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Ears */}
      <ellipse cx="21" cy="36" rx="3" ry="4.5" fill={skin} />
      <ellipse cx="59" cy="36" rx="3" ry="4.5" fill={skin} />
      {/* Body/Top */}
      {topPaths[top]}
    </svg>
  );
}

export { AvatarSVG };

const OPTION_ROW = [
  { key: 'skin',      label: 'Hy',       options: SKINS,       type: 'color' },
  { key: 'hairColor', label: 'Hårfärg',  options: HAIR_COLORS, type: 'color' },
  { key: 'hair',      label: 'Hår',      options: HAIRS,       type: 'text' },
  { key: 'top',       label: 'Kläder',   options: TOPS,        type: 'text' },
  { key: 'topColor',  label: 'Klädfärg', options: TOP_COLORS,  type: 'color' },
  { key: 'bg',        label: 'Bakgrund', options: BGS,         type: 'color' },
];

const HAIR_LABELS = { short: 'Kort', medium: 'Medel', long: 'Långt', curly: 'Lockigt', bun: 'Bulle', bald: 'Skallig' };
const TOP_LABELS  = { casual: 'Casual', hoodie: 'Hoodie', suit: 'Kostym', tshirt: 'T-shirt', sport: 'Sport' };

export default function AvatarBuilder({ value, onChange }) {
  const [style, setStyle] = useState(value || {
    skin: SKINS[0], hair: 'short', hairColor: HAIR_COLORS[0],
    top: 'casual', topColor: TOP_COLORS[0], bg: BGS[0],
  });

  const update = (key, val) => {
    const next = { ...style, [key]: val };
    setStyle(next);
    onChange?.(next);
  };

  return (
    <div className="space-y-5">
      {/* Live preview */}
      <div className="flex justify-center">
        <motion.div
          key={JSON.stringify(style)}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{ background: `${style.bg}30`, border: `2px solid ${style.bg}` }}
        >
          <AvatarSVG style={style} size={96} />
        </motion.div>
      </div>

      {/* Controls */}
      {OPTION_ROW.map(row => (
        <div key={row.key}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>{row.label}</p>
          <div className="flex flex-wrap gap-2">
            {row.options.map(opt => {
              const active = style[row.key] === opt;
              if (row.type === 'color') {
                return (
                  <button key={opt} onClick={() => update(row.key, opt)}
                    className="w-8 h-8 rounded-full transition-all"
                    style={{ background: opt, border: active ? '3px solid white' : '2px solid transparent', boxShadow: active ? `0 0 0 2px ${opt}` : 'none' }} />
                );
              }
              const label = row.key === 'hair' ? (HAIR_LABELS[opt] || opt) : (TOP_LABELS[opt] || opt);
              return (
                <button key={opt} onClick={() => update(row.key, opt)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: active ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: active ? 'white' : 'var(--color-text-secondary)',
                    border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}