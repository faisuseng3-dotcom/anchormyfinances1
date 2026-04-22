// AvatarDisplay — LUMIS-3D v3 — Full 3D Pixar/Memoji aesthetic
// Layered mesh: Jaw geometry, iris gradients, eyelid AO, crisp rim glow

import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { HAIR_LONG_STYLES } from './AvatarConfig';
import {
  HairBack, BodyLayer, OutfitLayer, FaceLayer, EyeLayer,
  NoseLayer, CheeksLayer, MouthLayer, HairFront, AccessoryLayer,
} from './AvatarLayers';

const SPRING = { type: 'spring', stiffness: 340, damping: 26 };

function blendHex(hex1, hex2, t) {
  const parse = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  if (!hex1 || !hex2) return hex1 || hex2;
  const [r1,g1,b1] = parse(hex1);
  const [r2,g2,b2] = parse(hex2);
  return `#${[r1+(r2-r1)*t, g1+(g2-g1)*t, b1+(b2-b1)*t].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}`;
}

// ─── Core SVG — Full 3D Render Pipeline ──────────────────────────────────────
export function AvatarSVG({ config, size = 100, expression }) {
  const reactId = useId().replace(/:/g, '_');
  const c = config || {};
  const bg       = c.bg        || '#0D7377';
  const skin     = c.skinColor || '#FFDBAC';
  const isLong   = HAIR_LONG_STYLES.includes(c.hair?.style);
  const expr     = expression || c.expression || 'neutral';
  const uid      = `av${reactId}`;
  const eyeColor = c.eyes?.color || '#2D3436';

  // Derived skin tones
  const skinDark   = blendHex(skin, '#3D1C00', 0.28);
  const skinLight  = blendHex(skin, '#FFFFFF', 0.28);
  const skinShadow = blendHex(skin, '#220800', 0.18);
  const skinSSS    = blendHex(skin, '#FF5533', 0.22);

  // Iris gradient colors
  const irisLight  = blendHex(eyeColor, '#FFFFFF', 0.35);
  const irisDark   = blendHex(eyeColor, '#000000', 0.45);

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 100 124"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* ══ FACE: Multi-stop skin gradient — forehead to jaw, light at 30/30 ══ */}
        <radialGradient id={`${uid}_faceG`} cx="35%" cy="28%" r="72%">
          <stop offset="0%"   stopColor={skinLight}  stopOpacity="1"/>
          <stop offset="38%"  stopColor={skin}        stopOpacity="1"/>
          <stop offset="72%"  stopColor={skinDark}    stopOpacity="1"/>
          <stop offset="100%" stopColor={skinShadow}  stopOpacity="1"/>
        </radialGradient>

        {/* ══ CHEEKBONE highlight — key light bounce at upper-left ══ */}
        <radialGradient id={`${uid}_cheekL`} cx="25%" cy="55%" r="40%">
          <stop offset="0%"   stopColor={skinLight} stopOpacity="0.55"/>
          <stop offset="100%" stopColor={skinLight} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`${uid}_cheekR`} cx="75%" cy="55%" r="40%">
          <stop offset="0%"   stopColor={skinLight} stopOpacity="0.20"/>
          <stop offset="100%" stopColor={skinLight} stopOpacity="0"/>
        </radialGradient>

        {/* ══ JAW SHADOW — under chin, volumetric ══ */}
        <radialGradient id={`${uid}_jawShadow`} cx="50%" cy="100%" r="55%">
          <stop offset="0%"   stopColor={skinShadow} stopOpacity="0.55"/>
          <stop offset="100%" stopColor={skinShadow} stopOpacity="0"/>
        </radialGradient>

        {/* ══ IRIS GRADIENT — not flat ══ */}
        <radialGradient id={`${uid}_iris`} cx="38%" cy="32%" r="65%">
          <stop offset="0%"   stopColor={irisLight}/>
          <stop offset="55%"  stopColor={eyeColor}/>
          <stop offset="100%" stopColor={irisDark}/>
        </radialGradient>

        {/* ══ EYELID AO — soft shadow falling from lid onto eye ══ */}
        <linearGradient id={`${uid}_lidAO`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.40)"/>
          <stop offset="60%"  stopColor="rgba(0,0,0,0.10)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </linearGradient>

        {/* ══ KEY LIGHT — warm studio, upper-left 45° ══ */}
        <radialGradient id={`${uid}_key`} cx="28%" cy="15%" r="68%">
          <stop offset="0%"   stopColor="#FFF9EE" stopOpacity="0.62"/>
          <stop offset="55%"  stopColor="#FFE8CC" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#FFE8CC" stopOpacity="0"/>
        </radialGradient>

        {/* ══ FILL LIGHT — cool blue bounce, right ══ */}
        <radialGradient id={`${uid}_fill`} cx="85%" cy="55%" r="55%">
          <stop offset="0%"   stopColor="#9EC8FF" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#9EC8FF" stopOpacity="0"/>
        </radialGradient>

        {/* ══ RIM LIGHT — top-back studio spot ══ */}
        <radialGradient id={`${uid}_rim`} cx="50%" cy="0%" r="55%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.80"/>
          <stop offset="35%"  stopColor="white" stopOpacity="0.28"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>

        {/* ══ RIM LIGHT — left shoulder edge ══ */}
        <radialGradient id={`${uid}_rimL`} cx="2%" cy="28%" r="42%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.38"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>

        {/* ══ SSS — subsurface perimeter glow ══ */}
        <radialGradient id={`${uid}_sss`} cx="50%" cy="50%" r="50%">
          <stop offset="50%"  stopColor={skinSSS} stopOpacity="0"/>
          <stop offset="82%"  stopColor={skinSSS} stopOpacity="0.32"/>
          <stop offset="100%" stopColor={skinSSS} stopOpacity="0.50"/>
        </radialGradient>

        {/* ══ HAIR SHINE — anisotropic band ══ */}
        <linearGradient id={`${uid}_hairSh`} x1="15%" y1="0%" x2="75%" y2="55%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.38"/>
          <stop offset="40%"  stopColor="white" stopOpacity="0.10"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>

        {/* ══ BG ambient tint ══ */}
        <radialGradient id={`${uid}_bg`} cx="50%" cy="35%" r="62%">
          <stop offset="0%"   stopColor={bg} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={bg} stopOpacity="0.04"/>
        </radialGradient>

        {/* ══ FABRIC WEAVE — low-freq displacement ══ */}
        <filter id={`${uid}_weave`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.012" numOctaves="3" seed="7" result="wave"/>
          <feDisplacementMap in="SourceGraphic" in2="wave" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>
        </filter>

        {/* ══ FABRIC TEXTURE multiply ══ */}
        <filter id={`${uid}_fabric`} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" seed="2" result="noise"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.88  0 0 0 0 0.88  0 0 0 0 0.88  0 0 0 0.18 0" in="noise" result="tinted"/>
          <feBlend in="SourceGraphic" in2="tinted" mode="multiply"/>
        </filter>

        {/* ══ CRISP RIM GLOW — white edge silhouette ══ */}
        <filter id={`${uid}_rimGlow`} x="-25%" y="-25%" width="150%" height="150%">
          <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="dilated"/>
          <feGaussianBlur stdDeviation="1.5" in="dilated" result="softEdge"/>
          <feFlood floodColor="white" floodOpacity="0.9" result="whiteFlood"/>
          <feComposite in="whiteFlood" in2="softEdge" operator="in" result="rimEdge"/>
          <feMerge>
            <feMergeNode in="rimEdge"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* ══ GLOBAL AO ══ */}
        <radialGradient id={`${uid}_ao`} cx="50%" cy="95%" r="52%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.28)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>

        {/* ══ EYE CORNEA GLOSS ══ */}
        <radialGradient id={`${uid}_cornea`} cx="35%" cy="20%" r="65%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* ── BG ambient ── */}
      <circle cx="50" cy="62" r="62" fill={`url(#${uid}_bg)`}/>

      {/* ══ LAYER STACK — in z-order ══ */}

      {/* L0: Back hair */}
      {isLong && <HairBack style={c.hair?.style} color={c.hair?.color} uid={uid}/>}

      {/* L1: Body / neck / ears */}
      <BodyLayer skinColor={skin} uid={uid}/>
      {/* SSS on ears */}
      <ellipse cx="26" cy="56" rx="6.5" ry="8.5" fill={`url(#${uid}_sss)`}/>
      <ellipse cx="74" cy="56" rx="6.5" ry="8.5" fill={`url(#${uid}_sss)`}/>

      {/* L2: Outfit with fabric texture */}
      <g filter={`url(#${uid}_fabric)`}>
        <g filter={`url(#${uid}_weave)`}>
          <OutfitLayer outfitConfig={c.outfit} uid={uid}/>
        </g>
      </g>

      {/* L3: FACE — mesh gradient with jaw + cheekbone geometry */}
      <Face3D skin={skin} faceShape={c.faceShape} uid={uid}
        faceG={`url(#${uid}_faceG)`}
        cheekL={`url(#${uid}_cheekL)`}
        cheekR={`url(#${uid}_cheekR)`}
        jawShadow={`url(#${uid}_jawShadow)`}
        sss={`url(#${uid}_sss)`}
        ao={`url(#${uid}_ao)`}
        key_={`url(#${uid}_key)`}
      />

      {/* L4: Eyes with iris gradient + eyelid AO + dual specular */}
      <Eyes3D
        eyeConfig={c.eyes}
        eyebrowConfig={c.eyebrows}
        eyelashConfig={c.eyelashes}
        irisGrad={`url(#${uid}_iris)`}
        lidAO={`url(#${uid}_lidAO)`}
        cornea={`url(#${uid}_cornea)`}
      />

      {/* L5: Nose */}
      <NoseLayer noseConfig={c.nose}/>

      {/* L6: Cheeks */}
      <CheeksLayer expression={expr}/>

      {/* L7: Mouth */}
      <MouthLayer mouthConfig={c.mouth} expression={expr}/>

      {/* L8: Front hair — with rim glow filter */}
      <g filter={`url(#${uid}_rimGlow)`}>
        <HairFront style={c.hair?.style} color={c.hair?.color}/>
        {c.hair?.style !== 'bald' && (
          <ellipse cx="43" cy="20" rx="20" ry="9" fill={`url(#${uid}_hairSh)`}/>
        )}
      </g>

      {/* L9: Accessories */}
      <AccessoryLayer accessory={c.accessory}/>

      {/* ── LIGHTING PASSES — over all geometry ── */}
      {/* KEY LIGHT */}
      <ellipse cx="36" cy="38" rx="28" ry="24" fill={`url(#${uid}_key)`}/>
      {/* RIM LIGHT top */}
      <ellipse cx="50" cy="16" rx="42" ry="22" fill={`url(#${uid}_rim)`}/>
      {/* RIM left edge */}
      <ellipse cx="14" cy="44" rx="20" ry="32" fill={`url(#${uid}_rimL)`}/>
      {/* FILL right bounce */}
      <ellipse cx="84" cy="54" rx="36" ry="40" fill={`url(#${uid}_fill)`}/>
    </svg>
  );
}

// ─── 3D Face Geometry — jaw path + multi-gradient cheekbones ─────────────────
function Face3D({ skin, faceShape, uid, faceG, cheekL, cheekR, jawShadow, sss, ao, key_ }) {
  // Face shape params
  let W = 23, H = 27, jawW = 18;
  if (faceShape === 'round')  { W = 24; H = 23; jawW = 21; }
  if (faceShape === 'square') { W = 25; H = 22; jawW = 23; }
  if (faceShape === 'heart')  { W = 22; H = 25; jawW = 14; }

  const cx = 50, cy = 54;
  // Jaw path: broad cheeks tapering to chin with defined jawline
  const jawPath = `
    M${cx - W} ${cy}
    Q${cx - W} ${cy - H} ${cx} ${cy - H}
    Q${cx + W} ${cy - H} ${cx + W} ${cy}
    Q${cx + W} ${cy + 8} ${cx + jawW} ${cy + H - 2}
    Q${cx + jawW * 0.4} ${cy + H + 2} ${cx} ${cy + H + 3}
    Q${cx - jawW * 0.4} ${cy + H + 2} ${cx - jawW} ${cy + H - 2}
    Q${cx - W} ${cy + 8} ${cx - W} ${cy}
    Z
  `;

  return (
    <>
      {/* Base face — full gradient mesh */}
      <path d={jawPath} fill={faceG}/>
      {/* SSS perimeter */}
      <path d={jawPath} fill={sss}/>
      {/* Cheekbone key light — left prominent */}
      <ellipse cx={cx - 10} cy={cy + 5} rx="12" ry="9" fill={cheekL}/>
      {/* Cheekbone fill — right subtle */}
      <ellipse cx={cx + 10} cy={cy + 5} rx="11" ry="8" fill={cheekR}/>
      {/* Jaw shadow AO */}
      <path d={jawPath} fill={jawShadow}/>
      {/* Brow ridge highlight */}
      <ellipse cx={cx - 4} cy={cy - H + 5} rx="14" ry="6" fill="rgba(255,255,255,0.13)"/>
      {/* Nose bridge shadow */}
      <path d={`M${cx-1} ${cy-H+8} Q${cx} ${cy+2} ${cx-1} ${cy+10}`}
        stroke="rgba(0,0,0,0.09)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Temple AO */}
      <ellipse cx={cx - W + 2} cy={cy - 12} rx="5" ry="8" fill="rgba(0,0,0,0.07)"/>
      <ellipse cx={cx + W - 2} cy={cy - 12} rx="5" ry="8" fill="rgba(0,0,0,0.07)"/>
      {/* Under-chin AO */}
      <ellipse cx={cx} cy={cy + H + 1} rx="16" ry="5" fill="rgba(0,0,0,0.13)"/>
    </>
  );
}

// ─── 3D Eyes — iris gradient + eyelid AO + dual pupil specular ───────────────
function Eyes3D({ eyeConfig, eyebrowConfig, eyelashConfig, irisGrad, lidAO, cornea }) {
  const ec       = eyeConfig?.color   || '#2D3436';
  const eyeType  = eyeConfig?.type    || 'almond';
  const browType = eyebrowConfig?.type || 'natural';
  const lashType = eyelashConfig?.type || 'natural';
  const browColor= '#1C1208';
  const Lx = 36, Ly = 54, Rx = 64, Ry = 54;

  function Iris({ cx, cy, rx = 4.5, ry = 4.5 }) {
    return (
      <>
        {/* White sclera */}
        <ellipse cx={cx} cy={cy} rx={rx + 2.8} ry={ry + 0.5} fill="white"/>
        {/* Iris — gradient not flat */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={irisGrad}/>
        {/* Pupil */}
        <ellipse cx={cx} cy={cy} rx={rx * 0.58} ry={ry * 0.58} fill="#070404"/>
        {/* Iris limbal ring */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none"
          stroke="rgba(0,0,0,0.35)" strokeWidth="0.8"/>
        {/* EYELID AO — shadow from top lid onto eye */}
        <ellipse cx={cx} cy={cy - ry * 0.2} rx={rx + 2.8} ry={(ry + 0.5) * 0.55}
          fill={lidAO}/>
        {/* PRIMARY specular — top-left bright */}
        <circle cx={cx + rx * 0.36} cy={cy - ry * 0.36} r={rx * 0.30} fill="white" opacity="0.95"/>
        {/* SECONDARY specular — bottom-right dim */}
        <circle cx={cx - rx * 0.28} cy={cy + ry * 0.22} r={rx * 0.14} fill="rgba(255,255,255,0.55)"/>
        {/* Cornea gloss sweep */}
        <ellipse cx={cx} cy={cy - ry * 0.3} rx={rx + 2.8} ry={(ry + 0.5) * 0.45}
          fill={cornea} opacity="0.18"/>
      </>
    );
  }

  function EyeContainer({ cx, cy }) {
    switch (eyeType) {
      case 'round':
        return (
          <>
            <ellipse cx={cx} cy={cy + 5} rx="7" ry="2.5" fill="rgba(0,0,0,0.10)"/>
            <Iris cx={cx} cy={cy} rx={4.8} ry={4.8}/>
          </>
        );
      case 'cat':
        return (
          <>
            <ellipse cx={cx} cy={cy + 5} rx="8" ry="2.2" fill="rgba(0,0,0,0.10)"/>
            <g style={{ transform: `rotate(-8deg)`, transformOrigin: `${cx}px ${cy}px` }}>
              <Iris cx={cx} cy={cy} rx={5.2} ry={3.8}/>
            </g>
          </>
        );
      case 'hooded':
        return (
          <>
            <ellipse cx={cx} cy={cy + 6} rx="6.5" ry="2.0" fill="rgba(0,0,0,0.09)"/>
            <Iris cx={cx} cy={cy + 1} rx={4.2} ry={3.5}/>
          </>
        );
      case 'wide':
        return (
          <>
            <ellipse cx={cx} cy={cy + 5.5} rx="9" ry="2.8" fill="rgba(0,0,0,0.10)"/>
            <Iris cx={cx} cy={cy} rx={5.4} ry={4.8}/>
          </>
        );
      default: // almond
        return (
          <>
            <ellipse cx={cx} cy={cy + 5} rx="7.5" ry="2.2" fill="rgba(0,0,0,0.09)"/>
            <Iris cx={cx} cy={cy} rx={4.5} ry={3.8}/>
          </>
        );
    }
  }

  function Brow({ cx, cy }) {
    const by = cy - 11;
    const sw = browType === 'thick' ? 4.8 : browType === 'thin' ? 1.4 : 2.8;
    const curve = browType === 'arched' ? -8 : browType === 'thick' ? -5 : -6;
    return (
      <>
        <path d={`M${cx-7} ${by+2} Q${cx+1} ${by+curve} ${cx+7} ${by}`}
          stroke={browColor} strokeWidth={sw} fill="none" strokeLinecap="round"/>
        {/* Brow highlight */}
        <path d={`M${cx-5} ${by+1} Q${cx} ${by+curve+1} ${cx+5} ${by+0.5}`}
          stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      </>
    );
  }

  function Lashes({ cx, cy }) {
    if (lashType === 'none') return null;
    const base = cy - 5;
    const pts = lashType === 'dramatic'
      ? [[-6,-8],[-3,-9],[0,-9.5],[3,-9],[6,-8],[9,-6.5]]
      : [[-4,-5.5],[0,-6.5],[4,-5.5]];
    return (
      <>
        {pts.map(([dx, dy], i) => (
          <line key={i}
            x1={cx + dx * 0.6} y1={base}
            x2={cx + dx}       y2={base + dy}
            stroke="#0a0604" strokeWidth={lashType === 'dramatic' ? 1.7 : 1.2}
            strokeLinecap="round"
          />
        ))}
        {/* Lash AO on upper lid */}
        <path d={`M${cx-6} ${cy-4.5} Q${cx} ${cy-4} ${cx+6} ${cy-4.5}`}
          stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" fill="none"/>
      </>
    );
  }

  return (
    <>
      <Brow cx={Lx} cy={Ly}/><Brow cx={Rx} cy={Ry}/>
      <EyeContainer cx={Lx} cy={Ly}/><EyeContainer cx={Rx} cy={Ry}/>
      <Lashes cx={Lx} cy={Ly}/><Lashes cx={Rx} cy={Ry}/>
    </>
  );
}

// ─── Animated display with pulsing aura ──────────────────────────────────────
export default function AvatarDisplay({ config, size = 170, expression }) {
  const bg = config?.bg || '#0D7377';
  const animKey = [
    config?.hair?.style, config?.hair?.color,
    config?.outfit?.style, config?.outfit?.color,
    config?.skinColor, config?.faceShape,
    config?.accessory, config?.eyes?.type,
  ].join('|');

  return (
    <div className="flex items-center justify-center relative" style={{ minHeight: size + 24 }}>

      {/* Outer ambient aura */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size + 100, height: size + 100,
          background: `radial-gradient(circle, ${bg}2A 0%, transparent 62%)`,
        }}
      />

      {/* Inner aura ring */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size + 36, height: size + 36,
          background: `radial-gradient(circle, ${bg}44 0%, transparent 70%)`,
          boxShadow: `0 0 60px ${bg}55, 0 0 100px ${bg}28`,
        }}
      />

      <motion.div
        key={animKey}
        initial={{ scale: 0.80, opacity: 0, y: 10 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        transition={SPRING}
        className="relative z-10"
      >
        {/* Circle backdrop with inner glow */}
        <div
          className="rounded-full flex items-center justify-center overflow-hidden"
          style={{
            width: size, height: size,
            background: `radial-gradient(circle at 35% 28%, ${bg}40 0%, ${bg}15 70%, ${bg}08 100%)`,
            boxShadow: `0 24px 64px ${bg}55, 0 0 0 1.5px ${bg}65, inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -2px 8px rgba(0,0,0,0.25)`,
          }}
        >
          <AvatarSVG config={config} size={Math.round(size * 0.92)} expression={expression}/>
        </div>

        {/* Sparkle */}
        <motion.span
          animate={{ y: [-3, 5, -3], rotate: [0, 18, -14, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-2 -right-1 text-lg select-none pointer-events-none"
        >✨</motion.span>
      </motion.div>
    </div>
  );
}