import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice6, Check, Sparkles } from 'lucide-react';
import { AvatarSVG } from './avatar/BitmojiEngine';
import AvatarPreview from './avatar/AvatarPreview';
import {
  DEFAULT_AVATAR_CONFIG,
  SKIN_COLORS,
  HAIR_STYLES,
  HAIR_COLORS,
  EYE_TYPES,
  EYE_COLORS,
  EYEBROW_TYPES,
  NOSE_TYPES,
  MOUTH_TYPES,
  LIP_COLORS,
  OUTFIT_STYLES,
  OUTFIT_COLORS,
  ACCESSORIES,
  BG_COLORS,
} from './avatar/AvatarConfig';

function legacyToConfig(style) {
  if (!style || typeof style !== 'object') return null;
  if (style.skinColor !== undefined || style.eyes !== undefined) return style;
  return {
    ...DEFAULT_AVATAR_CONFIG,
    skinColor: style.skin || DEFAULT_AVATAR_CONFIG.skinColor,
    hair: { style: style.hair || 'short_clean', color: style.hairColor || '#2C1810', isLong: false },
    outfit: { style: style.top || 'hoodie', color: style.topColor || '#5AC8FA' },
    bg: style.bg || DEFAULT_AVATAR_CONFIG.bg,
  };
}

export function AvatarSVGCompat({ style, config, size = 96, expression }) {
  const resolved = config || legacyToConfig(style) || DEFAULT_AVATAR_CONFIG;
  return <AvatarSVG config={resolved} size={size} expression={expression} />;
}

export { AvatarSVGCompat as AvatarSVG };

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

function randomConfig() {
  const hs = randomFrom(HAIR_STYLES);
  return {
    ...DEFAULT_AVATAR_CONFIG,
    skinColor: randomFrom(SKIN_COLORS),
    faceShape: randomFrom(['oval', 'round', 'square', 'heart']),
    eyes: { type: randomFrom(EYE_TYPES).id, color: randomFrom(EYE_COLORS) },
    eyebrows: { type: randomFrom(EYEBROW_TYPES).id },
    nose: { type: randomFrom(NOSE_TYPES).id },
    mouth: { type: randomFrom(MOUTH_TYPES).id, lipColor: randomFrom(LIP_COLORS) },
    hair: { style: hs.id, color: randomFrom(HAIR_COLORS), isLong: hs.isLong },
    outfit: { style: randomFrom(OUTFIT_STYLES).id, color: randomFrom(OUTFIT_COLORS) },
    accessory: randomFrom(ACCESSORIES).id,
    bg: randomFrom(BG_COLORS),
    expression: randomFrom(['neutral', 'happy', 'excited']),
  };
}

const TABS = [
  { id: 'face', label: 'Ansikte', emoji: '😊' },
  { id: 'hair', label: 'Hår', emoji: '💇' },
  { id: 'eyes', label: 'Ögon', emoji: '👀' },
  { id: 'features', label: 'Drag', emoji: '👃' },
  { id: 'clothes', label: 'Stil', emoji: '👕' },
  { id: 'extras', label: 'Extra', emoji: '✨' },
];

const EXPRESSIONS = [
  { id: 'neutral', label: 'Neutral' },
  { id: 'happy', label: 'Glad' },
  { id: 'excited', label: 'Superglad' },
  { id: 'focused', label: 'Fokus' },
];

function SwatchRow({ colors, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((col) => (
        <button
          key={col}
          type="button"
          onClick={() => onChange(col)}
          className="w-9 h-9 rounded-full transition-transform"
          style={{
            background: col,
            transform: value === col ? 'scale(1.15)' : 'scale(1)',
            boxShadow:
              value === col
                ? `0 0 0 3px #fff, 0 0 0 5px ${col}`
                : '0 2px 6px rgba(0,0,0,0.12)',
          }}
          aria-label={`Färg ${col}`}
        />
      ))}
    </div>
  );
}

function OptionGrid({ options, value, onPick, renderPreview }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {options.map((opt) => {
        const id = typeof opt === 'object' ? opt.id : opt;
        const label = typeof opt === 'object' ? opt.label : opt;
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            className="flex flex-col items-center rounded-2xl p-2 transition-all border-2"
            style={{
              borderColor: active ? '#FFE566' : '#E8E4DC',
              background: active ? '#FFF9E6' : '#fff',
              boxShadow: active ? '0 4px 12px rgba(255,229,102,0.45)' : '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            {renderPreview ? renderPreview(id, active) : null}
            <span
              className="text-[11px] font-semibold mt-1 text-center leading-tight"
              style={{ color: active ? '#1a1a1a' : '#666' }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function AvatarBuilder({ value, onChange, onSave, saved, embedded = false }) {
  const [config, setConfig] = useState(() => ({
    ...DEFAULT_AVATAR_CONFIG,
    ...(legacyToConfig(value) || {}),
  }));
  const [tab, setTab] = useState('face');

  const update = useCallback(
    (path, val) => {
      setConfig((prev) => {
        let next = deepSet(prev, path, val);
        if (path === 'hair.style') next = deepSet(next, 'hair.isLong', LONG_STYLES.includes(val));
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  const randomize = () => {
    const next = randomConfig();
    setConfig(next);
    onChange?.(next);
  };

  const previewCfg = (patch) => ({ ...config, ...patch });

  const panel = (
    <AnimatePresence mode="wait">
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="px-4 pb-6 space-y-4"
      >
        {tab === 'face' && (
          <>
            <p className="text-[13px] font-semibold text-[#888]">Hudton</p>
            <SwatchRow colors={SKIN_COLORS} value={config.skinColor} onChange={(v) => update('skinColor', v)} />
            <p className="text-[13px] font-semibold text-[#888] pt-2">Ansiktsform</p>
            <OptionGrid
              options={[
                { id: 'oval', label: 'Oval' },
                { id: 'round', label: 'Rund' },
                { id: 'square', label: 'Kantig' },
                { id: 'heart', label: 'Hjärta' },
              ]}
              value={config.faceShape}
              onPick={(id) => update('faceShape', id)}
            />
            <p className="text-[13px] font-semibold text-[#888] pt-2">Uttryck</p>
            <div className="flex flex-wrap gap-2">
              {EXPRESSIONS.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => update('expression', ex.id)}
                  className="px-4 py-2 rounded-full text-[13px] font-semibold"
                  style={{
                    background: config.expression === ex.id ? '#FFE566' : '#fff',
                    border: '2px solid #E8E4DC',
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </>
        )}

        {tab === 'hair' && (
          <>
            <p className="text-[13px] font-semibold text-[#888]">Frisyr</p>
            <OptionGrid
              options={HAIR_STYLES}
              value={config.hair?.style}
              onPick={(id) => update('hair.style', id)}
              renderPreview={(id) => (
                <AvatarSVG
                  config={deepSet(config, 'hair.style', id)}
                  size={52}
                />
              )}
            />
            <p className="text-[13px] font-semibold text-[#888] pt-2">Hårfärg</p>
            <SwatchRow
              colors={HAIR_COLORS}
              value={config.hair?.color}
              onChange={(v) => update('hair.color', v)}
            />
          </>
        )}

        {tab === 'eyes' && (
          <>
            <p className="text-[13px] font-semibold text-[#888]">Ögonform</p>
            <OptionGrid
              options={EYE_TYPES}
              value={config.eyes?.type}
              onPick={(id) => update('eyes.type', id)}
            />
            <p className="text-[13px] font-semibold text-[#888] pt-2">Ögonfärg</p>
            <SwatchRow
              colors={EYE_COLORS}
              value={config.eyes?.color}
              onChange={(v) => update('eyes.color', v)}
            />
            <p className="text-[13px] font-semibold text-[#888] pt-2">Ögonbryn</p>
            <OptionGrid
              options={EYEBROW_TYPES}
              value={config.eyebrows?.type}
              onPick={(id) => update('eyebrows.type', id)}
            />
          </>
        )}

        {tab === 'features' && (
          <>
            <p className="text-[13px] font-semibold text-[#888]">Näsa</p>
            <OptionGrid
              options={NOSE_TYPES}
              value={config.nose?.type}
              onPick={(id) => update('nose.type', id)}
            />
            <p className="text-[13px] font-semibold text-[#888] pt-2">Mun</p>
            <OptionGrid
              options={MOUTH_TYPES}
              value={config.mouth?.type}
              onPick={(id) => update('mouth.type', id)}
            />
            <p className="text-[13px] font-semibold text-[#888] pt-2">Läppfärg</p>
            <SwatchRow
              colors={LIP_COLORS}
              value={config.mouth?.lipColor}
              onChange={(v) => update('mouth.lipColor', v)}
            />
          </>
        )}

        {tab === 'clothes' && (
          <>
            <p className="text-[13px] font-semibold text-[#888]">Plagg</p>
            <OptionGrid
              options={OUTFIT_STYLES}
              value={config.outfit?.style}
              onPick={(id) => update('outfit.style', id)}
              renderPreview={(id) => (
                <AvatarSVG config={deepSet(config, 'outfit.style', id)} size={52} />
              )}
            />
            <p className="text-[13px] font-semibold text-[#888] pt-2">Klädfärg</p>
            <SwatchRow
              colors={OUTFIT_COLORS}
              value={config.outfit?.color}
              onChange={(v) => update('outfit.color', v)}
            />
          </>
        )}

        {tab === 'extras' && (
          <>
            <p className="text-[13px] font-semibold text-[#888]">Tillbehör</p>
            <OptionGrid
              options={ACCESSORIES}
              value={config.accessory}
              onPick={(id) => update('accessory', id)}
            />
            <p className="text-[13px] font-semibold text-[#888] pt-2">Bakgrund</p>
            <SwatchRow colors={BG_COLORS} value={config.bg} onChange={(v) => update('bg', v)} />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div
      className="flex flex-col overflow-hidden rounded-3xl"
      style={{
        background: '#FFFDF7',
        minHeight: embedded ? 520 : 640,
        boxShadow: embedded ? 'none' : '0 8px 32px rgba(0,0,0,0.08)',
      }}
    >
      <div
        className="relative px-4 pt-6 pb-4"
        style={{ background: 'linear-gradient(180deg, #FFF9E6 0%, #FFFDF7 100%)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFB800]" />
            <span className="text-[15px] font-bold text-[#1a1a1a]">Din avatar</span>
          </div>
          <button
            type="button"
            onClick={randomize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-white border-2 border-[#E8E4DC] text-[#444]"
          >
            <Dice6 className="w-4 h-4" />
            Slumpa
          </button>
        </div>
        <AvatarPreview config={config} size={embedded ? 160 : 188} expression={config.expression} />
      </div>

      <div
        className="flex overflow-x-auto border-y border-[#E8E4DC] bg-white scrollbar-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-3 min-w-[72px]"
              style={{
                borderBottom: active ? '3px solid #FFE566' : '3px solid transparent',
                background: active ? '#FFF9E6' : 'transparent',
              }}
            >
              <span className="text-xl">{t.emoji}</span>
              <span className="text-[11px] font-bold text-[#333]">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto bg-[#FAFAF8]">{panel}</div>

      {onSave && (
        <div className="p-4 border-t border-[#E8E4DC] bg-white">
          <button
            type="button"
            onClick={onSave}
            className="w-full h-[52px] rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            style={{
              background: saved ? '#34C759' : '#FFE566',
              color: '#1a1a1a',
              boxShadow: '0 4px 0 #E6C200',
            }}
          >
            <Check className="w-5 h-5" />
            {saved ? 'Sparad!' : 'Spara avatar'}
          </button>
        </div>
      )}
    </div>
  );
}
