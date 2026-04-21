// AvatarBuilder — Bitmoji-style selector UI
// Re-exports AvatarSVG for backward compat (used in GalaxyExplorer, SocialFriendCard etc.)

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Scissors, Eye, Shirt, Glasses, Palette } from 'lucide-react';

import AvatarDisplay, { AvatarSVG as _AvatarSVG } from './avatar/AvatarDisplay';
import {
  DEFAULT_AVATAR_CONFIG,
  SKIN_COLORS, HAIR_STYLES, HAIR_COLORS,
  EYE_TYPES, EYE_COLORS, EYEBROW_TYPES, EYELASH_TYPES,
  NOSE_TYPES, MOUTH_TYPES, LIP_COLORS,
  OUTFIT_STYLES, OUTFIT_COLORS, ACCESSORIES, BG_COLORS,
} from './avatar/AvatarConfig';

// ─── BACKWARD COMPATIBILITY ─────────────────────────────────────────────────
// Pages that use the old flat `style` object (skin, hair, hairColor, top, topColor, bg)
// are converted to the new config format transparently.
function legacyToConfig(style) {
  if (!style || typeof style !== 'object') return null;
  if (style.skinColor !== undefined || style.eyes !== undefined) return style; // already new format
  return {
    ...DEFAULT_AVATAR_CONFIG,
    skinColor: style.skin || DEFAULT_AVATAR_CONFIG.skinColor,
    hair: { style: style.hair || 'short_clean', color: style.hairColor || '#1C1008', isLong: false },
    outfit: { style: style.top || 'tshirt', color: style.topColor || '#0D7377' },
    bg: style.bg || DEFAULT_AVATAR_CONFIG.bg,
  };
}

// Exported for all consumers that import { AvatarSVG }
export function AvatarSVG({ style, config, size = 96, expression }) {
  const resolvedConfig = config || legacyToConfig(style) || DEFAULT_AVATAR_CONFIG;
  return <_AvatarSVG config={resolvedConfig} size={size} expression={expression} />;
}

// ─── CATEGORY CONFIG ────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'face', label: 'Ansikte', Icon: Smile,
    sections: [
      { label: 'Hudton', type: 'color', options: SKIN_COLORS, stateKey: 'skinColor' },
      { label: 'Ansiktsform', type: 'text',
        options: [
          { id: 'oval', label: 'Oval' }, { id: 'round', label: 'Rund' },
          { id: 'square', label: 'Fyrkantig' }, { id: 'heart', label: 'Hjärtformad' },
        ],
        stateKey: 'faceShape',
      },
    ],
  },
  {
    id: 'hair', label: 'Hår', Icon: Scissors,
    sections: [
      { label: 'Frisyr', type: 'avatar_preview', options: HAIR_STYLES, stateKey: 'hair.style' },
      { label: 'Hårfärg', type: 'color', options: HAIR_COLORS, stateKey: 'hair.color' },
    ],
  },
  {
    id: 'eyes', label: 'Ögon', Icon: Eye,
    sections: [
      { label: 'Ögonform', type: 'avatar_preview', options: EYE_TYPES, stateKey: 'eyes.type' },
      { label: 'Ögonfärg', type: 'color', options: EYE_COLORS, stateKey: 'eyes.color' },
      { label: 'Ögonbryn', type: 'text', options: EYEBROW_TYPES, stateKey: 'eyebrows.type' },
      { label: 'Fransar', type: 'text', options: EYELASH_TYPES, stateKey: 'eyelashes.type' },
    ],
  },
  {
    id: 'face_features', label: 'Näsa & Mun', Icon: Palette,
    sections: [
      { label: 'Näsa', type: 'text', options: NOSE_TYPES, stateKey: 'nose.type' },
      { label: 'Mun', type: 'text', options: MOUTH_TYPES, stateKey: 'mouth.type' },
      { label: 'Läppfärg', type: 'color', options: LIP_COLORS, stateKey: 'mouth.lipColor' },
    ],
  },
  {
    id: 'clothes', label: 'Kläder', Icon: Shirt,
    sections: [
      { label: 'Stil', type: 'avatar_preview', options: OUTFIT_STYLES, stateKey: 'outfit.style' },
      { label: 'Färg', type: 'color', options: OUTFIT_COLORS, stateKey: 'outfit.color' },
    ],
  },
  {
    id: 'accessories', label: 'Tillbehör', Icon: Glasses,
    sections: [
      { label: 'Accessoar', type: 'text', options: ACCESSORIES, stateKey: 'accessory' },
      { label: 'Bakgrund', type: 'color', options: BG_COLORS, stateKey: 'bg' },
    ],
  },
];

// ─── DEEP GET/SET helpers ────────────────────────────────────────────────────
function deepGet(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}
function deepSet(obj, path, val) {
  const keys = path.split('.');
  const result = { ...obj };
  let cur = result;
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = { ...(cur[keys[i]] || {}) };
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = val;
  return result;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AvatarBuilder({ value, onChange }) {
  const [config, setConfig] = useState(() => ({
    ...DEFAULT_AVATAR_CONFIG,
    ...(legacyToConfig(value) || {}),
  }));
  const [activeCategory, setActiveCategory] = useState('face');

  const LONG_STYLES = ['long_straight', 'curly_big', 'ponytail', 'bob'];

  const update = (path, val) => {
    let next = deepSet(config, path, val);
    if (path === 'hair.style') {
      next = deepSet(next, 'hair.isLong', LONG_STYLES.includes(val));
    }
    setConfig(next);
    onChange?.(next);
  };

  const currentCat = CATEGORIES.find(c => c.id === activeCategory);
  const accentColor = config.bg || '#0D7377';

  return (
    <div className="flex flex-col gap-0 select-none">
      {/* ── LIVE PREVIEW ── */}
      <AvatarDisplay config={config} size={148} />

      {/* ── CATEGORY TABS ── */}
      <div className="px-2 pb-1">
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => {
            const active = cat.id === activeCategory;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.88 }}
                onClick={() => setActiveCategory(cat.id)}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl flex-shrink-0 transition-all"
                style={{
                  background: active ? `${accentColor}22` : 'var(--color-surface)',
                  border: `1.5px solid ${active ? accentColor + '70' : 'transparent'}`,
                  minWidth: 60,
                }}
              >
                <cat.Icon
                  className="w-4 h-4"
                  style={{ color: active ? accentColor : 'var(--color-text-muted)' }}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className="text-[10px] font-bold whitespace-nowrap"
                  style={{ color: active ? accentColor : 'var(--color-text-muted)' }}>
                  {cat.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── OPTION PANELS ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.16 }}
          className="px-3 pb-4 space-y-5"
        >
          {currentCat?.sections.map(section => {
            const currentVal = deepGet(config, section.stateKey);
            return (
              <div key={section.stateKey}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3"
                  style={{ color: 'var(--color-text-muted)' }}>
                  {section.label}
                </p>

                {/* COLOR SWATCHES */}
                {section.type === 'color' && (
                  <div className="flex flex-wrap gap-2.5">
                    {section.options.map(opt => {
                      const active = currentVal === opt;
                      return (
                        <motion.button
                          key={opt}
                          whileTap={{ scale: 0.82 }}
                          onClick={() => update(section.stateKey, opt)}
                          style={{ width: 32, height: 32, position: 'relative' }}
                        >
                          <div className="w-8 h-8 rounded-full"
                            style={{
                              background: opt,
                              boxShadow: active
                                ? `0 0 0 2px white, 0 0 0 4px ${opt}, 0 4px 12px ${opt}80`
                                : '0 2px 6px rgba(0,0,0,0.18)',
                              transform: active ? 'scale(1.2)' : 'scale(1)',
                              transition: 'all 0.15s',
                            }}
                          />
                          {active && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-2 h-2 rounded-full bg-white opacity-90" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* TEXT BUTTONS */}
                {section.type === 'text' && (
                  <div className="flex flex-wrap gap-2">
                    {section.options.map(opt => {
                      const id = typeof opt === 'object' ? opt.id : opt;
                      const label = typeof opt === 'object' ? opt.label : opt;
                      const active = currentVal === id;
                      return (
                        <motion.button
                          key={id}
                          whileTap={{ scale: 0.88 }}
                          onClick={() => update(section.stateKey, id)}
                          className="px-3.5 py-2 rounded-2xl text-xs font-bold transition-all"
                          style={{
                            background: active ? accentColor : 'var(--color-surface)',
                            color: active ? 'white' : 'var(--color-text-secondary)',
                            boxShadow: active ? `0 4px 14px ${accentColor}50` : 'none',
                            border: active ? 'none' : '1px solid rgba(0,0,0,0.07)',
                          }}
                        >
                          {label}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* AVATAR PREVIEW GRID */}
                {section.type === 'avatar_preview' && (
                  <div className="grid grid-cols-4 gap-2">
                    {section.options.map(opt => {
                      const id = typeof opt === 'object' ? opt.id : opt;
                      const label = typeof opt === 'object' ? opt.label : opt;
                      const active = currentVal === id;
                      const previewConfig = deepSet(config, section.stateKey, id);
                      return (
                        <motion.button
                          key={id}
                          whileTap={{ scale: 0.86 }}
                          onClick={() => update(section.stateKey, id)}
                          className="flex flex-col items-center gap-1 p-2 rounded-2xl transition-all"
                          style={{
                            background: active ? `${accentColor}18` : 'var(--color-surface)',
                            border: `1.5px solid ${active ? accentColor + '70' : 'transparent'}`,
                            boxShadow: active ? `0 4px 14px ${accentColor}28` : 'none',
                          }}
                        >
                          <_AvatarSVG config={previewConfig} size={52} />
                          <span className="text-[9px] font-bold text-center leading-tight"
                            style={{ color: active ? accentColor : 'var(--color-text-muted)' }}>
                            {label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}