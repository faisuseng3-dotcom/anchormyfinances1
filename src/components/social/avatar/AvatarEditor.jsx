import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Shuffle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import MinimalAvatar from './MinimalAvatar';
import {
  DEFAULT_AVATAR_CONFIG,
  SKIN_TONES,
  HAIR_COLORS,
  TOP_COLORS,
  BG_COLORS,
  HAIR_STYLES,
  EYE_STYLES,
  BROW_STYLES,
  MOUTH_STYLES,
  ACCESSORIES,
  TOP_STYLES,
  FACE_SHAPES,
  randomAvatarConfig,
  normalizeAvatarConfig,
  configForSave,
} from './avatarConfig';

const TABS = [
  { id: 'base', label: 'Bas' },
  { id: 'hair', label: 'Hår' },
  { id: 'face', label: 'Ansikte' },
  { id: 'style', label: 'Stil' },
];

function Swatches({ colors, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="w-9 h-9 rounded-full transition-transform active:scale-95"
          style={{
            background: color,
            border: value === color ? '3px solid white' : '2px solid rgba(255,255,255,0.15)',
            boxShadow: value === color ? '0 0 0 2px rgba(13,115,119,0.8)' : 'none',
          }}
          aria-label={color}
        />
      ))}
    </div>
  );
}

function Chips({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ id, label }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="px-3.5 py-2 rounded-full text-[13px] font-semibold transition-colors"
            style={{
              background: active ? 'var(--color-accent)' : 'var(--color-surface)',
              color: active ? '#fff' : 'var(--color-text-secondary)',
              border: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

export default function AvatarEditor({
  initialValue,
  onChange,
  onSave,
  saved = false,
  saving = false,
  backHref,
  embedded = false,
}) {
  const [tab, setTab] = useState('base');
  const [config, setConfig] = useState(() => ({
    ...DEFAULT_AVATAR_CONFIG,
    ...(normalizeAvatarConfig(initialValue) || {}),
  }));

  useEffect(() => {
    if (initialValue) {
      setConfig({ ...DEFAULT_AVATAR_CONFIG, ...(normalizeAvatarConfig(initialValue) || {}) });
    }
  }, [initialValue]);

  useEffect(() => {
    onChange?.(configForSave(config));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = useCallback(
    (updates) => {
      setConfig((prev) => {
        const next = configForSave({ ...prev, ...updates });
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  const shuffle = () => {
    const next = configForSave(randomAvatarConfig());
    setConfig(next);
    onChange?.(next);
  };

  const previewSize = embedded ? 180 : 220;

  return (
    <div
      className={embedded ? 'flex flex-col' : 'min-h-screen flex flex-col'}
      style={{ background: embedded ? 'transparent' : 'var(--color-background-primary)' }}
    >
      {!embedded && (
        <div className="px-5 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {backHref && (
              <Link
                to={backHref}
                className="w-9 h-9 rounded-full flex items-center justify-center no-underline"
                style={{ background: 'var(--color-surface)' }}
              >
                <ArrowLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              </Link>
            )}
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Din avatar
              </h1>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Clean & minimal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={shuffle}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-surface)' }}
            aria-label="Slumpa"
          >
            <Shuffle className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      )}

      <div className={`flex flex-col items-center ${embedded ? 'py-4' : 'py-6'}`}>
        <div
          className="rounded-full flex items-center justify-center overflow-hidden"
          style={{
            width: previewSize + 24,
            height: previewSize + 24,
            background: 'var(--color-surface)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}
        >
          <MinimalAvatar config={config} size={previewSize} />
        </div>
      </div>

      <div className={`px-5 ${embedded ? 'pb-2' : 'pb-28'} space-y-4`}>
        <div className="flex rounded-2xl p-1" style={{ background: 'var(--color-surface)' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: tab === t.id ? 'var(--color-accent)' : 'transparent',
                color: tab === t.id ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          className="rounded-2xl p-4 space-y-5"
          style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {tab === 'base' && (
            <>
              <Section title="Hudton">
                <Swatches colors={SKIN_TONES} value={config.skin} onChange={(skin) => patch({ skin })} />
              </Section>
              <Section title="Ansiktsform">
                <Chips options={FACE_SHAPES} value={config.faceShape} onChange={(faceShape) => patch({ faceShape })} />
              </Section>
              <Section title="Bakgrund">
                <Swatches colors={BG_COLORS} value={config.bg} onChange={(bg) => patch({ bg })} />
              </Section>
            </>
          )}

          {tab === 'hair' && (
            <>
              <Section title="Frisyr">
                <Chips options={HAIR_STYLES} value={config.hairStyle} onChange={(hairStyle) => patch({ hairStyle })} />
              </Section>
              <Section title="Hårfärg">
                <Swatches colors={HAIR_COLORS} value={config.hairColor} onChange={(hairColor) => patch({ hairColor })} />
              </Section>
            </>
          )}

          {tab === 'face' && (
            <>
              <Section title="Ögon">
                <Chips options={EYE_STYLES} value={config.eyeStyle} onChange={(eyeStyle) => patch({ eyeStyle })} />
              </Section>
              <Section title="Ögonbryn">
                <Chips options={BROW_STYLES} value={config.browStyle} onChange={(browStyle) => patch({ browStyle })} />
              </Section>
              <Section title="Mun">
                <Chips options={MOUTH_STYLES} value={config.mouth} onChange={(mouth) => patch({ mouth })} />
              </Section>
              <Section title="Tillbehör">
                <Chips options={ACCESSORIES} value={config.accessory} onChange={(accessory) => patch({ accessory })} />
              </Section>
            </>
          )}

          {tab === 'style' && (
            <>
              <Section title="Plagg">
                <Chips options={TOP_STYLES} value={config.topStyle} onChange={(topStyle) => patch({ topStyle })} />
              </Section>
              <Section title="Plaggfärg">
                <Swatches colors={TOP_COLORS} value={config.topColor} onChange={(topColor) => patch({ topColor })} />
              </Section>
            </>
          )}
        </div>

        {embedded && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={shuffle}
              className="flex-1 py-3 rounded-2xl text-sm font-bold"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}
            >
              Slumpa
            </button>
          </div>
        )}

        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl text-[15px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: saved ? '#0FDEBD' : 'var(--color-accent)' }}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" /> Sparad!
              </>
            ) : saving ? (
              'Sparar…'
            ) : (
              'Spara avatar'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
