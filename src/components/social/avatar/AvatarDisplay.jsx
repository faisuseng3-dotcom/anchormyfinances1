// AvatarDisplay — Pixar-esque 3D rendering via SVG filters + correct Z-order

import React from 'react';
import { motion } from 'framer-motion';
import { HAIR_LONG_STYLES } from './AvatarConfig';
import {
  HairBack, BodyLayer, OutfitLayer, FaceLayer, EyeLayer,
  NoseLayer, CheeksLayer, MouthLayer, HairFront, AccessoryLayer,
} from './AvatarLayers';

const SPRING = { type: 'spring', stiffness: 340, damping: 26 };

// ─── Core SVG: Pixar-esque with SSS + 3-point lighting ──────────────────────
export function AvatarSVG({ config, size = 100, expression }) {
  const c = config || {};
  const bg = c.bg || '#0D7377';
  const skinColor = c.skinColor || '#FFDBAC';
  const isLong = HAIR_LONG_STYLES.includes(c.hair?.style);
  const expr = expression || c.expression || 'neutral';
  const uid = `av${size}${bg.replace(/[^a-z0-9]/gi, '')}`;

  // Subsurface scattering: warm translucent tint based on skin color
  const sssColor = blendHex(skinColor, '#FF8866', 0.18);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 124"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* ── BG gradient ── */}
        <radialGradient id={`${uid}bg`} cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor={bg} stopOpacity="0.28" />
          <stop offset="100%" stopColor={bg} stopOpacity="0.05" />
        </radialGradient>

        {/* ── 3-point lighting: key light (warm, upper-left) ── */}
        <radialGradient id={`${uid}key`} cx="30%" cy="20%" r="75%">
          <stop offset="0%" stopColor="#FFF5E0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFF5E0" stopOpacity="0" />
        </radialGradient>

        {/* ── Fill light (cool, right) ── */}
        <radialGradient id={`${uid}fill`} cx="80%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#C8E0FF" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#C8E0FF" stopOpacity="0" />
        </radialGradient>

        {/* ── Rim light (bright edge, upper-back) ── */}
        <radialGradient id={`${uid}rim`} cx="50%" cy="5%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.55" />
          <stop offset="50%" stopColor="white" stopOpacity="0.12" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        {/* ── Subsurface scattering (SSS) — warm glow through ears/edges ── */}
        <radialGradient id={`${uid}sss`} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor={sssColor} stopOpacity="0" />
          <stop offset="100%" stopColor={sssColor} stopOpacity="0.35" />
        </radialGradient>

        {/* ── Bloom filter (soft glow on bright areas) ── */}
        <filter id={`${uid}bloom`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* ── Soft shadow filter ── */}
        <filter id={`${uid}shadow`} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.35)" />
        </filter>

        {/* ── Eye specular (crisp gloss) ── */}
        <radialGradient id={`${uid}eyeSpec`} cx="60%" cy="30%" r="55%">
          <stop offset="0%" stopColor="white" stopOpacity="0.95" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        {/* ── Hair shine ── */}
        <linearGradient id={`${uid}hairShine`} x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.22" />
          <stop offset="40%" stopColor="white" stopOpacity="0.05" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* BG aura */}
      <circle cx="50" cy="62" r="58" fill={`url(#${uid}bg)`} />

      {/* ── LAYER STACK ── */}

      {/* L0: Back hair */}
      {isLong && <HairBack style={c.hair?.style} color={c.hair?.color} />}

      {/* L1: Body (neck, ears, shoulders) */}
      <BodyLayer skinColor={skinColor} />

      {/* SSS on ears */}
      <ellipse cx="27" cy="56" rx="5" ry="7" fill={`url(#${uid}sss)`} />
      <ellipse cx="73" cy="56" rx="5" ry="7" fill={`url(#${uid}sss)`} />

      {/* L2: Outfit */}
      <OutfitLayer outfitConfig={c.outfit} />

      {/* L3: Face */}
      <FaceLayer skinColor={skinColor} faceShape={c.faceShape} />

      {/* SSS on face edges */}
      <ellipse cx="50" cy="54" rx="24" ry="27" fill={`url(#${uid}sss)`} />

      {/* Key light on face */}
      <ellipse cx="38" cy="42" rx="22" ry="18" fill={`url(#${uid}key)`} />

      {/* L4: Eyes + brows */}
      <EyeLayer eyeConfig={c.eyes} eyebrowConfig={c.eyebrows} eyelashConfig={c.eyelashes} />

      {/* Eye specular gloss overlay */}
      <ellipse cx="36" cy="53" rx="7" ry="5" fill={`url(#${uid}eyeSpec)`} opacity="0.35" />
      <ellipse cx="64" cy="53" rx="7" ry="5" fill={`url(#${uid}eyeSpec)`} opacity="0.35" />

      {/* L5: Nose */}
      <NoseLayer noseConfig={c.nose} />

      {/* L6: Cheeks */}
      <CheeksLayer expression={expr} />

      {/* L7: Mouth */}
      <MouthLayer mouthConfig={c.mouth} expression={expr} />

      {/* L8: Front hair */}
      <HairFront style={c.hair?.style} color={c.hair?.color} />

      {/* Hair shine overlay */}
      {c.hair?.style !== 'bald' && (
        <ellipse cx="44" cy="22" rx="18" ry="8" fill={`url(#${uid}hairShine)`} />
      )}

      {/* L9: Accessories */}
      <AccessoryLayer accessory={c.accessory} />

      {/* Rim light — top edge glow */}
      <ellipse cx="50" cy="20" rx="38" ry="18" fill={`url(#${uid}rim)`} />

      {/* Fill light (right-side cool bounce) */}
      <circle cx="78" cy="50" r="40" fill={`url(#${uid}fill)`} />
    </svg>
  );
}

// ─── Animated builder preview ─────────────────────────────────────────────
export default function AvatarDisplay({ config, size = 170, expression }) {
  const bg = config?.bg || '#0D7377';
  const animKey = [
    config?.hair?.style, config?.hair?.color,
    config?.outfit?.style, config?.outfit?.color,
    config?.skinColor, config?.faceShape,
    config?.accessory, config?.eyes?.type,
  ].join('|');

  return (
    <div
      className="flex items-center justify-center relative"
      style={{ minHeight: size + 16 }}
    >
      {/* Outer glow ring — matches bg color */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size + 48,
          height: size + 48,
          background: `radial-gradient(circle, ${bg}22 0%, transparent 68%)`,
          boxShadow: `0 0 60px ${bg}40, 0 0 120px ${bg}18`,
        }}
      />

      <motion.div
        key={animKey}
        initial={{ scale: 0.82, opacity: 0, y: 6 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={SPRING}
        className="relative z-10"
      >
        {/* Avatar circle */}
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: size,
            height: size,
            background: `radial-gradient(circle at 38% 32%, ${bg}30 0%, ${bg}0a 100%)`,
            boxShadow: `0 16px 48px ${bg}40, 0 0 0 1.5px ${bg}55`,
          }}
        >
          <AvatarSVG config={config} size={Math.round(size * 0.9)} expression={expression} />
        </div>

        {/* Floating sparkle */}
        <motion.span
          animate={{ y: [-3, 4, -3], rotate: [0, 14, -10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-2 -right-1 text-lg select-none pointer-events-none"
        >✨</motion.span>
      </motion.div>
    </div>
  );
}

// ─── Hex color blend helper ────────────────────────────────────────────────
function blendHex(hex1, hex2, t) {
  const parse = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  if (!hex1 || !hex2) return hex1 || hex2;
  const [r1, g1, b1] = parse(hex1);
  const [r2, g2, b2] = parse(hex2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}