// Anchor Avatar Builder — v5 PBR Edition
// Uses PBREngine for all rendering. No legacy 2D shapes.

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice6, Check } from 'lucide-react';

import { AvatarSVG } from './avatar/PBREngine';
import AvatarPreview from './avatar/AvatarPreview';
import ColorWheel from './avatar/ColorWheel';
import GalaxyMiniList from './avatar/GalaxyMiniList';
import {
  DEFAULT_AVATAR_CONFIG,
  SKIN_COLORS, HAIR_STYLES, HAIR_COLORS,
  EYE_TYPES, EYE_COLORS, EYEBROW_TYPES, EYELASH_TYPES,
  NOSE_TYPES, MOUTH_TYPES, LIP_COLORS,
  OUTFIT_STYLES, OUTFIT_COLORS, ACCESSORIES, BG_COLORS,
} from './avatar/AvatarConfig';

// ─── Legacy compat ─────────────────────────────────────────────────────────────
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

// Public export for use throughout the app
export function AvatarSVGCompat({ style, config, size = 96, expression }) {
  const resolved = config || legacyToConfig(style) || DEFAULT_AVATAR_CONFIG;
  return <AvatarSVG config={resolved} size={size} expression={expression} />;
}
// Named export alias used in Social.jsx and elsewhere
export { AvatarSVGCompat as AvatarSVG };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function deepGet(obj, path) {
  return path.split('.').reduce((o,k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
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

const LONG_STYLES = ['long_straight','curly_big','ponytail','bob'];

function randomFrom(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function randomConfig() {
  const hs = randomFrom(HAIR_STYLES);
  return {
    ...DEFAULT_AVATAR_CONFIG,
    skinColor: randomFrom(SKIN_COLORS),
    faceShape: randomFrom(['oval','round','square','heart']),
    eyes: { type: randomFrom(EYE_TYPES).id, color: randomFrom(EYE_COLORS) },
    eyebrows: { type: randomFrom(EYEBROW_TYPES).id },
    eyelashes: { type: randomFrom(EYELASH_TYPES).id },
    nose: { type: randomFrom(NOSE_TYPES).id },
    mouth: { type: randomFrom(MOUTH_TYPES).id, lipColor: randomFrom(LIP_COLORS) },
    hair: { style: hs.id, color: randomFrom(HAIR_COLORS), isLong: hs.isLong },
    outfit: { style: randomFrom(OUTFIT_STYLES).id, color: randomFrom(OUTFIT_COLORS) },
    accessory: randomFrom(ACCESSORIES).id,
    bg: randomFrom(BG_COLORS),
    expression: 'neutral',
  };
}

// ─── Category icons ────────────────────────────────────────────────────────────
const CAT_ICONS = {
  face: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="11" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.2" fill="currentColor" stroke="none"/><path d="M9 15.5 Q12 18 15 15.5"/></svg>,
  hair: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M6 4 Q6 2 9 2 Q12 0 15 2 Q18 2 18 4 Q20 6 19 10 Q18 16 12 20 Q6 16 5 10 Q4 6 6 4Z"/></svg>,
  eyes: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M1 12 Q6 6 12 6 Q18 6 23 12 Q18 18 12 18 Q6 18 1 12Z"/><circle cx="12" cy="12" r="3"/></svg>,
  nose_mouth: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M11 9 Q10 14 8 15 Q10 16 12 16 Q14 16 16 15 Q14 14 13 9"/><path d="M8.5 19 Q12 22 15.5 19"/></svg>,
  clothes: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 8 L8 5 Q10 8 12 8 Q14 8 16 5 L22 8 L20 14 L17 13 L17 22 L7 22 L7 13 L4 14 Z"/></svg>,
  accessories: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4"/><line x1="11" y1="12" x2="13" y2="12"/><line x1="3" y1="10" x2="1" y2="11"/><line x1="21" y1="10" x2="23" y2="11"/></svg>,
};

const CATEGORIES = [
  {
    id: 'face', label: 'Ansikte',
    colorKey: 'skinColor', colorLabel: 'Hudton', colorOptions: SKIN_COLORS,
    sections: [
      { label: 'Ansiktsform', type: 'text', options: [
        {id:'oval',label:'Oval'},{id:'round',label:'Rund'},
        {id:'square',label:'Fyrkantig'},{id:'heart',label:'Hjärtformad'},
      ], stateKey: 'faceShape' },
    ],
  },
  {
    id: 'hair', label: 'Hår',
    colorKey: 'hair.color', colorLabel: 'Hårfärg', colorOptions: HAIR_COLORS,
    sections: [
      { label: 'Frisyr', type: 'avatar_preview', options: HAIR_STYLES, stateKey: 'hair.style' },
    ],
  },
  {
    id: 'eyes', label: 'Ögon',
    colorKey: 'eyes.color', colorLabel: 'Ögonfärg', colorOptions: EYE_COLORS,
    sections: [
      { label: 'Ögonform', type: 'avatar_preview', options: EYE_TYPES, stateKey: 'eyes.type' },
      { label: 'Ögonbryn', type: 'text', options: EYEBROW_TYPES, stateKey: 'eyebrows.type' },
      { label: 'Fransar', type: 'text', options: EYELASH_TYPES, stateKey: 'eyelashes.type' },
    ],
  },
  {
    id: 'nose_mouth', label: 'Näsa & Mun',
    colorKey: 'mouth.lipColor', colorLabel: 'Läppfärg', colorOptions: LIP_COLORS,
    sections: [
      { label: 'Näsa', type: 'text', options: NOSE_TYPES, stateKey: 'nose.type' },
      { label: 'Mun', type: 'text', options: MOUTH_TYPES, stateKey: 'mouth.type' },
    ],
  },
  {
    id: 'clothes', label: 'Kläder',
    colorKey: 'outfit.color', colorLabel: 'Kläderfärg', colorOptions: OUTFIT_COLORS,
    sections: [
      { label: 'Stil', type: 'avatar_preview', options: OUTFIT_STYLES, stateKey: 'outfit.style' },
    ],
  },
  {
    id: 'accessories', label: 'Tillbehör',
    colorKey: null,
    sections: [
      { label: 'Accessoar', type: 'avatar_preview', options: ACCESSORIES, stateKey: 'accessory' },
    ],
  },
];

const EXPRESSIONS = [
  { id: 'neutral', emoji: '🙂' },
  { id: 'happy',   emoji: '😄' },
  { id: 'excited', emoji: '🤩' },
  { id: 'focused', emoji: '😏' },
];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AvatarBuilder({ value, onChange, onSave, saved }) {
  const [config, setConfig] = useState(() => ({
    ...DEFAULT_AVATAR_CONFIG,
    ...(legacyToConfig(value) || {}),
  }));
  const [activeCategory, setActiveCategory] = useState('face');
  const [shuffling, setShuffling] = useState(false);

  const update = useCallback((path, val) => {
    setConfig(prev => {
      let next = deepSet(prev, path, val);
      if (path === 'hair.style') next = deepSet(next, 'hair.isLong', LONG_STYLES.includes(val));
      setTimeout(() => onChange?.(next), 0);
      return next;
    });
  }, [onChange]);

  const handleRandomize = () => {
    setShuffling(true);
    const next = randomConfig();
    setConfig(next);
    onChange?.(next);
    setTimeout(() => setShuffling(false), 500);
  };

  const currentCat = CATEGORIES.find(c => c.id === activeCategory);
  const accent = config.bg || '#0FDEBD';
  const wheelColor = currentCat?.colorKey ? deepGet(config, currentCat.colorKey) : null;

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: '#0B0E14', minHeight: 560 }}>

      {/* ── TOP AREA: expressions | avatar | slumpa + galaxy ── */}
      <div className="flex gap-0">

        {/* Expression strip */}
        <div className="flex flex-col gap-2 px-3 pt-4 justify-start">
          {EXPRESSIONS.map(ex => (
            <motion.button key={ex.id} whileTap={{ scale: 0.8 }}
              onClick={() => update('expression', ex.id)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all"
              style={{
                background: config.expression === ex.id ? `${accent}30` : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${config.expression === ex.id ? accent : 'transparent'}`,
                boxShadow: config.expression === ex.id ? `0 0 12px ${accent}60` : 'none',
              }}>
              {ex.emoji}
            </motion.button>
          ))}
        </div>

        {/* Center avatar */}
        <div className="flex-1 flex items-center justify-center pt-2 pb-0">
          <AvatarPreview config={config} size={158} />
        </div>

        {/* Right: randomize + Galaxy list */}
        <div className="flex flex-col" style={{ width: 118 }}>
          <div className="flex items-center justify-end gap-2 px-3 pt-4 pb-2">
            <span className="text-[9px] font-black" style={{ color: 'rgba(255,255,255,0.3)' }}>Slumpa</span>
            <motion.button whileTap={{ scale: 0.82 }} onClick={handleRandomize}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <motion.div animate={{ rotate: shuffling ? 360 : 0 }} transition={{ duration: 0.4 }}>
                <Dice6 className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.7)' }} />
              </motion.div>
            </motion.button>
          </div>
          <div className="flex-1 overflow-hidden" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
            <GalaxyMiniList />
          </div>
        </div>
      </div>

      {/* ── CATEGORY RIBBON ── */}
      <div className="flex items-center border-t border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.25)' }}>
        {CATEGORIES.map(cat => {
          const active = cat.id === activeCategory;
          return (
            <motion.button key={cat.id} whileTap={{ scale: 0.88 }}
              onClick={() => setActiveCategory(cat.id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-all relative"
              style={{
                background: active ? `${accent}18` : 'transparent',
                color: active ? accent : 'rgba(255,255,255,0.3)',
                borderBottom: active ? `2px solid ${accent}` : '2px solid transparent',
              }}>
              {CAT_ICONS[cat.id]}
              <span className="text-[8px] font-bold whitespace-nowrap">{cat.label}</span>
            </motion.button>
          );
        })}

        {/* Save button */}
        <motion.button whileTap={{ scale: 0.9 }} onClick={onSave}
          className="flex flex-col items-center gap-1 py-3 px-4 transition-all"
          style={{
            background: saved ? 'rgba(15,222,189,0.15)' : 'rgba(255,255,255,0.04)',
            color: saved ? '#0FDEBD' : 'rgba(255,255,255,0.5)',
            borderBottom: '2px solid transparent',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            minWidth: 60,
          }}>
          <Check className="w-5 h-5" />
          <span className="text-[8px] font-bold">{saved ? 'Sparad ✓' : 'Spara'}</span>
        </motion.button>
      </div>

      {/* ── OPTION PANEL ── */}
      <div className="flex-1 overflow-y-auto" style={{ background: '#0d1117' }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}>

            {currentCat?.sections.map(section => (
              <div key={section.stateKey}>
                <div className="px-4 pt-3 pb-2">
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {section.label}
                  </p>
                </div>

                {/* Avatar preview grid */}
                {section.type === 'avatar_preview' && (
                  <div className="px-2 pb-2">
                    <div className="grid grid-cols-4 gap-1.5">
                      {section.options.map(opt => {
                        const id = typeof opt === 'object' ? opt.id : opt;
                        const label = typeof opt === 'object' ? opt.label : opt;
                        const active = deepGet(config, section.stateKey) === id;
                        const previewCfg = deepSet(config, section.stateKey, id);
                        return (
                          <motion.button key={id} whileTap={{ scale: 0.88 }}
                            onClick={() => update(section.stateKey, id)}
                            className="relative flex flex-col items-center justify-center rounded-xl overflow-hidden transition-all"
                            style={{
                              background: active ? `${accent}18` : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${active ? accent + '60' : 'rgba(255,255,255,0.06)'}`,
                              boxShadow: active ? `0 4px 16px ${accent}30` : 'none',
                              height: 76,
                            }}>
                            <AvatarSVG config={previewCfg} size={56} />
                            <span className="text-[8px] font-bold pb-1 text-center px-1 leading-tight"
                              style={{ color: active ? accent : 'rgba(255,255,255,0.3)' }}>
                              {label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Text pills */}
                {section.type === 'text' && (
                  <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                    {section.options.map(opt => {
                      const id = typeof opt === 'object' ? opt.id : opt;
                      const label = typeof opt === 'object' ? opt.label : opt;
                      const active = deepGet(config, section.stateKey) === id;
                      return (
                        <motion.button key={id} whileTap={{ scale: 0.88 }}
                          onClick={() => update(section.stateKey, id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                          style={{
                            background: active ? accent : 'rgba(255,255,255,0.06)',
                            color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                            boxShadow: active ? `0 4px 14px ${accent}55` : 'none',
                          }}>
                          {label}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Color wheel — centrepiece when category has a color key */}
            {currentCat?.colorKey && (
              <div className="flex flex-col items-center py-5 gap-3">
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.22)' }}>
                  {currentCat.colorLabel}
                </p>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 9999,
                  padding: 12,
                  boxShadow: '0 0 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <ColorWheel
                    value={wheelColor}
                    onChange={val => update(currentCat.colorKey, val)}
                    size={200}
                  />
                </div>
              </div>
            )}

            {/* Background color swatches */}
            <div className="px-4 pt-2 pb-5">
              <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Bakgrundsfärg
              </p>
              <div className="flex flex-wrap gap-2.5">
                {BG_COLORS.map(col => {
                  const active = config.bg === col;
                  return (
                    <motion.button key={col} whileTap={{ scale: 0.8 }}
                      onClick={() => update('bg', col)}
                      className="w-8 h-8 rounded-full transition-all"
                      style={{
                        background: col,
                        transform: active ? 'scale(1.25)' : 'scale(1)',
                        boxShadow: active
                          ? `0 0 0 2px #0d1117, 0 0 0 4px ${col}, 0 6px 14px ${col}80`
                          : '0 2px 6px rgba(0,0,0,0.4)',
                      }}
                    />
                  );
                })}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}