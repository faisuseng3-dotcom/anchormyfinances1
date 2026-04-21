import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Scissors, Eye, Shirt, Glasses, Palette } from 'lucide-react';

// ─── DATA ──────────────────────────────────────────────────────────────────

const SKINS = [
  '#FDDBB4', '#F5C89A', '#E8A87C', '#D4874E', '#C47A3A', '#A0611A',
  '#8B4E1A', '#6B3410', '#FFE0BD', '#FFDBAC', '#F1C27D', '#CEAD87',
];

const FACE_SHAPES = ['round', 'oval', 'square', 'heart'];

const HAIR_STYLES = [
  { id: 'short_clean', label: 'Kort' },
  { id: 'medium_wave', label: 'Vågigt' },
  { id: 'long_straight', label: 'Rakt långt' },
  { id: 'curly_big', label: 'Lockigt' },
  { id: 'bun_top', label: 'Toppknut' },
  { id: 'undercut', label: 'Undercut' },
  { id: 'afro', label: 'Afro' },
  { id: 'bald', label: 'Skallig' },
  { id: 'ponytail', label: 'Hästsvans' },
  { id: 'bob', label: 'Bob' },
];

const HAIR_COLORS = [
  '#1C1008', '#3D2B1F', '#6B3A2A', '#8B4513', '#A0522D',
  '#C8860A', '#D4A017', '#F5DEB3', '#E8D5B7', '#FF6B6B',
  '#FF4499', '#A78BFA', '#60A5FA', '#34D399', '#F97316',
];

const EYE_SHAPES = [
  { id: 'almond', label: 'Mandel' },
  { id: 'round_big', label: 'Runda' },
  { id: 'cat_eye', label: 'Katt' },
  { id: 'hooded', label: 'Drömiga' },
  { id: 'wide', label: 'Vida' },
];

const EYE_COLORS = ['#1a1a1a', '#3B2314', '#4A7C59', '#2E86AB', '#7B68EE', '#8B4513'];

const EYEBROW_SHAPES = ['natural', 'arched', 'thick', 'thin'];
const EYELASH_STYLES = ['none', 'natural', 'dramatic'];

const NOSE_SHAPES = ['button', 'wide', 'narrow', 'upturned'];
const MOUTH_SHAPES = ['smile', 'smirk', 'open', 'pouty'];
const LIP_COLORS = ['#C48A8A', '#E57373', '#E91E63', '#9C27B0', '#FF7043', '#F06292', '#AD1457', '#B71C1C', '#8B4513'];

const CLOTHES = [
  { id: 'tshirt', label: 'T-shirt' },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'blazer', label: 'Blazer' },
  { id: 'suit', label: 'Kostym' },
  { id: 'turtleneck', label: 'Polotröja' },
  { id: 'bomber', label: 'Bomber jacket' },
  { id: 'denim', label: 'Denim' },
  { id: 'sport', label: 'Sport' },
];

const CLOTHES_COLORS = [
  '#0D7377', '#4B7CF3', '#E53E3E', '#D69E2E', '#A78BFA',
  '#0FDEBD', '#1a1a2e', '#2D3748', '#F6AD55', '#68D391',
  '#FC8181', '#4299E1', '#ED64A6', '#ECC94B', '#48BB78',
];

const ACCESSORIES = [
  { id: 'none', label: 'Ingen' },
  { id: 'glasses_round', label: 'Runda glasögon' },
  { id: 'glasses_square', label: 'Fyrkantiga' },
  { id: 'sunglasses', label: 'Solglasögon' },
  { id: 'cap', label: 'Keps' },
  { id: 'beanie', label: 'Mössa' },
  { id: 'earrings', label: 'Örhängen' },
  { id: 'headband', label: 'Pannband' },
];

const BG_COLORS = [
  '#0D7377', '#4B7CF3', '#A78BFA', '#F6AD55', '#FC8181',
  '#0FDEBD', '#1a1a2e', '#2D3748', '#F687B3', '#68D391',
];

const DEFAULT_STYLE = {
  skin: SKINS[0], faceShape: 'round',
  hair: 'short_clean', hairColor: HAIR_COLORS[0],
  eyeShape: 'almond', eyeColor: EYE_COLORS[0],
  eyebrow: 'natural', eyelash: 'natural',
  nose: 'button', mouth: 'smile', lipColor: LIP_COLORS[0],
  clothes: 'tshirt', clothesColor: CLOTHES_COLORS[0],
  accessory: 'none',
  bg: BG_COLORS[0],
};

// ─── SVG LAYERS ────────────────────────────────────────────────────────────

function HairLayer({ style, id }) {
  const hc = style.hairColor || '#1C1008';
  const paths = {
    short_clean: (
      <>
        <ellipse cx="50" cy="28" rx="28" ry="16" fill={hc} />
        <rect x="22" y="28" width="10" height="8" rx="5" fill={hc} />
        <rect x="68" y="28" width="10" height="8" rx="5" fill={hc} />
      </>
    ),
    medium_wave: (
      <>
        <ellipse cx="50" cy="26" rx="30" ry="18" fill={hc} />
        <path d="M20 32 Q18 50 22 65 Q24 70 26 65 Q24 55 26 42" fill={hc} />
        <path d="M80 32 Q82 50 78 65 Q76 70 74 65 Q76 55 74 42" fill={hc} />
      </>
    ),
    long_straight: (
      <>
        <ellipse cx="50" cy="26" rx="30" ry="18" fill={hc} />
        <rect x="20" y="30" width="11" height="50" rx="5" fill={hc} />
        <rect x="69" y="30" width="11" height="50" rx="5" fill={hc} />
      </>
    ),
    curly_big: (
      <>
        <ellipse cx="50" cy="22" rx="34" ry="20" fill={hc} />
        <circle cx="22" cy="30" r="8" fill={hc} />
        <circle cx="78" cy="30" r="8" fill={hc} />
        <circle cx="18" cy="45" r="6" fill={hc} />
        <circle cx="82" cy="45" r="6" fill={hc} />
      </>
    ),
    bun_top: (
      <>
        <rect x="24" y="30" width="52" height="14" rx="7" fill={hc} />
        <circle cx="50" cy="20" r="12" fill={hc} />
      </>
    ),
    undercut: (
      <>
        <rect x="24" y="24" width="52" height="12" rx="6" fill={hc} />
        <rect x="26" y="24" width="48" height="20" rx="6" fill={hc} />
      </>
    ),
    afro: (
      <>
        <ellipse cx="50" cy="22" rx="36" ry="26" fill={hc} />
        <ellipse cx="22" cy="36" rx="12" ry="14" fill={hc} />
        <ellipse cx="78" cy="36" rx="12" ry="14" fill={hc} />
      </>
    ),
    bald: null,
    ponytail: (
      <>
        <rect x="24" y="24" width="52" height="18" rx="8" fill={hc} />
        <rect x="68" y="28" width="10" height="30" rx="5" fill={hc} />
        <ellipse cx="73" cy="60" rx="7" ry="5" fill={hc} />
      </>
    ),
    bob: (
      <>
        <rect x="22" y="24" width="56" height="16" rx="8" fill={hc} />
        <rect x="20" y="28" width="12" height="28" rx="6" fill={hc} />
        <rect x="68" y="28" width="12" height="28" rx="6" fill={hc} />
      </>
    ),
  };
  return paths[style.hair] || null;
}

function EyesLayer({ style }) {
  const ec = style.eyeColor || '#1a1a1a';
  const shape = style.eyeShape || 'almond';
  const lash = style.eyelash || 'natural';

  const leftEye = { x: 37, y: 55 };
  const rightEye = { x: 63, y: 55 };

  const eyeShapes = {
    almond: (x, y) => <ellipse cx={x} cy={y} rx="5.5" ry="4" fill={ec} />,
    round_big: (x, y) => <circle cx={x} cy={y} r="5.5" fill={ec} />,
    cat_eye: (x, y) => <ellipse cx={x} cy={y} rx="6" ry="3.5" fill={ec} style={{ transform: `rotate(-8deg)`, transformOrigin: `${x}px ${y}px` }} />,
    hooded: (x, y) => <ellipse cx={x} cy={y} rx="5" ry="3.5" fill={ec} />,
    wide: (x, y) => <ellipse cx={x} cy={y} rx="7" ry="4" fill={ec} />,
  };

  const lashLines = (x, y, dir) => {
    if (lash === 'none') return null;
    const flip = dir === 'left' ? -1 : 1;
    if (lash === 'natural') return (
      <>
        <line x1={x - 3} y1={y - 4} x2={x - 5} y2={y - 8} stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" />
        <line x1={x} y1={y - 5} x2={x} y2={y - 9} stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" />
        <line x1={x + 3} y1={y - 4} x2={x + 5} y2={y - 8} stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" />
      </>
    );
    return (
      <>
        <line x1={x - 5} y1={y - 4} x2={x - 8} y2={y - 9} stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
        <line x1={x - 2} y1={y - 5} x2={x - 3} y2={y - 10} stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
        <line x1={x + 1} y1={y - 5} x2={x + 1} y2={y - 10} stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
        <line x1={x + 4} y1={y - 4} x2={x + 6} y2={y - 9} stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
      </>
    );
  };

  // Eyebrows
  const brows = {
    natural: (x, y) => <path d={`M${x - 6} ${y - 10} Q${x} ${y - 14} ${x + 6} ${y - 10}`} stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />,
    arched: (x, y) => <path d={`M${x - 6} ${y - 10} Q${x + 2} ${y - 17} ${x + 6} ${y - 12}`} stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />,
    thick: (x, y) => <path d={`M${x - 6} ${y - 10} Q${x} ${y - 14} ${x + 6} ${y - 10}`} stroke="#1a1a1a" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    thin: (x, y) => <path d={`M${x - 6} ${y - 10} Q${x} ${y - 14} ${x + 6} ${y - 10}`} stroke="#1a1a1a" strokeWidth="1" fill="none" strokeLinecap="round" />,
  };

  const browFn = brows[style.eyebrow] || brows.natural;
  const eyeFn = eyeShapes[shape] || eyeShapes.almond;

  return (
    <>
      {browFn(leftEye.x, leftEye.y)}
      {browFn(rightEye.x, rightEye.y)}
      {eyeFn(leftEye.x, leftEye.y)}
      {eyeFn(rightEye.x, rightEye.y)}
      {/* Pupils + highlights */}
      <circle cx={leftEye.x} cy={leftEye.y} r="2.5" fill="white" />
      <circle cx={leftEye.x + 1} cy={leftEye.y - 1} r="1.2" fill={ec} />
      <circle cx={leftEye.x + 1.5} cy={leftEye.y - 1.5} r="0.6" fill="white" opacity="0.9" />
      <circle cx={rightEye.x} cy={rightEye.y} r="2.5" fill="white" />
      <circle cx={rightEye.x + 1} cy={rightEye.y - 1} r="1.2" fill={ec} />
      <circle cx={rightEye.x + 1.5} cy={rightEye.y - 1.5} r="0.6" fill="white" opacity="0.9" />
      {lashLines(leftEye.x, leftEye.y, 'left')}
      {lashLines(rightEye.x, rightEye.y, 'right')}
    </>
  );
}

function NoseLayer({ style }) {
  const nose = style.nose || 'button';
  const skin = style.skin || '#FDDBB4';
  const shad = 'rgba(0,0,0,0.12)';
  const noses = {
    button: <ellipse cx="50" cy="68" rx="4" ry="3" fill={shad} />,
    wide: <><ellipse cx="44" cy="68" rx="3.5" ry="2.5" fill={shad} /><ellipse cx="56" cy="68" rx="3.5" ry="2.5" fill={shad} /></>,
    narrow: <ellipse cx="50" cy="68" rx="2.5" ry="4" fill={shad} />,
    upturned: <path d="M46 71 Q50 65 54 71" stroke={shad} strokeWidth="2" fill="none" strokeLinecap="round" />,
  };
  return noses[nose] || noses.button;
}

function MouthLayer({ style }) {
  const lc = style.lipColor || '#C48A8A';
  const mouth = style.mouth || 'smile';
  const mouths = {
    smile: (
      <>
        <path d="M38 76 Q50 84 62 76" stroke={lc} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M38 76 Q50 83 62 76" stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />
      </>
    ),
    smirk: (
      <path d="M38 77 Q46 82 60 75" stroke={lc} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    ),
    open: (
      <>
        <path d="M39 76 Q50 85 61 76" stroke={lc} strokeWidth="2.5" fill={lc} opacity="0.7" strokeLinecap="round" />
        <ellipse cx="50" cy="80" rx="10" ry="5" fill="#1a1a1a" opacity="0.8" />
        <ellipse cx="50" cy="79" rx="9" ry="3.5" fill="white" opacity="0.9" />
      </>
    ),
    pouty: (
      <>
        <path d="M39 74 Q44 79 50 74 Q56 79 61 74" fill={lc} opacity="0.9" />
        <path d="M39 74 Q50 82 61 74" stroke={lc} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    ),
  };
  return mouths[mouth] || mouths.smile;
}

function ClothesLayer({ style }) {
  const cc = style.clothesColor || '#0D7377';
  const clothes = style.clothes || 'tshirt';
  const c = {
    tshirt: <path d="M16 90 Q18 72 50 70 Q82 72 84 90 L100 120 L0 120 Z" fill={cc} />,
    hoodie: (
      <>
        <path d="M14 90 Q16 70 50 68 Q84 70 86 90 L100 120 L0 120 Z" fill={cc} />
        <path d="M34 68 Q42 60 50 68 Q58 60 66 68 L63 80 Q50 74 37 80 Z" fill={cc} style={{ filter: 'brightness(0.85)' }} />
        <rect x="41" y="68" width="18" height="4" rx="2" fill="rgba(0,0,0,0.15)" />
      </>
    ),
    blazer: (
      <>
        <path d="M14 90 Q16 70 50 68 Q84 70 86 90 L100 120 L0 120 Z" fill={cc} />
        <path d="M42 68 L38 90 L50 82 L62 90 L58 68 L50 74 Z" fill="white" opacity="0.85" />
        <path d="M42 68 L50 74 L58 68" stroke={cc} style={{ filter: 'brightness(0.7)' }} strokeWidth="1" fill="none" />
      </>
    ),
    suit: (
      <>
        <path d="M14 90 Q16 70 50 68 Q84 70 86 90 L100 120 L0 120 Z" fill={cc} />
        <path d="M42 68 L40 120 L50 112 L60 120 L58 68 L50 74 Z" fill="white" opacity="0.9" />
        <path d="M45 76 L48 82 M52 82 L55 76" stroke={cc} strokeWidth="1" opacity="0.5" />
      </>
    ),
    turtleneck: (
      <>
        <path d="M16 90 Q18 72 50 70 Q82 72 84 90 L100 120 L0 120 Z" fill={cc} />
        <rect x="36" y="64" width="28" height="14" rx="8" fill={cc} style={{ filter: 'brightness(1.1)' }} />
      </>
    ),
    bomber: (
      <>
        <path d="M12 90 Q14 68 50 66 Q86 68 88 90 L100 120 L0 120 Z" fill={cc} />
        <rect x="14" y="88" width="72" height="6" rx="3" fill="rgba(255,255,255,0.2)" />
        <rect x="12" y="68" width="10" height="20" rx="4" fill={cc} style={{ filter: 'brightness(0.9)' }} />
        <rect x="78" y="68" width="10" height="20" rx="4" fill={cc} style={{ filter: 'brightness(0.9)' }} />
      </>
    ),
    denim: (
      <>
        <path d="M16 90 Q18 72 50 70 Q82 72 84 90 L100 120 L0 120 Z" fill={cc} />
        <line x1="50" y1="70" x2="50" y2="120" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <line x1="20" y1="82" x2="80" y2="82" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      </>
    ),
    sport: (
      <>
        <path d="M14 90 Q16 70 50 68 Q84 70 86 90 L100 120 L0 120 Z" fill={cc} />
        <path d="M50 68 L50 120" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
        <path d="M34 68 Q50 64 66 68" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
      </>
    ),
  };
  return c[clothes] || c.tshirt;
}

function AccessoryLayer({ style }) {
  const acc = style.accessory || 'none';
  if (acc === 'none') return null;
  const a = {
    glasses_round: (
      <>
        <circle cx="37" cy="55" r="8" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.7" />
        <circle cx="63" cy="55" r="8" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.7" />
        <line x1="45" y1="55" x2="55" y2="55" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.7" />
        <line x1="22" y1="53" x2="29" y2="55" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.7" />
        <line x1="78" y1="53" x2="71" y2="55" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.7" />
      </>
    ),
    glasses_square: (
      <>
        <rect x="28" y="50" width="18" height="12" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.7" />
        <rect x="54" y="50" width="18" height="12" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.7" />
        <line x1="46" y1="55" x2="54" y2="55" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.7" />
        <line x1="22" y1="53" x2="28" y2="55" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.7" />
        <line x1="78" y1="53" x2="72" y2="55" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.7" />
      </>
    ),
    sunglasses: (
      <>
        <rect x="27" y="50" width="20" height="11" rx="5" fill="#1a1a1a" opacity="0.85" />
        <rect x="53" y="50" width="20" height="11" rx="5" fill="#1a1a1a" opacity="0.85" />
        <line x1="47" y1="55" x2="53" y2="55" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="22" y1="52" x2="27" y2="55" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="78" y1="52" x2="73" y2="55" stroke="#1a1a1a" strokeWidth="2" />
      </>
    ),
    cap: (
      <>
        <ellipse cx="50" cy="30" rx="30" ry="10" fill="#1a1a1a" opacity="0.9" />
        <rect x="20" y="20" width="60" height="14" rx="7" fill="#2D2D2D" />
        <ellipse cx="50" cy="34" rx="32" ry="5" fill="#1a1a1a" opacity="0.7" />
      </>
    ),
    beanie: (
      <>
        <rect x="22" y="20" width="56" height="22" rx="10" fill="#A78BFA" />
        <ellipse cx="50" cy="20" r="10" fill="#A78BFA" style={{ filter: 'brightness(1.1)' }} />
        <rect x="20" y="36" width="60" height="8" rx="4" fill="#C4B5FD" opacity="0.6" />
      </>
    ),
    earrings: (
      <>
        <circle cx="19" cy="60" r="3" fill="#F6AD55" />
        <circle cx="81" cy="60" r="3" fill="#F6AD55" />
      </>
    ),
    headband: (
      <rect x="20" y="32" width="60" height="8" rx="4" fill="#FC8181" opacity="0.9" />
    ),
  };
  return a[acc] || null;
}

export function AvatarSVG({ style, size = 96 }) {
  const s = style || {};
  const skin = s.skin || '#FDDBB4';
  const bg = s.bg || '#0D7377';
  const faceRx = s.faceShape === 'square' ? 14 : s.faceShape === 'heart' ? 18 : s.faceShape === 'oval' ? 16 : 18;

  return (
    <svg width={size} height={size} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <defs>
        <radialGradient id={`bg_${size}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={bg} stopOpacity="0.4" />
          <stop offset="100%" stopColor={bg} stopOpacity="0.1" />
        </radialGradient>
        <filter id={`shadow_${size}`}>
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#bg_${size})`} />

      {/* Hair back */}
      <HairLayer style={s} />

      {/* Neck */}
      <rect x="44" y="80" width="12" height="14" rx="5" fill={skin} />

      {/* Face */}
      <ellipse cx="50" cy="55" rx="24" ry={faceRx + 6} fill={skin} style={{ filter: `url(#shadow_${size})` }} />
      {/* Face shading */}
      <ellipse cx="50" cy="55" rx="24" ry={faceRx + 6} fill="rgba(0,0,0,0)" />
      <ellipse cx="33" cy="60" rx="6" ry="8" fill="rgba(255,150,100,0.1)" />
      <ellipse cx="67" cy="60" rx="6" ry="8" fill="rgba(255,150,100,0.1)" />

      {/* Ears */}
      <ellipse cx="26" cy="55" rx="4" ry="6" fill={skin} />
      <ellipse cx="74" cy="55" rx="4" ry="6" fill={skin} />
      <ellipse cx="26" cy="55" rx="2" ry="4" fill="rgba(0,0,0,0.06)" />
      <ellipse cx="74" cy="55" rx="2" ry="4" fill="rgba(0,0,0,0.06)" />

      {/* Eyes */}
      <EyesLayer style={s} />

      {/* Nose */}
      <NoseLayer style={s} />

      {/* Mouth */}
      <MouthLayer style={s} />

      {/* Cheek blush */}
      <ellipse cx="31" cy="64" rx="6" ry="3.5" fill="rgba(255,140,120,0.18)" />
      <ellipse cx="69" cy="64" rx="6" ry="3.5" fill="rgba(255,140,120,0.18)" />

      {/* Accessory */}
      <AccessoryLayer style={s} />

      {/* Clothes */}
      <ClothesLayer style={s} />
    </svg>
  );
}

// ─── CATEGORY CONFIG ────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'face',
    label: 'Ansikte',
    Icon: Smile,
    sections: [
      { key: 'skin', label: 'Hudton', type: 'color', options: SKINS },
      { key: 'faceShape', label: 'Ansiktsform', type: 'text', options: FACE_SHAPES, labels: { round: 'Rund', oval: 'Oval', square: 'Fyrkantig', heart: 'Hjärtformad' } },
    ],
  },
  {
    id: 'hair',
    label: 'Hår',
    Icon: Scissors,
    sections: [
      { key: 'hair', label: 'Frisyr', type: 'avatar_preview', options: HAIR_STYLES },
      { key: 'hairColor', label: 'Hårfärg', type: 'color', options: HAIR_COLORS },
    ],
  },
  {
    id: 'eyes',
    label: 'Ögon',
    Icon: Eye,
    sections: [
      { key: 'eyeShape', label: 'Form', type: 'text', options: EYE_SHAPES.map(e => e.id), labels: Object.fromEntries(EYE_SHAPES.map(e => [e.id, e.label])) },
      { key: 'eyeColor', label: 'Ögonfärg', type: 'color', options: EYE_COLORS },
      { key: 'eyebrow', label: 'Ögonbryn', type: 'text', options: EYEBROW_SHAPES, labels: { natural: 'Naturliga', arched: 'Bågiga', thick: 'Tjocka', thin: 'Tunna' } },
      { key: 'eyelash', label: 'Fransar', type: 'text', options: EYELASH_STYLES, labels: { none: 'Inga', natural: 'Naturliga', dramatic: 'Dramatiska' } },
    ],
  },
  {
    id: 'face_features',
    label: 'Näsa & Mun',
    Icon: Palette,
    sections: [
      { key: 'nose', label: 'Näsa', type: 'text', options: NOSE_SHAPES, labels: { button: 'Knappnäsa', wide: 'Bred', narrow: 'Smal', upturned: 'Uppåt' } },
      { key: 'mouth', label: 'Mun', type: 'text', options: MOUTH_SHAPES, labels: { smile: 'Leende', smirk: 'Smirk', open: 'Öppen', pouty: 'Pouty' } },
      { key: 'lipColor', label: 'Läppfärg', type: 'color', options: LIP_COLORS },
    ],
  },
  {
    id: 'clothes',
    label: 'Kläder',
    Icon: Shirt,
    sections: [
      { key: 'clothes', label: 'Stil', type: 'avatar_preview', options: CLOTHES },
      { key: 'clothesColor', label: 'Färg', type: 'color', options: CLOTHES_COLORS },
    ],
  },
  {
    id: 'accessories',
    label: 'Tillbehör',
    Icon: Glasses,
    sections: [
      { key: 'accessory', label: 'Accessoar', type: 'text', options: ACCESSORIES.map(a => a.id), labels: Object.fromEntries(ACCESSORIES.map(a => [a.id, a.label])) },
      { key: 'bg', label: 'Bakgrund', type: 'color', options: BG_COLORS },
    ],
  },
];

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function AvatarBuilder({ value, onChange }) {
  const [style, setStyle] = useState({ ...DEFAULT_STYLE, ...(value || {}) });
  const [activeCategory, setActiveCategory] = useState('face');
  const catScrollRef = useRef(null);

  const update = (key, val) => {
    const next = { ...style, [key]: val };
    setStyle(next);
    onChange?.(next);
  };

  const currentCat = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="flex flex-col gap-0 select-none" style={{ background: 'var(--color-background-primary)' }}>
      {/* ── LIVE PREVIEW ── */}
      <div className="flex flex-col items-center justify-center pt-6 pb-4"
        style={{ background: `radial-gradient(ellipse at 50% 100%, ${style.bg}18 0%, transparent 70%)` }}>
        <motion.div
          layout
          key={style.hair + style.clothes + style.skin}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="relative"
        >
          <div className="w-36 h-36 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${style.bg}30 0%, ${style.bg}10 100%)`,
              boxShadow: `0 8px 32px ${style.bg}30, 0 0 0 2px ${style.bg}40`,
            }}>
            <AvatarSVG style={style} size={140} />
          </div>
          {/* Floating sparkle */}
          <motion.div
            animate={{ y: [-4, 4, -4], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1 -right-1 text-lg"
          >✨</motion.div>
        </motion.div>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div className="px-2 pb-1">
        <div ref={catScrollRef}
          className="flex gap-2 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => {
            const active = cat.id === activeCategory;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveCategory(cat.id)}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl flex-shrink-0 transition-all"
                style={{
                  background: active ? `${style.bg}20` : 'var(--color-surface)',
                  border: active ? `1.5px solid ${style.bg}60` : '1.5px solid transparent',
                  minWidth: 64,
                }}
              >
                <cat.Icon
                  className="w-4 h-4"
                  style={{ color: active ? style.bg : 'var(--color-text-muted)' }}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className="text-[10px] font-bold whitespace-nowrap"
                  style={{ color: active ? style.bg : 'var(--color-text-muted)' }}>
                  {cat.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── SECTIONS ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
          className="px-3 pb-4 space-y-5"
        >
          {currentCat?.sections.map(section => (
            <div key={section.key}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3"
                style={{ color: 'var(--color-text-muted)' }}>
                {section.label}
              </p>

              {section.type === 'color' && (
                <div className="flex flex-wrap gap-2.5">
                  {section.options.map(opt => {
                    const active = style[section.key] === opt;
                    return (
                      <motion.button
                        key={opt}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => update(section.key, opt)}
                        className="relative flex-shrink-0"
                        style={{ width: 32, height: 32 }}
                      >
                        <div
                          className="w-8 h-8 rounded-full transition-all"
                          style={{
                            background: opt,
                            boxShadow: active
                              ? `0 0 0 2px white, 0 0 0 4px ${opt}, 0 4px 12px ${opt}80`
                              : '0 2px 6px rgba(0,0,0,0.2)',
                            transform: active ? 'scale(1.18)' : 'scale(1)',
                          }}
                        />
                        {active && (
                          <motion.div
                            layoutId={`check_${section.key}`}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="w-2 h-2 rounded-full bg-white opacity-90" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {section.type === 'text' && (
                <div className="flex flex-wrap gap-2">
                  {section.options.map(opt => {
                    const active = style[section.key] === opt;
                    const label = section.labels?.[opt] || opt;
                    return (
                      <motion.button
                        key={opt}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => update(section.key, opt)}
                        className="px-3.5 py-2 rounded-2xl text-xs font-bold transition-all"
                        style={{
                          background: active ? style.bg : 'var(--color-surface)',
                          color: active ? 'white' : 'var(--color-text-secondary)',
                          boxShadow: active ? `0 4px 14px ${style.bg}50` : 'none',
                          border: active ? 'none' : '1px solid rgba(0,0,0,0.07)',
                        }}
                      >
                        {label}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {section.type === 'avatar_preview' && (
                <div className="grid grid-cols-4 gap-2">
                  {section.options.map((opt) => {
                    const id = typeof opt === 'object' ? opt.id : opt;
                    const label = typeof opt === 'object' ? opt.label : opt;
                    const active = style[section.key] === id;
                    const previewStyle = { ...style, [section.key]: id };
                    return (
                      <motion.button
                        key={id}
                        whileTap={{ scale: 0.88 }}
                        onClick={() => update(section.key, id)}
                        className="flex flex-col items-center gap-1 p-2 rounded-2xl transition-all"
                        style={{
                          background: active ? `${style.bg}18` : 'var(--color-surface)',
                          border: active ? `1.5px solid ${style.bg}70` : '1.5px solid transparent',
                          boxShadow: active ? `0 4px 14px ${style.bg}30` : 'none',
                        }}
                      >
                        <AvatarSVG style={previewStyle} size={52} />
                        <span className="text-[9px] font-bold text-center leading-tight"
                          style={{ color: active ? style.bg : 'var(--color-text-muted)' }}>
                          {label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}