/**
 * Clean minimal 2D avatar — platta former, inga konturer, Memoji-flat.
 */
import React from 'react';
import { DEFAULT_AVATAR_CONFIG, normalizeAvatarConfig } from './avatarConfig';

function shade(hex, amt) {
  if (!hex?.startsWith('#')) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function Face({ skin, shape }) {
  const rx = shape === 'oval' ? 26 : 28;
  const ry = shape === 'oval' ? 30 : 28;
  return (
    <ellipse cx="60" cy="52" rx={rx} ry={ry} fill={skin} />
  );
}

function Ears({ skin }) {
  return (
    <>
      <ellipse cx="32" cy="54" rx="5" ry="7" fill={skin} />
      <ellipse cx="88" cy="54" rx="5" ry="7" fill={skin} />
    </>
  );
}

function HairBack({ style, color }) {
  const dk = shade(color, -12);
  switch (style) {
    case 'long':
      return (
        <path
          d="M28 48 Q24 95 38 108 Q60 114 82 108 Q96 95 92 48"
          fill={dk}
        />
      );
    case 'medium':
      return (
        <path
          d="M30 44 Q28 78 36 88 Q60 92 84 88 Q92 78 90 44"
          fill={dk}
        />
      );
    case 'curly':
      return (
        <>
          <ellipse cx="38" cy="36" rx="14" ry="12" fill={color} />
          <ellipse cx="60" cy="28" rx="16" ry="14" fill={color} />
          <ellipse cx="82" cy="36" rx="14" ry="12" fill={color} />
        </>
      );
    default:
      return null;
  }
}

function HairFront({ style, color }) {
  if (style === 'bald') return null;
  const dk = shade(color, -8);
  switch (style) {
    case 'short':
      return (
        <path
          d="M34 48 Q34 22 60 20 Q86 22 86 48 Q86 38 60 36 Q34 38 34 48 Z"
          fill={color}
        />
      );
    case 'medium':
      return (
        <path
          d="M32 50 Q30 26 60 22 Q90 26 88 50 Q88 42 60 38 Q32 42 32 50 Z"
          fill={color}
        />
      );
    case 'long':
      return (
        <path
          d="M34 48 Q34 24 60 20 Q86 24 86 48 Q84 40 60 36 Q36 40 34 48 Z"
          fill={color}
        />
      );
    case 'bun':
      return (
        <>
          <circle cx="60" cy="18" r="11" fill={color} />
          <path
            d="M34 48 Q34 26 60 24 Q86 26 86 48 Q84 40 60 38 Q36 40 34 48 Z"
            fill={color}
          />
        </>
      );
    case 'curly':
      return (
        <path
          d="M36 50 Q36 30 60 28 Q84 30 84 50 Q82 42 60 40 Q38 42 36 50 Z"
          fill={dk}
        />
      );
    default:
      return null;
  }
}

function Eyes({ style, color }) {
  if (style === 'almond') {
    return (
      <>
        <ellipse cx="48" cy="52" rx="5" ry="3.5" fill="#fff" />
        <ellipse cx="72" cy="52" rx="5" ry="3.5" fill="#fff" />
        <circle cx="48" cy="52" r="2.2" fill={color} />
        <circle cx="72" cy="52" r="2.2" fill={color} />
      </>
    );
  }
  return (
    <>
      <circle cx="48" cy="52" r="4.5" fill="#fff" />
      <circle cx="72" cy="52" r="4.5" fill="#fff" />
      <circle cx="48" cy="52.5" r="2.5" fill={color} />
      <circle cx="72" cy="52.5" r="2.5" fill={color} />
    </>
  );
}

function Brows({ style, hairColor }) {
  const c = shade(hairColor, -20);
  if (style === 'flat') {
    return (
      <>
        <rect x="42" y="44" width="12" height="2" rx="1" fill={c} />
        <rect x="66" y="44" width="12" height="2" rx="1" fill={c} />
      </>
    );
  }
  if (style === 'arc') {
    return (
      <>
        <path d="M42 46 Q48 42 54 46" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M66 46 Q72 42 78 46" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    );
  }
  return (
    <>
      <ellipse cx="48" cy="45" rx="5" ry="1.5" fill={c} opacity="0.85" />
      <ellipse cx="72" cy="45" rx="5" ry="1.5" fill={c} opacity="0.85" />
    </>
  );
}

function Mouth({ style, skin }) {
  const lip = shade(skin, -18);
  if (style === 'smile') {
    return (
      <path
        d="M50 64 Q60 70 70 64"
        stroke={lip}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  if (style === 'neutral') {
    return <rect x="54" y="64" width="12" height="2" rx="1" fill={lip} opacity="0.7" />;
  }
  return (
    <path
      d="M52 65 Q60 67 68 65"
      stroke={lip}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      opacity="0.85"
    />
  );
}

function Accessory({ type }) {
  if (type === 'glasses') {
    return (
      <>
        <circle cx="48" cy="52" r="9" fill="none" stroke="#2D3436" strokeWidth="1.8" opacity="0.75" />
        <circle cx="72" cy="52" r="9" fill="none" stroke="#2D3436" strokeWidth="1.8" opacity="0.75" />
        <path d="M57 52 H63" stroke="#2D3436" strokeWidth="1.8" opacity="0.75" />
      </>
    );
  }
  if (type === 'earrings') {
    return (
      <>
        <circle cx="31" cy="58" r="2" fill="#C9A227" />
        <circle cx="89" cy="58" r="2" fill="#C9A227" />
      </>
    );
  }
  return null;
}

function Top({ style, color }) {
  const dk = shade(color, -14);
  if (style === 'hoodie') {
    return (
      <>
        <path d="M28 108 Q28 82 60 78 Q92 82 92 108 Z" fill={color} />
        <path d="M48 78 Q60 88 72 78" fill={dk} opacity="0.35" />
        <ellipse cx="60" cy="108" rx="34" ry="6" fill={dk} opacity="0.2" />
      </>
    );
  }
  if (style === 'vneck') {
    return (
      <>
        <path d="M30 108 Q30 84 60 80 Q90 84 90 108 Z" fill={color} />
        <path d="M54 80 L60 92 L66 80 Z" fill={dk} opacity="0.25" />
      </>
    );
  }
  return (
    <path d="M30 108 Q30 86 60 82 Q90 86 90 108 Z" fill={color} />
  );
}

function Neck({ skin }) {
  return <rect x="52" y="72" width="16" height="14" rx="4" fill={skin} />;
}

export default function MinimalAvatar({ config: rawConfig, size = 48, className, style }) {
  const c = normalizeAvatarConfig(rawConfig) || DEFAULT_AVATAR_CONFIG;
  const longHair = ['long', 'medium', 'curly'].includes(c.hairStyle);

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', flexShrink: 0, ...style }}
      aria-hidden
    >
      <circle cx="60" cy="60" r="58" fill={c.bg} />
      <Top style={c.topStyle} color={c.topColor} />
      <Neck skin={c.skin} />
      {longHair && <HairBack style={c.hairStyle} color={c.hairColor} />}
      <Ears skin={c.skin} />
      <Face skin={c.skin} shape={c.faceShape} />
      <Brows style={c.browStyle} hairColor={c.hairColor} />
      <Eyes style={c.eyeStyle} color={c.eyeColor} />
      <Mouth style={c.mouth} skin={c.skin} />
      <HairFront style={c.hairStyle} color={c.hairColor} />
      <Accessory type={c.accessory} />
    </svg>
  );
}

export { MinimalAvatar };
