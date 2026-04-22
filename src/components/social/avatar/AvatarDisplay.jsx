// AvatarDisplay — High-fidelity 3D Stylized render
// PBR lighting: Key + Fill + Rim + SSS skin + AO

import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { HAIR_LONG_STYLES } from './AvatarConfig';
import {
  HairBack, BodyLayer, OutfitLayer, FaceLayer, EyeLayer,
  NoseLayer, CheeksLayer, MouthLayer, HairFront, AccessoryLayer,
} from './AvatarLayers';

const SPRING = { type: 'spring', stiffness: 340, damping: 26 };

// ─── Blend two hex colors ────────────────────────────────────────────────────
function blendHex(hex1, hex2, t) {
  const parse = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  if (!hex1 || !hex2) return hex1 || hex2;
  const [r1,g1,b1] = parse(hex1);
  const [r2,g2,b2] = parse(hex2);
  return `#${[r1+(r2-r1)*t, g1+(g2-g1)*t, b1+(b2-b1)*t].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}`;
}

// ─── Core SVG — the render pipeline ─────────────────────────────────────────
export function AvatarSVG({ config, size = 100, expression }) {
  const reactId = useId().replace(/:/g, '_');
  const c = config || {};
  const bg = c.bg || '#0D7377';
  const skinColor = c.skinColor || '#FFDBAC';
  const isLong = HAIR_LONG_STYLES.includes(c.hair?.style);
  const expr = expression || c.expression || 'neutral';

  // Each instance gets a unique ID via React's useId to prevent gradient collisions
  const uid = `av${reactId}`;

  // SSS warm blush color derived from skin
  const sssColor = blendHex(skinColor, '#FF7755', 0.20);
  const sssOuter = blendHex(skinColor, '#FF6644', 0.28);

  return (
    <svg width={size} height={size} viewBox="0 0 100 124" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* ══ BG ambient ══ */}
        <radialGradient id={`${uid}_bg`} cx="50%" cy="38%" r="65%">
          <stop offset="0%"   stopColor={bg} stopOpacity="0.32"/>
          <stop offset="100%" stopColor={bg} stopOpacity="0.04"/>
        </radialGradient>

        {/* ══ KEY LIGHT — warm, upper-left 45° ══ */}
        <radialGradient id={`${uid}_key`} cx="28%" cy="18%" r="72%">
          <stop offset="0%"   stopColor="#FFF8E8" stopOpacity="0.50"/>
          <stop offset="60%"  stopColor="#FFE8CC" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#FFE8CC" stopOpacity="0"/>
        </radialGradient>

        {/* ══ FILL LIGHT — cool blue, right side ══ */}
        <radialGradient id={`${uid}_fill`} cx="82%" cy="58%" r="52%">
          <stop offset="0%"   stopColor="#B8D8FF" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#B8D8FF" stopOpacity="0"/>
        </radialGradient>

        {/* ══ RIM LIGHT — strong white top-back ══ */}
        <radialGradient id={`${uid}_rim`} cx="50%" cy="2%" r="58%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.70"/>
          <stop offset="40%"  stopColor="white" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>

        {/* ══ RIM LIGHT side glow — left edge ══ */}
        <radialGradient id={`${uid}_rimL`} cx="5%" cy="30%" r="45%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.30"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>

        {/* ══ SSS — subsurface scattering on skin ══ */}
        <radialGradient id={`${uid}_sss`} cx="50%" cy="50%" r="50%">
          <stop offset="55%"  stopColor={sssColor}  stopOpacity="0"/>
          <stop offset="85%"  stopColor={sssColor}  stopOpacity="0.28"/>
          <stop offset="100%" stopColor={sssOuter}  stopOpacity="0.42"/>
        </radialGradient>

        {/* ══ EYE SPECULAR — glossy cornea ══ */}
        <radialGradient id={`${uid}_eyeG`} cx="55%" cy="25%" r="60%">
          <stop offset="0%"   stopColor="white" stopOpacity="1"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>

        {/* ══ HAIR SHINE — anisotropic highlight band ══ */}
        <linearGradient id={`${uid}_hairSh`} x1="20%" y1="0%" x2="80%" y2="60%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.28"/>
          <stop offset="35%"  stopColor="white" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>

        {/* ══ GLOBAL AO — ambient occlusion darkening base ══ */}
        <radialGradient id={`${uid}_ao`} cx="50%" cy="90%" r="55%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.22)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>

        {/* ══ DROP SHADOW filter ══ */}
        <filter id={`${uid}_shad`} x="-15%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="rgba(0,0,0,0.30)"/>
        </filter>

        {/* ══ BLOOM filter — soft glow ══ */}
        <filter id={`${uid}_bloom`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      {/* ── AMBIENT BG glow ── */}
      <circle cx="50" cy="64" r="60" fill={`url(#${uid}_bg)`}/>

      {/* ─────────── LAYER STACK ─────────── */}

      {/* L0: Back hair (long styles) */}
      {isLong && <HairBack style={c.hair?.style} color={c.hair?.color} uid={uid}/>}

      {/* L1: Body — neck, ears */}
      <BodyLayer skinColor={skinColor} uid={uid}/>

      {/* SSS on ears — light penetrates cartilage */}
      <ellipse cx="26" cy="56" rx="6" ry="8"  fill={`url(#${uid}_sss)`}/>
      <ellipse cx="74" cy="56" rx="6" ry="8"  fill={`url(#${uid}_sss)`}/>

      {/* L2: Outfit */}
      <OutfitLayer outfitConfig={c.outfit} uid={uid}/>

      {/* L3: Face */}
      <FaceLayer skinColor={skinColor} faceShape={c.faceShape} uid={uid}/>

      {/* SSS on face perimeter */}
      <ellipse cx="50" cy="54" rx="24.5" ry="27.5" fill={`url(#${uid}_sss)`}/>

      {/* Global AO under face / chin */}
      <ellipse cx="50" cy="78" rx="20" ry="7" fill={`url(#${uid}_ao)`}/>

      {/* KEY LIGHT on forehead + upper face */}
      <ellipse cx="38" cy="40" rx="24" ry="20" fill={`url(#${uid}_key)`}/>

      {/* L4: Eyes + brows + lashes */}
      <EyeLayer eyeConfig={c.eyes} eyebrowConfig={c.eyebrows} eyelashConfig={c.eyelashes}/>

      {/* Eye environment specular (cornea gloss) */}
      <ellipse cx="36" cy="52.5" rx="7.5" ry="5.5" fill={`url(#${uid}_eyeG)`} opacity="0.28"/>
      <ellipse cx="64" cy="52.5" rx="7.5" ry="5.5" fill={`url(#${uid}_eyeG)`} opacity="0.28"/>

      {/* L5: Nose */}
      <NoseLayer noseConfig={c.nose}/>

      {/* L6: Cheeks / blush */}
      <CheeksLayer expression={expr}/>

      {/* L7: Mouth */}
      <MouthLayer mouthConfig={c.mouth} expression={expr}/>

      {/* L8: Front hair */}
      <HairFront style={c.hair?.style} color={c.hair?.color}/>

      {/* Hair anisotropic shine */}
      {c.hair?.style !== 'bald' && (
        <ellipse cx="43" cy="20" rx="19" ry="8" fill={`url(#${uid}_hairSh)`}/>
      )}

      {/* L9: Accessories (cast own AO inside their component) */}
      <AccessoryLayer accessory={c.accessory}/>

      {/* ── LIGHTING PASSES (rendered last, over everything) ── */}

      {/* RIM LIGHT — top edge: creates glowing silhouette */}
      <ellipse cx="50" cy="18" rx="40" ry="20" fill={`url(#${uid}_rim)`}/>

      {/* RIM LIGHT — left side edge glow */}
      <ellipse cx="18" cy="42" rx="22" ry="30" fill={`url(#${uid}_rimL)`}/>

      {/* FILL LIGHT — right cool bounce */}
      <circle cx="82" cy="52" r="44" fill={`url(#${uid}_fill)`}/>
    </svg>
  );
}

// ─── Animated builder preview with pulsing aura ──────────────────────────────
export default function AvatarDisplay({ config, size = 170, expression }) {
  const bg = config?.bg || '#0D7377';
  const animKey = [
    config?.hair?.style, config?.hair?.color,
    config?.outfit?.style, config?.outfit?.color,
    config?.skinColor, config?.faceShape,
    config?.accessory, config?.eyes?.type,
  ].join('|');

  return (
    <div className="flex items-center justify-center relative" style={{ minHeight: size + 20 }}>

      {/* Outer ambient glow — far ring */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size + 80,
          height: size + 80,
          background: `radial-gradient(circle, ${bg}28 0%, transparent 62%)`,
        }}
      />

      {/* Middle glow ring */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.55, 0.75, 0.55] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size + 44,
          height: size + 44,
          background: `radial-gradient(circle, ${bg}35 0%, transparent 65%)`,
          boxShadow: `0 0 40px ${bg}45, 0 0 80px ${bg}20`,
        }}
      />

      <motion.div
        key={animKey}
        initial={{ scale: 0.80, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={SPRING}
        className="relative z-10"
      >
        {/* Avatar circle with inner glow */}
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: size,
            height: size,
            background: `radial-gradient(circle at 35% 28%, ${bg}38 0%, ${bg}12 100%)`,
            boxShadow: `0 20px 56px ${bg}50, 0 0 0 1.5px ${bg}60, inset 0 1px 0 rgba(255,255,255,0.15)`,
          }}
        >
          <AvatarSVG config={config} size={Math.round(size * 0.92)} expression={expression}/>
        </div>

        {/* Floating sparkle */}
        <motion.span
          animate={{ y: [-3, 5, -3], rotate: [0, 16, -12, 0], scale: [1, 1.25, 1] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-2 -right-1 text-lg select-none pointer-events-none"
        >✨</motion.span>
      </motion.div>
    </div>
  );
}