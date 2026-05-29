import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Shuffle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { AvatarSVG } from './BitmojiEngine';
import { SNAP } from './bitmojiTheme';
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
} from './AvatarConfig';

const LONG = ['long_straight', 'curly_big', 'ponytail', 'bob'];

function legacyToConfig(v) {
  if (!v || typeof v !== 'object') return null;
  if (v.skinColor != null || v.eyes) return { ...DEFAULT_AVATAR_CONFIG, ...v };
  return {
    ...DEFAULT_AVATAR_CONFIG,
    skinColor: v.skin || DEFAULT_AVATAR_CONFIG.skinColor,
    hair: { style: v.hair || 'short_clean', color: v.hairColor || '#2C1810', isLong: false },
    outfit: { style: v.top || 'hoodie', color: v.topColor || '#5AC8FA' },
    bg: v.bg || DEFAULT_AVATAR_CONFIG.bg,
  };
}

function deepSet(obj, path, val) {
  const keys = path.split('.');
  const out = { ...obj };
  let cur = out;
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = { ...(cur[keys[i]] || {}) };
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = val;
  return out;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAvatar() {
  const hair = pick(HAIR_STYLES);
  return {
    ...DEFAULT_AVATAR_CONFIG,
    skinColor: pick(SKIN_COLORS),
    faceShape: pick(['oval', 'round', 'square', 'heart']),
    eyes: { type: pick(EYE_TYPES).id, color: pick(EYE_COLORS) },
    eyebrows: { type: pick(EYEBROW_TYPES).id },
    nose: { type: pick(NOSE_TYPES).id },
    mouth: { type: pick(MOUTH_TYPES).id, lipColor: pick(LIP_COLORS) },
    hair: { style: hair.id, color: pick(HAIR_COLORS), isLong: hair.isLong },
    outfit: { style: pick(OUTFIT_STYLES).id, color: pick(OUTFIT_COLORS) },
    accessory: pick(ACCESSORIES).id,
    bg: pick(BG_COLORS),
    expression: pick(['neutral', 'happy', 'excited']),
  };
}

const TABS = [
  { id: 'face', label: 'Ansikte', icon: '😊' },
  { id: 'hair', label: 'Hår', icon: '💇' },
  { id: 'eyes', label: 'Ögon', icon: '👀' },
  { id: 'face2', label: 'Drag', icon: '👃' },
  { id: 'outfit', label: 'Outfit', icon: '👕' },
  { id: 'extra', label: 'Extra', icon: '✨' },
];

const EXPRESSIONS = [
  { id: 'neutral', emoji: '🙂' },
  { id: 'happy', emoji: '😄' },
  { id: 'excited', emoji: '🤩' },
  { id: 'focused', emoji: '😏' },
];

function Swatches({ colors, value, onChange }) {
  return (
    <div className="flex gap-2.5 flex-wrap px-4 pb-3">
      {colors.map((col) => (
        <button
          key={col}
          type="button"
          onClick={() => onChange(col)}
          className="w-11 h-11 rounded-full border-2 transition-transform active:scale-95"
          style={{
            background: col,
            borderColor: value === col ? SNAP.yellow : SNAP.border,
            boxShadow: value === col ? `0 0 0 2px ${SNAP.text}` : '0 2px 6px rgba(0,0,0,0.08)',
            transform: value === col ? 'scale(1.1)' : 'scale(1)',
          }}
          aria-label="Välj färg"
        />
      ))}
    </div>
  );
}

function ThumbGrid({ options, value, onPick, renderThumb }) {
  return (
    <div className="grid grid-cols-4 gap-2 px-4 pb-4">
      {options.map((opt) => {
        const id = opt.id ?? opt;
        const label = opt.label ?? opt;
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            className="flex flex-col items-center rounded-2xl p-1.5 border-2 transition-all active:scale-[0.97]"
            style={{
              borderColor: active ? SNAP.yellow : SNAP.border,
              background: active ? '#FFFDE6' : SNAP.bg,
              boxShadow: active ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <div
              className="w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: SNAP.panel }}
            >
              {renderThumb ? renderThumb(id) : (
                <span className="text-[11px] font-semibold text-center px-1" style={{ color: SNAP.textMuted }}>
                  {label}
                </span>
              )}
            </div>
            <span
              className="text-[10px] font-bold mt-1 text-center leading-tight line-clamp-2"
              style={{ color: active ? SNAP.text : SNAP.textMuted }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function AvatarStudioEditor({
  initialValue,
  onChange,
  onSave,
  saved = false,
  saving = false,
  backHref = createPageUrl('Dashboard'),
  embedded = false,
}) {
  const [config, setConfig] = useState(() => ({
    ...DEFAULT_AVATAR_CONFIG,
    ...(legacyToConfig(initialValue) || {}),
  }));
  const [tab, setTab] = useState('face');

  useEffect(() => {
    if (initialValue) {
      const next = { ...DEFAULT_AVATAR_CONFIG, ...(legacyToConfig(initialValue) || {}) };
      setConfig(next);
    }
  }, [initialValue]);

  const update = useCallback(
    (path, val) => {
      setConfig((prev) => {
        let next = deepSet(prev, path, val);
        if (path === 'hair.style') next = deepSet(next, 'hair.isLong', LONG.includes(val));
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  useEffect(() => {
    onChange?.(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- skicka startconfig till spara
  }, []);

  const shuffle = () => {
    const next = randomAvatar();
    setConfig(next);
    onChange?.(next);
  };

  const panel = (
    <div className="overflow-y-auto max-h-[42vh]">
      {tab === 'face' && (
        <>
          <p className="px-4 pt-2 pb-1 text-[13px] font-bold" style={{ color: SNAP.textMuted }}>
            Hudton
          </p>
          <Swatches colors={SKIN_COLORS} value={config.skinColor} onChange={(v) => update('skinColor', v)} />
          <p className="px-4 pt-1 pb-1 text-[13px] font-bold" style={{ color: SNAP.textMuted }}>
            Ansiktsform
          </p>
          <ThumbGrid
            options={[
              { id: 'oval', label: 'Oval' },
              { id: 'round', label: 'Rund' },
              { id: 'square', label: 'Kantig' },
              { id: 'heart', label: 'Hjärta' },
            ]}
            value={config.faceShape}
            onPick={(id) => update('faceShape', id)}
          />
          <p className="px-4 text-[13px] font-bold" style={{ color: SNAP.textMuted }}>
            Uttryck
          </p>
          <div className="flex gap-2 px-4 pb-4">
            {EXPRESSIONS.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => update('expression', ex.id)}
                className="flex-1 py-3 rounded-2xl text-2xl border-2"
                style={{
                  borderColor: config.expression === ex.id ? SNAP.yellow : SNAP.border,
                  background: config.expression === ex.id ? '#FFFDE6' : SNAP.bg,
                }}
              >
                {ex.emoji}
              </button>
            ))}
          </div>
        </>
      )}

      {tab === 'hair' && (
        <>
          <ThumbGrid
            options={HAIR_STYLES}
            value={config.hair?.style}
            onPick={(id) => update('hair.style', id)}
            renderThumb={(id) => (
              <AvatarSVG config={deepSet(config, 'hair.style', id)} size={64} />
            )}
          />
          <Swatches
            colors={HAIR_COLORS}
            value={config.hair?.color}
            onChange={(v) => update('hair.color', v)}
          />
        </>
      )}

      {tab === 'eyes' && (
        <>
          <ThumbGrid
            options={EYE_TYPES}
            value={config.eyes?.type}
            onPick={(id) => update('eyes.type', id)}
          />
          <Swatches colors={EYE_COLORS} value={config.eyes?.color} onChange={(v) => update('eyes.color', v)} />
          <p className="px-4 text-[13px] font-bold" style={{ color: SNAP.textMuted }}>
            Ögonbryn
          </p>
          <ThumbGrid
            options={EYEBROW_TYPES}
            value={config.eyebrows?.type}
            onPick={(id) => update('eyebrows.type', id)}
          />
        </>
      )}

      {tab === 'face2' && (
        <>
          <p className="px-4 pt-2 text-[13px] font-bold" style={{ color: SNAP.textMuted }}>
            Näsa
          </p>
          <ThumbGrid options={NOSE_TYPES} value={config.nose?.type} onPick={(id) => update('nose.type', id)} />
          <p className="px-4 text-[13px] font-bold" style={{ color: SNAP.textMuted }}>
            Mun
          </p>
          <ThumbGrid options={MOUTH_TYPES} value={config.mouth?.type} onPick={(id) => update('mouth.type', id)} />
          <Swatches colors={LIP_COLORS} value={config.mouth?.lipColor} onChange={(v) => update('mouth.lipColor', v)} />
        </>
      )}

      {tab === 'outfit' && (
        <>
          <ThumbGrid
            options={OUTFIT_STYLES}
            value={config.outfit?.style}
            onPick={(id) => update('outfit.style', id)}
            renderThumb={(id) => (
              <AvatarSVG config={deepSet(config, 'outfit.style', id)} size={64} />
            )}
          />
          <Swatches
            colors={OUTFIT_COLORS}
            value={config.outfit?.color}
            onChange={(v) => update('outfit.color', v)}
          />
        </>
      )}

      {tab === 'extra' && (
        <>
          <ThumbGrid
            options={ACCESSORIES}
            value={config.accessory}
            onPick={(id) => update('accessory', id)}
          />
          <p className="px-4 text-[13px] font-bold" style={{ color: SNAP.textMuted }}>
            Bakgrund
          </p>
          <Swatches colors={BG_COLORS} value={config.bg} onChange={(v) => update('bg', v)} />
        </>
      )}
    </div>
  );

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: SNAP.bg, color: SNAP.text }}
    >
      {!embedded && (
        <header
          className="flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: SNAP.border, paddingTop: 'max(12px, env(safe-area-inset-top))' }}
        >
          <Link
            to={backHref}
            className="w-10 h-10 rounded-full flex items-center justify-center no-underline"
            style={{ background: SNAP.panel }}
            aria-label="Tillbaka"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: SNAP.text }} />
          </Link>
          <span className="text-[17px] font-bold">Din Bitmoji</span>
          {onSave ? (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="h-10 px-4 rounded-full font-bold text-[15px] flex items-center gap-1.5 disabled:opacity-60"
              style={{ background: saved ? '#34C759' : SNAP.yellow, color: SNAP.text }}
            >
              {saved ? <Check className="w-4 h-4" /> : null}
              {saved ? 'Klar' : saving ? '…' : 'Klar'}
            </button>
          ) : (
            <div className="w-10" />
          )}
        </header>
      )}

      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-4"
        style={{ background: `linear-gradient(180deg, ${SNAP.panel} 0%, ${SNAP.bg} 100%)` }}
      >
        <button
          type="button"
          onClick={shuffle}
          className="mb-3 flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-bold border-2"
          style={{ borderColor: SNAP.border, background: SNAP.bg }}
        >
          <Shuffle className="w-4 h-4" />
          Slumpa look
        </button>

        <div
          className="rounded-full p-1"
          style={{
            background: config.bg,
            boxShadow: SNAP.circleShadow,
          }}
        >
          <div className="rounded-full overflow-hidden bg-white/10" style={{ width: embedded ? 200 : 260, height: embedded ? 200 : 260 }}>
            <AvatarSVG config={config} size={embedded ? 200 : 260} expression={config.expression} />
          </div>
        </div>
      </div>

      <div
        className="shrink-0 border-t rounded-t-3xl overflow-hidden"
        style={{
          borderColor: SNAP.border,
          background: SNAP.bg,
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex overflow-x-auto scrollbar-none border-b" style={{ borderColor: SNAP.border }}>
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="flex-shrink-0 flex flex-col items-center py-3 px-4 min-w-[68px]"
                style={{
                  borderBottom: on ? `3px solid ${SNAP.yellow}` : '3px solid transparent',
                }}
              >
                <span className="text-[22px] leading-none">{t.icon}</span>
                <span className="text-[11px] font-bold mt-1" style={{ color: on ? SNAP.text : SNAP.textMuted }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
        {panel}
        {embedded && onSave && (
          <div className="px-4 pt-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="w-full h-[52px] rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2"
              style={{ background: SNAP.yellow, color: SNAP.text }}
            >
              {saved ? <Check className="w-5 h-5" /> : null}
              {saved ? 'Sparad!' : saving ? 'Sparar…' : 'Spara avatar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
