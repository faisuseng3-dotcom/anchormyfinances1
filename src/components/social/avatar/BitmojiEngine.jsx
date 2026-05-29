/**
 * Bitmoji-style avatar renderer — stor huvud, mjuka former, tydliga konturer, starka färger.
 * Samma config-format som AvatarConfig / legacy profiler.
 */
import React, { useId } from 'react';
import { EXPRESSION_MOUTH_MAP } from './AvatarConfig';

export function hexBlend(a, b, t) {
  if (!a || !b) return a || b || '#888';
  const p = (h) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  return (
    '#' +
    [r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function hexAdjust(hex, amt) {
  if (!hex?.startsWith('#')) return hex || '#888';
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const OUTLINE = '#2C2416';
const LONG_HAIR = ['long_straight', 'curly_big', 'ponytail', 'bob'];

function Face({ skin, faceShape, uid }) {
  const hi = hexBlend(skin, '#FFFFFF', 0.35);
  const sh = hexBlend(skin, '#000000', 0.12);
  let rx = 30;
  let ry = 32;
  if (faceShape === 'round') {
    rx = 31;
    ry = 30;
  }
  if (faceShape === 'square') {
    rx = 29;
    ry = 28;
  }
  if (faceShape === 'heart') {
    rx = 27;
    ry = 33;
  }
  const cx = 50;
  const cy = 52;
  const d = `
    M${cx - rx} ${cy - 4}
    C${cx - rx - 1} ${cy - ry} ${cx - 4} ${cy - ry - 2} ${cx} ${cy - ry}
    C${cx + 4} ${cy - ry - 2} ${cx + rx + 1} ${cy - ry} ${cx + rx} ${cy - 4}
    C${cx + rx + 2} ${cy + 6} ${cx + rx - 2} ${cy + ry - 2} ${cx} ${cy + ry + 2}
    C${cx - rx + 2} ${cy + ry - 2} ${cx - rx - 2} ${cy + 6} ${cx - rx} ${cy - 4} Z`;

  return (
    <>
      <path d={d} fill={sh} transform="translate(0, 2)" opacity="0.25" />
      <path d={d} fill={`url(#${uid}_skin)`} stroke={OUTLINE} strokeWidth="2.2" strokeLinejoin="round" />
      <ellipse cx={cx - 14} cy={cy + 10} rx="9" ry="6" fill={`url(#${uid}_blush)`} />
      <ellipse cx={cx + 14} cy={cy + 10} rx="9" ry="6" fill={`url(#${uid}_blush)`} />
      <ellipse cx={cx - 12} cy={cy - 12} rx="14" ry="8" fill={hi} opacity="0.35" />
    </>
  );
}

function Eye({ cx, cy, type, color }) {
  const sizes = {
    almond: [7, 8],
    round: [7.5, 8.5],
    cat: [8, 7],
    hooded: [6.5, 7],
    wide: [8.5, 9],
  };
  const [rx, ry] = sizes[type] || sizes.almond;
  return (
    <g>
      <ellipse cx={cx} cy={cy + 1} rx={rx + 2} ry={ry + 1} fill="white" stroke={OUTLINE} strokeWidth="1.8" />
      <ellipse cx={cx} cy={cy + 1.5} rx={rx * 0.72} ry={ry * 0.78} fill={color} />
      <ellipse cx={cx} cy={cy + 2} rx={rx * 0.38} ry={ry * 0.42} fill="#1a1208" />
      <circle cx={cx - 2} cy={cy - 1} r={2.2} fill="white" />
      <circle cx={cx + 2.5} cy={cy} r={1.2} fill="white" opacity="0.85" />
    </g>
  );
}

function Brow({ cx, cy, type }) {
  const w = type === 'thick' ? 4 : type === 'thin' ? 1.8 : 2.8;
  const arch = type === 'arched' ? -5 : -3;
  return (
    <path
      d={`M${cx - 9} ${cy + 2} Q${cx} ${cy + arch} ${cx + 9} ${cy + 1}`}
      stroke="#2C1810"
      strokeWidth={w}
      fill="none"
      strokeLinecap="round"
    />
  );
}

function Nose({ type }) {
  if (type === 'wide')
    return <ellipse cx="50" cy="66" rx="4.5" ry="3" fill={hexBlend('#000', '#fff', 0.85)} opacity="0.12" />;
  if (type === 'narrow')
    return <path d="M50 62 L49 68 L51 68 Z" fill={OUTLINE} opacity="0.2" />;
  if (type === 'upturned')
    return (
      <path
        d="M48 65 Q50 62 52 65 Q50 68 48 65"
        fill="none"
        stroke={OUTLINE}
        strokeWidth="1.6"
        opacity="0.25"
        strokeLinecap="round"
      />
    );
  return <ellipse cx="50" cy="65" rx="3.2" ry="2.8" fill={OUTLINE} opacity="0.14" />;
}

function Mouth({ type, lip, expression }) {
  const resolved = EXPRESSION_MOUTH_MAP[expression] || type || 'smile';
  const stroke = lip || '#E07A7A';
  if (resolved === 'open')
    return (
      <>
        <ellipse cx="50" cy="76" rx="9" ry="7" fill="#3D1515" />
        <ellipse cx="50" cy="74" rx="8" ry="3" fill="#fff" opacity="0.9" />
        <path d="M42 76 Q50 84 58 76" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
      </>
    );
  if (resolved === 'pouty')
    return <ellipse cx="50" cy="77" rx="6" ry="4" fill={stroke} stroke={OUTLINE} strokeWidth="1.4" />;
  if (resolved === 'smirk')
    return (
      <path
        d="M42 76 Q52 80 60 73"
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
      />
    );
  return (
    <path
      d="M40 74 Q50 82 60 74"
      fill="none"
      stroke={stroke}
      strokeWidth="3.2"
      strokeLinecap="round"
    />
  );
}

function HairBack(style, color) {
  const dk = hexAdjust(color, -25);
  switch (style) {
    case 'long_straight':
      return (
        <path
          d="M22 38 Q20 95 28 118 Q50 125 72 118 Q80 95 78 38"
          fill={dk}
          stroke={OUTLINE}
          strokeWidth="1.5"
        />
      );
    case 'curly_big':
      return (
        <path
          d="M18 42 Q12 70 16 100 Q24 120 50 122 Q76 120 84 100 Q88 70 82 42"
          fill={color}
          stroke={OUTLINE}
          strokeWidth="1.5"
        />
      );
    case 'ponytail':
      return (
        <>
          <ellipse cx="50" cy="108" rx="12" ry="22" fill={color} stroke={OUTLINE} strokeWidth="1.4" />
          <circle cx="50" cy="88" r="7" fill={hexAdjust(color, 15)} stroke={OUTLINE} strokeWidth="1.2" />
        </>
      );
    case 'bob':
      return (
        <path
          d="M24 40 Q22 88 30 105 Q50 112 70 105 Q78 88 76 40"
          fill={color}
          stroke={OUTLINE}
          strokeWidth="1.5"
        />
      );
    default:
      return null;
  }
}

function HairFront(style, color) {
  if (style === 'bald') return null;
  const hi = hexAdjust(color, 18);
  const dk = hexAdjust(color, -22);
  const base = `M20 48 Q18 22 50 16 Q82 22 80 48 Q72 28 50 24 Q28 28 20 48 Z`;
  switch (style) {
    case 'afro':
      return (
        <>
          {[32, 42, 50, 58, 68].map((x, i) => (
            <circle key={i} cx={x} cy={22 + (i % 2)} r={11} fill={color} stroke={OUTLINE} strokeWidth="1.2" />
          ))}
        </>
      );
    case 'bun_top':
      return (
        <>
          <path d={base} fill={color} stroke={OUTLINE} strokeWidth="1.8" />
          <circle cx="50" cy="12" r="14" fill={hi} stroke={OUTLINE} strokeWidth="1.8" />
          <circle cx="46" cy="8" r="4" fill="#fff" opacity="0.35" />
        </>
      );
    case 'undercut':
      return (
        <>
          <path d="M20 50 Q22 26 50 20 Q78 26 80 50 L80 38 Q50 32 20 38 Z" fill={dk} />
          <path
            d="M26 44 Q28 24 50 18 Q72 24 74 44 Q68 30 50 26 Q32 30 26 44"
            fill={color}
            stroke={OUTLINE}
            strokeWidth="1.8"
          />
        </>
      );
    case 'medium_wave':
      return (
        <path
          d="M18 50 Q14 30 28 20 Q50 12 72 20 Q86 30 82 50 Q76 34 50 28 Q24 34 18 50"
          fill={color}
          stroke={OUTLINE}
          strokeWidth="1.8"
        />
      );
    case 'curly_big':
      return (
        <path
          d="M16 48 Q10 28 30 18 Q50 10 70 18 Q90 28 84 48 Q78 32 50 26 Q22 32 16 48"
          fill={hi}
          stroke={OUTLINE}
          strokeWidth="1.8"
        />
      );
    case 'long_straight':
    case 'bob':
    case 'ponytail':
      return <path d={base} fill={color} stroke={OUTLINE} strokeWidth="1.8" />;
    default:
      return (
        <path
          d="M22 48 Q20 28 36 20 Q50 15 64 20 Q80 28 78 48 Q72 32 50 28 Q28 32 22 48"
          fill={color}
          stroke={OUTLINE}
          strokeWidth="1.8"
        />
      );
  }
}

function Body({ skin }) {
  const neck = hexBlend(skin, '#000', 0.08);
  return (
    <>
      <path d="M42 88 L38 102 L62 102 L58 88 Z" fill={neck} />
      <ellipse cx="35" cy="100" rx="7" ry="9" fill={skin} stroke={OUTLINE} strokeWidth="1.6" />
      <ellipse cx="65" cy="100" rx="7" ry="9" fill={skin} stroke={OUTLINE} strokeWidth="1.6" />
    </>
  );
}

function Outfit({ style, color }) {
  const hi = hexBlend(color, '#FFFFFF', 0.22);
  const dk = hexBlend(color, '#000000', 0.18);
  const body = `M6 108 Q10 78 50 76 Q90 78 94 108 L100 130 L0 130 Z`;
  const collar = `M38 76 Q50 84 62 76 L60 80 Q50 86 40 80 Z`;

  if (style === 'hoodie') {
    return (
      <>
        <path d={body} fill={color} stroke={OUTLINE} strokeWidth="2" />
        <path d={collar} fill={dk} />
        <path d="M8 95 Q12 108 10 118" stroke={hi} strokeWidth="3" fill="none" opacity="0.4" strokeLinecap="round" />
        <circle cx="50" cy="98" r="2" fill={dk} />
      </>
    );
  }
  if (style === 'blazer' || style === 'suit') {
    return (
      <>
        <path d={body} fill={color} stroke={OUTLINE} strokeWidth="2" />
        <path d="M50 76 L46 108 L54 108 Z" fill={hexBlend(color, '#fff', 0.15)} />
        <path d={collar} fill="#F8F8F8" stroke={OUTLINE} strokeWidth="1" />
        <path d="M44 82 L50 92 L56 82" fill="#fff" stroke={OUTLINE} strokeWidth="1.2" />
      </>
    );
  }
  if (style === 'sport') {
    return (
      <>
        <path d={body} fill={color} stroke={OUTLINE} strokeWidth="2" />
        <path d="M6 108 L14 76 L22 130 Z" fill={hi} opacity="0.5" />
        <path d="M94 108 L86 76 L78 130 Z" fill={hi} opacity="0.5" />
        <circle cx="50" cy="94" r="8" fill={dk} opacity="0.35" />
      </>
    );
  }
  return (
    <>
      <path d={body} fill={color} stroke={OUTLINE} strokeWidth="2" />
      <path d={collar} fill={dk} opacity="0.5" />
      <ellipse cx="38" cy="90" rx="12" ry="6" fill={hi} opacity="0.2" />
    </>
  );
}

function Acc({ type }) {
  switch (type) {
    case 'glasses_round':
      return (
        <>
          <circle cx="35" cy="58" r="10" fill="rgba(200,230,255,0.35)" stroke={OUTLINE} strokeWidth="2.2" />
          <circle cx="65" cy="58" r="10" fill="rgba(200,230,255,0.35)" stroke={OUTLINE} strokeWidth="2.2" />
          <line x1="45" y1="58" x2="55" y2="58" stroke={OUTLINE} strokeWidth="2" />
        </>
      );
    case 'glasses_square':
      return (
        <>
          <rect x="24" y="52" width="22" height="14" rx="3" fill="rgba(200,230,255,0.35)" stroke={OUTLINE} strokeWidth="2.2" />
          <rect x="54" y="52" width="22" height="14" rx="3" fill="rgba(200,230,255,0.35)" stroke={OUTLINE} strokeWidth="2.2" />
          <line x1="46" y1="59" x2="54" y2="59" stroke={OUTLINE} strokeWidth="2" />
        </>
      );
    case 'sunglasses':
      return (
        <>
          <path d="M22 58 Q35 50 48 58 L47 66 Q35 68 23 66 Z" fill="#111" stroke={OUTLINE} strokeWidth="1.8" />
          <path d="M52 58 Q65 50 78 58 L77 66 Q65 68 53 66 Z" fill="#111" stroke={OUTLINE} strokeWidth="1.8" />
          <path d="M48 58 Q50 55 52 58" stroke={OUTLINE} strokeWidth="2" fill="none" />
        </>
      );
    case 'cap':
      return (
        <>
          <path d="M16 32 Q18 14 50 12 Q82 14 84 32 Q72 36 50 37 Q28 36 16 32 Z" fill="#333" stroke={OUTLINE} strokeWidth="1.8" />
          <path d="M12 34 Q50 42 88 34 L90 38 Q50 46 10 38 Z" fill="#222" stroke={OUTLINE} strokeWidth="1.6" />
        </>
      );
    case 'beanie':
      return (
        <>
          <path d="M18 34 Q16 16 50 13 Q84 16 82 34 L80 42 Q50 48 20 42 Z" fill="#7C5CFF" stroke={OUTLINE} strokeWidth="1.8" />
          <circle cx="50" cy="10" r="10" fill="#A78BFA" stroke={OUTLINE} strokeWidth="1.6" />
        </>
      );
    case 'earrings':
      return (
        <>
          <circle cx="20" cy="66" r="4" fill="#FFD54F" stroke={OUTLINE} strokeWidth="1.2" />
          <circle cx="80" cy="66" r="4" fill="#FFD54F" stroke={OUTLINE} strokeWidth="1.2" />
        </>
      );
    case 'headband':
      return (
        <path d="M18 34 Q50 42 82 34 L82 40 Q50 48 18 40 Z" fill="#FF6B8A" stroke={OUTLINE} strokeWidth="1.6" />
      );
    default:
      return null;
  }
}

export function AvatarSVG({ config, size = 100, expression }) {
  const uid = `bm${useId().replace(/:/g, '_')}`;
  const c = config || {};
  const bg = c.bg || '#5AC8FA';
  const skin = c.skinColor || '#FFCC9A';
  const hairStyle = c.hair?.style || 'short_clean';
  const hairColor = c.hair?.color || '#2C1810';
  const expr = expression || c.expression || 'neutral';
  const mouthType = EXPRESSION_MOUTH_MAP[expr] || c.mouth?.type || 'smile';
  const isLong = LONG_HAIR.includes(hairStyle);

  return (
    <svg width={size} height={size} viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}_skin`} x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor={hexBlend(skin, '#fff', 0.2)} />
          <stop offset="100%" stopColor={hexBlend(skin, '#000', 0.08)} />
        </linearGradient>
        <radialGradient id={`${uid}_blush`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF8A9A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FF8A9A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}_bg`} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor={hexBlend(bg, '#fff', 0.15)} />
          <stop offset="100%" stopColor={bg} />
        </radialGradient>
      </defs>

      <rect width="100" height="130" fill={`url(#${uid}_bg)`} rx="8" />

      {isLong && <HairBack style={hairStyle} color={hairColor} />}

      <Body skin={skin} />
      <Outfit style={c.outfit?.style || 'tshirt'} color={c.outfit?.color || '#5AC8FA'} />

      <Face skin={skin} faceShape={c.faceShape || 'oval'} uid={uid} />

      <Brow cx={35} cy={46} type={c.eyebrows?.type || 'natural'} />
      <Brow cx={65} cy={46} type={c.eyebrows?.type || 'natural'} />
      <Eye cx={35} cy={58} type={c.eyes?.type || 'round'} color={c.eyes?.color || '#4A3728'} />
      <Eye cx={65} cy={58} type={c.eyes?.type || 'round'} color={c.eyes?.color || '#4A3728'} />

      <Nose type={c.nose?.type || 'button'} />
      <Mouth type={mouthType} lip={c.mouth?.lipColor} expression={expr} />

      <HairFront style={hairStyle} color={hairColor} />

      <Acc type={c.accessory} />
    </svg>
  );
}
