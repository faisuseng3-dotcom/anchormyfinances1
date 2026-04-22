// AvatarBuilder — Bitmoji-style modular avatar creator
// Exports AvatarSVG for backward compat with GalaxyExplorer, SocialFriendCard etc.

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Scissors, Eye, Shirt, Glasses, Palette, Shuffle, Sparkles } from 'lucide-react';

import AvatarDisplay, { AvatarSVG as _AvatarSVG } from './avatar/AvatarDisplay';
import {
  DEFAULT_AVATAR_CONFIG,
  SKIN_COLORS, HAIR_STYLES, HAIR_COLORS,
  EYE_TYPES, EYE_COLORS, EYEBROW_TYPES, EYELASH_TYPES,
  NOSE_TYPES, MOUTH_TYPES, LIP_COLORS,
  OUTFIT_STYLES, OUTFIT_COLORS, ACCESSORIES, BG_COLORS,
} from './avatar/AvatarConfig';

// ─── BACKWARD COMPATIBILITY ──────────────────────────────────────────────────
function legacyToConfig(style) {
  if (!style || typeof style !== 'object') return null;
  if (style.skinColor !== undefined || style.eyes !== undefined) return style;
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

// ─── DEEP HELPERS ─────────────────────────────────────────────────────────────
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

const LONG_STYLES = ['long_straight', 'curly_big', 'ponytail', 'bob'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomizeConfig() {
  const hairStyle = randomFrom(HAIR_STYLES);
  return {
    ...DEFAULT_AVATAR_CONFIG,
    skinColor: randomFrom(SKIN_COLORS),
    faceShape: randomFrom(['oval', 'round', 'square', 'heart']),
    eyes: { type: randomFrom(EYE_TYPES).id, color: randomFrom(EYE_COLORS) },
    eyebrows: { type: randomFrom(EYEBROW_TYPES).id },
    eyelashes: { type: randomFrom(EYELASH_TYPES).id },
    nose: { type: randomFrom(NOSE_TYPES).id },
    mouth: { type: randomFrom(MOUTH_TYPES).id, lipColor: randomFrom(LIP_COLORS) },
    hair: { style: hairStyle.id, color: randomFrom(HAIR_COLORS), isLong: hairStyle.isLong },
    outfit: { style: randomFrom(OUTFIT_STYLES).id, color: randomFrom(OUTFIT_COLORS) },
    accessory: randomFrom(ACCESSORIES).id,
    bg: randomFrom(BG_COLORS),
    expression: 'neutral',
  };
}

// ─── EXPRESSION PICKER ────────────────────────────────────────────────────────
const EXPRESSIONS = [
  { id: 'neutral', emoji: '😐' },
  { id: 'happy',   emoji: '😄' },
  { id: 'excited', emoji: '🤩' },
  { id: 'focused', emoji: '😏' },
];

// ─── CATEGORY DEFINITIONS ─────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'face', label: 'Ansikte', Icon: Smile,
    sections: [
      { label: 'Hudton', type: 'color', options: SKIN_COLORS, stateKey: 'skinColor' },
      { label: 'Ansiktsform', type: 'text',
        options: [
          { id: 'oval',   label: 'Oval' },
          { id: 'round',  label: 'Rund' },
          { id: 'square', label: 'Fyrkantig' },
          { id: 'heart',  label: 'Hjärtformad' },
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
      { label: 'Bakgrundsfärg', type: 'color', options: BG_COLORS, stateKey: 'bg' },
    ],
  },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AvatarBuilder({ value, onChange }) {
  const [config, setConfig] = useState(() => ({
    ...DEFAULT_AVATAR_CONFIG,
    ...(legacyToConfig(value) || {}),
  }));
  const [activeCategory, setActiveCategory] = useState('face');
  const [shuffling, setShuffling] = useState(false);

  const update = useCallback((path, val) => {
    setConfig(prev => {
      let next = deepSet(prev, path, val);
      if (path === 'hair.style') {
        next = deepSet(next, 'hair.isLong', LONG_STYLES.includes(val));
      }
      onChange?.(next);
      return next;
    });
  }, [onChange]);

  const handleRandomize = () => {
    setShuffling(true);
    const next = randomizeConfig();
    setConfig(next);
    onChange?.(next);
    setTimeout(() => setShuffling(false), 500);
  };

  const currentCat = CATEGORIES.find(c => c.id === activeCategory);
  const accent = config.bg || '#0D7377';

  return (
    <div className="flex flex-col select-none">

      {/* ── LIVE PREVIEW ── */}
      <div className="relative">
        <AvatarDisplay config={config} size={156} />

        {/* Randomize button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleRandomize}
          className="absolute bottom-4 right-5 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: accent, boxShadow: `0 4px 16px ${accent}60` }}
          title="Slumpa avatar"
        >
          <motion.div animate={{ rotate: shuffling ? 360 : 0 }} transition={{ duration: 0.4 }}>
            <Shuffle className="w-4 h-4 text-white" />
          </motion.div>
        </motion.button>

        {/* Expression picker */}
        <div className="absolute bottom-4 left-5 flex gap-1.5">
          {EXPRESSIONS.map(ex => (
            <motion.button
              key={ex.id}
              whileTap={{ scale: 0.8 }}
              onClick={() => update('expression', ex.id)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-base transition-all"
              style={{
                background: config.expression === ex.id ? `${accent}30` : 'rgba(0,0,0,0.08)',
                border: `1.5px solid ${config.expression === ex.id ? accent : 'transparent'}`,
                boxShadow: config.expression === ex.id ? `0 2px 8px ${accent}40` : 'none',
              }}
            >
              {ex.emoji}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── CATEGORY RIBBON ── */}
      <div className="px-3 pb-1">
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => {
            const active = cat.id === activeCategory;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.88 }}
                onClick={() => setActiveCategory(cat.id)}
                className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl flex-shrink-0 transition-all"
                style={{
                  background: active ? `${accent}20` : 'var(--color-surface)',
                  border: `1.5px solid ${active ? accent + '60' : 'rgba(0,0,0,0.05)'}`,
                  minWidth: 58,
                  boxShadow: active ? `0 4px 12px ${accent}25` : 'none',
                }}
              >
                <cat.Icon
                  className="w-4 h-4"
                  style={{ color: active ? accent : 'var(--color-text-muted)', strokeWidth: active ? 2.5 : 1.8 }}
                />
                <span className="text-[10px] font-bold whitespace-nowrap leading-tight"
                  style={{ color: active ? accent : 'var(--color-text-muted)' }}>
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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="px-3 pt-1 pb-5 space-y-5"
        >
          {currentCat?.sections.map(section => {
            const currentVal = deepGet(config, section.stateKey);
            return (
              <div key={section.stateKey}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3"
                  style={{ color: 'var(--color-text-muted)' }}>
                  {section.label}
                </p>

                {/* ── COLOR SWATCHES ── */}
                {section.type === 'color' && (
                  <div className="flex flex-wrap gap-3">
                    {section.options.map(opt => {
                      const active = currentVal === opt;
                      return (
                        <motion.button
                          key={opt}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => update(section.stateKey, opt)}
                          className="relative flex-shrink-0"
                          style={{ width: 34, height: 34 }}
                        >
                          <div
                            className="w-full h-full rounded-full transition-all duration-150"
                            style={{
                              background: opt,
                              transform: active ? 'scale(1.22)' : 'scale(1)',
                              boxShadow: active
                                ? `0 0 0 2.5px white, 0 0 0 4.5px ${opt}, 0 6px 14px ${opt}80`
                                : '0 2px 8px rgba(0,0,0,0.22)',
                            }}
                          />
                          {active && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-2 h-2 rounded-full bg-white shadow" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* ── TEXT PILLS ── */}
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
                          className="px-4 py-2 rounded-2xl text-xs font-bold transition-all"
                          style={{
                            background: active ? accent : 'var(--color-surface)',
                            color: active ? 'white' : 'var(--color-text-secondary)',
                            boxShadow: active ? `0 4px 16px ${accent}55` : 'none',
                            border: active ? 'none' : '1px solid rgba(0,0,0,0.07)',
                          }}
                        >
                          {label}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* ── AVATAR PREVIEW GRID ── */}
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
                          className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all"
                          style={{
                            background: active ? `${accent}18` : 'var(--color-surface)',
                            border: `1.5px solid ${active ? accent + '65' : 'rgba(0,0,0,0.04)'}`,
                            boxShadow: active ? `0 4px 14px ${accent}28` : 'none',
                          }}
                        >
                          <_AvatarSVG config={previewConfig} size={54} />
                          <span
                            className="text-[9px] font-bold text-center leading-tight"
                            style={{ color: active ? accent : 'var(--color-text-muted)' }}
                          >
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