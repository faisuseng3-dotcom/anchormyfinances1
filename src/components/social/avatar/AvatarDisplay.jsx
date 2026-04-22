// AvatarDisplay — LUMIS-3D v4 — Full PBR Avatar Engine
// 3-point studio lighting: Key + Fill + Rim
// SSS skin, iris gradient, eyelid AO, sculpted jaw geometry

import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { HAIR_LONG_STYLES } from './AvatarConfig';
import {
  HairBack, BodyLayer, OutfitLayer,
  HairFront, AccessoryLayer,
} from './AvatarLayers';

// ─── Color Math ──────────────────────────────────────────────────────────────
function blendHex(hex1, hex2, t) {
  if (!hex1 || !hex2) return hex1 || hex2 || '#888';
  const parse = h => [
    parseInt(h.slice(1,3),16),
    parseInt(h.slice(3,5),16),
    parseInt(h.slice(5,7),16),
  ];
  const [r1,g1,b1] = parse(hex1);
  const [r2,g2,b2] = parse(hex2);
  return '#' + [r1+(r2-r1)*t, g1+(g2-g1)*t, b1+(b2-b1)*t]
    .map(v => Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0'))
    .join('');
}

// ─── Face Geometry (sculpted jaw) ─────────────────────────────────────────────
function Face3D({ skin, faceShape, uid }) {
  const skinLight  = blendHex(skin, '#FFFFFF', 0.30);
  const skinDark   = blendHex(skin, '#1A0800', 0.32);
  const skinShadow = blendHex(skin, '#0A0200', 0.22);
  const skinSSS    = blendHex(skin, '#FF4422', 0.20);

  let W = 23, H = 27, jawW = 18;
  if (faceShape === 'round')  { W = 24; H = 23; jawW = 21; }
  if (faceShape === 'square') { W = 25; H = 22; jawW = 24; }
  if (faceShape === 'heart')  { W = 22; H = 25; jawW = 13; }

  const cx = 50, cy = 54;

  // Sculpted jaw with S-curve cheeks
  const jawPath = `
    M${cx - W} ${cy - 4}
    Q${cx - W - 1} ${cy - H} ${cx} ${cy - H}
    Q${cx + W + 1} ${cy - H} ${cx + W} ${cy - 4}
    Q${cx + W + 1} ${cy + 6} ${cx + jawW} ${cy + H - 1}
    Q${cx + jawW * 0.5} ${cy + H + 3} ${cx} ${cy + H + 4}
    Q${cx - jawW * 0.5} ${cy + H + 3} ${cx - jawW} ${cy + H - 1}
    Q${cx - W - 1} ${cy + 6} ${cx - W} ${cy - 4}
    Z
  `;

  return (
    <>
      {/* Base skin — radial gradient from top-left key light */}
      <path d={jawPath} fill={`url(#${uid}_faceMain)`} />

      {/* SSS perimeter scatter */}
      <path d={jawPath} fill={`url(#${uid}_sss)`} />

      {/* Cheekbone highlight — left (key side) */}
      <ellipse cx={cx - 9} cy={cy + 6} rx="13" ry="9" fill={`url(#${uid}_cheekL)`} />

      {/* Cheekbone fill — right subtle */}
      <ellipse cx={cx + 9} cy={cy + 6} rx="11" ry="7" fill={`url(#${uid}_cheekR)`} />

      {/* Jaw shadow — volumetric under chin */}
      <path d={jawPath} fill={`url(#${uid}_jawShadow)`} />

      {/* Brow ridge micro-highlight */}
      <ellipse cx={cx - 3} cy={cy - H + 6} rx="15" ry="5.5" fill="rgba(255,255,255,0.11)" />

      {/* Nose-bridge shadow line */}
      <path d={`M${cx} ${cy-H+10} Q${cx-1} ${cy+2} ${cx} ${cy+12}`}
        stroke="rgba(0,0,0,0.07)" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Temple AO */}
      <ellipse cx={cx - W + 1} cy={cy - 14} rx="5" ry="9" fill="rgba(0,0,0,0.06)" />
      <ellipse cx={cx + W - 1} cy={cy - 14} rx="5" ry="9" fill="rgba(0,0,0,0.06)" />

      {/* Under-chin AO */}
      <ellipse cx={cx} cy={cy + H + 2} rx="14" ry="4.5" fill="rgba(0,0,0,0.14)" />

      {/* Jawline definition shadow */}
      <path d={`M${cx - jawW} ${cy + H - 1} Q${cx} ${cy + H + 4} ${cx + jawW} ${cy + H - 1}`}
        stroke="rgba(0,0,0,0.10)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </>
  );
}

// ─── Eyes (3D: iris gradient + eyelid AO + dual specular) ────────────────────
function Eyes3D({ eyeConfig, eyebrowConfig, eyelashConfig, uid }) {
  const eyeColor = eyeConfig?.color || '#2D4A6B';
  const eyeType  = eyeConfig?.type  || 'almond';
  const browType = eyebrowConfig?.type || 'natural';
  const lashType = eyelashConfig?.type || 'natural';

  const irisLight = blendHex(eyeColor, '#FFFFFF', 0.38);
  const irisDark  = blendHex(eyeColor, '#000000', 0.50);
  const browColor = '#1C1008';
  const Lx = 36, Ly = 54, Rx = 64, Ry = 54;

  function Iris({ cx, cy, rx = 4.5, ry = 4.2 }) {
    return (
      <>
        {/* Drop shadow under eye socket */}
        <ellipse cx={cx} cy={cy + ry + 1.5} rx={rx + 2.5} ry="2" fill="rgba(0,0,0,0.10)" />
        {/* Sclera */}
        <ellipse cx={cx} cy={cy} rx={rx + 3} ry={ry + 0.8} fill="white" />
        {/* Sclera shadow edge */}
        <ellipse cx={cx} cy={cy} rx={rx + 3} ry={ry + 0.8}
          fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
        {/* Iris — gradient not flat */}
        <defs>
          <radialGradient id={`${uid}_iris_${cx}`} cx="36%" cy="30%" r="68%">
            <stop offset="0%"   stopColor={irisLight} />
            <stop offset="50%"  stopColor={eyeColor} />
            <stop offset="100%" stopColor={irisDark} />
          </radialGradient>
        </defs>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${uid}_iris_${cx})`} />
        {/* Limbal ring */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
          fill="none" stroke="rgba(0,0,0,0.40)" strokeWidth="0.9" />
        {/* Pupil */}
        <ellipse cx={cx} cy={cy + 0.3} rx={rx * 0.54} ry={ry * 0.54} fill="#060304" />
        {/* EYELID AO — shadow from upper lid */}
        <ellipse cx={cx} cy={cy - ry * 0.15} rx={rx + 3} ry={(ry + 0.8) * 0.50}
          fill={`url(#${uid}_lidAO)`} />
        {/* PRIMARY specular — klockan 10 */}
        <circle cx={cx - rx * 0.30} cy={cy - ry * 0.38} r={rx * 0.28} fill="white" opacity="0.96" />
        {/* SECONDARY specular — klockan 2 */}
        <circle cx={cx + rx * 0.32} cy={cy - ry * 0.26} r={rx * 0.16} fill="white" opacity="0.70" />
        {/* Cornea gloss */}
        <ellipse cx={cx} cy={cy - ry * 0.25} rx={rx + 3} ry={(ry + 0.8) * 0.42}
          fill="white" opacity="0.06" />
      </>
    );
  }

  function EyeContainer({ cx, cy }) {
    switch (eyeType) {
      case 'round':
        return <Iris cx={cx} cy={cy} rx={5.0} ry={5.0} />;
      case 'cat':
        return (
          <g style={{ transform: `rotate(-9deg)`, transformOrigin: `${cx}px ${cy}px` }}>
            <Iris cx={cx} cy={cy} rx={5.4} ry={3.8} />
          </g>
        );
      case 'hooded':
        return <Iris cx={cx} cy={cy + 0.8} rx={4.2} ry={3.4} />;
      case 'wide':
        return <Iris cx={cx} cy={cy} rx={5.6} ry={4.8} />;
      default: // almond
        return <Iris cx={cx} cy={cy} rx={4.6} ry={3.8} />;
    }
  }

  function Brow({ cx, cy }) {
    const by = cy - 11.5;
    const sw = browType === 'thick' ? 5.0 : browType === 'thin' ? 1.4 : 2.8;
    const curve = browType === 'arched' ? -8 : browType === 'thick' ? -5 : -6;
    return (
      <>
        <path d={`M${cx-7.5} ${by+2} Q${cx+1} ${by+curve} ${cx+7.5} ${by}`}
          stroke={browColor} strokeWidth={sw} fill="none" strokeLinecap="round" />
        {/* Brow highlight */}
        <path d={`M${cx-5} ${by+1} Q${cx} ${by+curve+1} ${cx+5} ${by+0.5}`}
          stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      </>
    );
  }

  function Lashes({ cx, cy }) {
    if (lashType === 'none') return null;
    const base = cy - 4.5;
    const pts = lashType === 'dramatic'
      ? [[-6,-8],[-3,-9],[0,-9.5],[3,-9],[6,-8],[9,-6.5]]
      : [[-4.5,-5.5],[0,-6.5],[4.5,-5.5]];
    return (
      <>
        {pts.map(([dx, dy], i) => (
          <line key={i}
            x1={cx + dx * 0.55} y1={base}
            x2={cx + dx}        y2={base + dy}
            stroke="#0a0604"
            strokeWidth={lashType === 'dramatic' ? 1.8 : 1.3}
            strokeLinecap="round"
          />
        ))}
        {/* Upper lid line */}
        <path d={`M${cx-6} ${cy-4} Q${cx} ${cy-3.5} ${cx+6} ${cy-4}`}
          stroke="rgba(0,0,0,0.20)" strokeWidth="1.3" fill="none" />
      </>
    );
  }

  return (
    <>
      <Brow cx={Lx} cy={Ly} /><Brow cx={Rx} cy={Ry} />
      <EyeContainer cx={Lx} cy={Ly} /><EyeContainer cx={Rx} cy={Ry} />
      <Lashes cx={Lx} cy={Ly} /><Lashes cx={Rx} cy={Ry} />
    </>
  );
}

// ─── Nose (PBR: side shadows + tip highlight) ─────────────────────────────────
function Nose3D({ noseConfig }) {
  const type = noseConfig?.type || 'button';
  const ao = 'rgba(0,0,0,0.12)';
  const hi = 'rgba(255,255,255,0.16)';
  const shadow = 'rgba(0,0,0,0.08)';

  switch (type) {
    case 'wide':
      return (
        <>
          <path d="M49 62 Q48 67 46 70 Q50 72 54 70 Q52 67 51 62 Z" fill={shadow} />
          <ellipse cx="43" cy="69" rx="5" ry="3.2" fill={ao} />
          <ellipse cx="57" cy="69" rx="5" ry="3.2" fill={ao} />
          <ellipse cx="43" cy="68" rx="2" ry="1.2" fill={hi} />
          <ellipse cx="57" cy="68" rx="2" ry="1.2" fill={hi} />
        </>
      );
    case 'narrow':
      return (
        <>
          <path d="M50 62 Q49 67 47 70 Q50 72 53 70 Q51 67 50 62 Z" fill={ao} opacity="0.85" />
          <ellipse cx="47.5" cy="70.5" rx="2" ry="1.5" fill={ao} />
          <ellipse cx="52.5" cy="70.5" rx="2" ry="1.5" fill={ao} />
          <ellipse cx="50" cy="63" rx="0.9" ry="1.4" fill={hi} opacity="0.7" />
        </>
      );
    case 'upturned':
      return (
        <>
          <path d="M45 71.5 Q50 64.5 55 71.5" stroke={ao} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse cx="46" cy="71.5" rx="2.5" ry="1.8" fill={ao} />
          <ellipse cx="54" cy="71.5" rx="2.5" ry="1.8" fill={ao} />
          <ellipse cx="46.5" cy="70.5" rx="1" ry="0.8" fill={hi} />
          <ellipse cx="54.5" cy="70.5" rx="1" ry="0.8" fill={hi} />
        </>
      );
    default: // button
      return (
        <>
          <path d="M49 62 Q48 67 47 70 Q50 72 53 70 Q52 67 51 62 Z" fill={shadow} />
          <ellipse cx="50" cy="66" rx="5.5" ry="4.5" fill={ao} />
          <ellipse cx="47" cy="70.5" rx="2.4" ry="1.8" fill={ao} />
          <ellipse cx="53" cy="70.5" rx="2.4" ry="1.8" fill={ao} />
          <ellipse cx="49.5" cy="65" rx="2" ry="1.3" fill={hi} />
        </>
      );
  }
}

// ─── Cheeks ───────────────────────────────────────────────────────────────────
function Cheeks3D({ expression }) {
  const alpha = expression === 'happy' || expression === 'excited' ? 0.36 : 0.14;
  return (
    <>
      <ellipse cx="29" cy="65" rx="8.5" ry="5" fill={`rgba(255,110,90,${alpha})`} />
      <ellipse cx="71" cy="65" rx="8.5" ry="5" fill={`rgba(255,110,90,${alpha})`} />
      <ellipse cx="29" cy="65" rx="4" ry="2.5" fill={`rgba(255,160,140,${alpha*0.5})`} />
      <ellipse cx="71" cy="65" rx="4" ry="2.5" fill={`rgba(255,160,140,${alpha*0.5})`} />
    </>
  );
}

// ─── Mouth (PBR lips) ─────────────────────────────────────────────────────────
function Mouth3D({ mouthConfig, expression }) {
  const lc = mouthConfig?.lipColor || '#C48A8A';
  const dark = blendHex(lc, '#000000', 0.28);
  const hi   = blendHex(lc, '#FFFFFF', 0.35);
  const EXPR = { neutral: 'smile', happy: 'open', excited: 'open', focused: 'smirk' };
  const type = expression && expression !== 'neutral'
    ? (EXPR[expression] || mouthConfig?.type)
    : (mouthConfig?.type || 'smile');

  switch (type) {
    case 'smirk':
      return (
        <>
          <path d="M38 77.5 Q46 83 61 75" stroke="rgba(0,0,0,0.12)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M38 76.5 Q46 82 61 74" stroke={lc} strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M38 76.5 Q42 78.5 46 77" stroke={hi} strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.45" />
          <circle cx="61" cy="74.5" r="1.2" fill={dark} opacity="0.45" />
        </>
      );
    case 'open':
      return (
        <>
          <path d="M37 75 Q50 87 63 75" fill={lc} opacity="0.90" />
          <ellipse cx="50" cy="80.5" rx="11.5" ry="6.5" fill="#100606" />
          <ellipse cx="50" cy="78.2" rx="10" ry="4" fill="rgba(248,244,240,0.97)" />
          {[44,47,50,53,56].map(x => (
            <line key={x} x1={x} y1="75.5" x2={x} y2="78.5" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
          ))}
          <path d="M37 75 Q50 87 63 75" stroke={dark} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M40 75.5 Q50 78 60 75.5" stroke={hi} strokeWidth="0.9" fill="none" opacity="0.38" strokeLinecap="round" />
        </>
      );
    default: // smile
      return (
        <>
          <path d="M37 77 Q50 87.5 63 77" stroke="rgba(0,0,0,0.11)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M37 76 Q50 86 63 76" stroke={lc} strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M38 76 Q50 83.5 62 76" stroke={hi} strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.38" />
          <circle cx="37.5" cy="76.5" r="1.4" fill={dark} opacity="0.30" />
          <circle cx="62.5" cy="76.5" r="1.4" fill={dark} opacity="0.30" />
        </>
      );
  }
}

// ─── CORE SVG RENDER ──────────────────────────────────────────────────────────
export function AvatarSVG({ config, size = 100, expression }) {
  const reactId = useId().replace(/:/g,'_');
  const c   = config || {};
  const bg  = c.bg        || '#0D7377';
  const skin = c.skinColor || '#FFDBAC';
  const isLong = HAIR_LONG_STYLES.includes(c.hair?.style);
  const expr   = expression || c.expression || 'neutral';
  const uid    = `av${reactId}`;

  const skinLight  = blendHex(skin, '#FFFFFF', 0.30);
  const skinDark   = blendHex(skin, '#1A0800', 0.32);
  const skinShadow = blendHex(skin, '#0A0200', 0.22);
  const skinSSS    = blendHex(skin, '#FF4422', 0.20);
  const eyeColor   = c.eyes?.color || '#2D4A6B';
  const irisLight  = blendHex(eyeColor, '#FFFFFF', 0.38);
  const irisDark   = blendHex(eyeColor, '#000000', 0.50);

  return (
    <svg width={size} height={size} viewBox="0 0 100 124" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* ── FACE: multi-stop radial — key light top-left ── */}
        <radialGradient id={`${uid}_faceMain`} cx="32%" cy="22%" r="75%">
          <stop offset="0%"   stopColor={skinLight}  />
          <stop offset="35%"  stopColor={skin}        />
          <stop offset="70%"  stopColor={skinDark}    />
          <stop offset="100%" stopColor={skinShadow}  />
        </radialGradient>

        {/* ── SSS — scatter at perimeter ── */}
        <radialGradient id={`${uid}_sss`} cx="50%" cy="50%" r="50%">
          <stop offset="50%"  stopColor={skinSSS} stopOpacity="0" />
          <stop offset="80%"  stopColor={skinSSS} stopOpacity="0.28" />
          <stop offset="100%" stopColor={skinSSS} stopOpacity="0.50" />
        </radialGradient>

        {/* ── CHEEKBONE key-side ── */}
        <radialGradient id={`${uid}_cheekL`} cx="25%" cy="55%" r="42%">
          <stop offset="0%"   stopColor={skinLight} stopOpacity="0.52" />
          <stop offset="100%" stopColor={skinLight} stopOpacity="0" />
        </radialGradient>

        {/* ── CHEEKBONE fill-side ── */}
        <radialGradient id={`${uid}_cheekR`} cx="75%" cy="55%" r="38%">
          <stop offset="0%"   stopColor={skinLight} stopOpacity="0.18" />
          <stop offset="100%" stopColor={skinLight} stopOpacity="0" />
        </radialGradient>

        {/* ── JAW SHADOW ── */}
        <radialGradient id={`${uid}_jawShadow`} cx="50%" cy="100%" r="52%">
          <stop offset="0%"   stopColor={skinShadow} stopOpacity="0.52" />
          <stop offset="100%" stopColor={skinShadow} stopOpacity="0" />
        </radialGradient>

        {/* ── EYELID AO ── */}
        <linearGradient id={`${uid}_lidAO`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.42)" />
          <stop offset="55%"  stopColor="rgba(0,0,0,0.10)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>

        {/* ── KEY LIGHT — warm 45° upper-left ── */}
        <radialGradient id={`${uid}_key`} cx="26%" cy="12%" r="70%">
          <stop offset="0%"   stopColor="#FFF8EE" stopOpacity="0.65" />
          <stop offset="50%"  stopColor="#FFE5CC" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FFE5CC" stopOpacity="0" />
        </radialGradient>

        {/* ── FILL LIGHT — cool blue right ── */}
        <radialGradient id={`${uid}_fill`} cx="88%" cy="58%" r="52%">
          <stop offset="0%"   stopColor="#AACCFF" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#AACCFF" stopOpacity="0" />
        </radialGradient>

        {/* ── RIM LIGHT — white top-back edge ── */}
        <radialGradient id={`${uid}_rim`} cx="50%" cy="0%" r="58%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.85" />
          <stop offset="30%"  stopColor="white" stopOpacity="0.30" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        {/* ── RIM LEFT SHOULDER EDGE ── */}
        <radialGradient id={`${uid}_rimL`} cx="0%" cy="30%" r="45%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.42" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        {/* ── BG ambient tint ── */}
        <radialGradient id={`${uid}_bgTint`} cx="50%" cy="35%" r="62%">
          <stop offset="0%"   stopColor={bg} stopOpacity="0.30" />
          <stop offset="100%" stopColor={bg} stopOpacity="0.03" />
        </radialGradient>

        {/* ── HAIR SHINE ── */}
        <linearGradient id={`${uid}_hairSh`} x1="12%" y1="0%" x2="72%" y2="55%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.40" />
          <stop offset="38%"  stopColor="white" stopOpacity="0.10" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* ── FABRIC TEXTURE ── */}
        <filter id={`${uid}_fabric`} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" seed="3" result="noise"/>
          <feColorMatrix type="matrix"
            values="0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0.16 0"
            in="noise" result="tinted"/>
          <feBlend in="SourceGraphic" in2="tinted" mode="multiply"/>
        </filter>

        {/* ── FABRIC WEAVE DISPLACEMENT ── */}
        <filter id={`${uid}_weave`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.010" numOctaves="3" seed="9" result="wave"/>
          <feDisplacementMap in="SourceGraphic" in2="wave" scale="2.0" xChannelSelector="R" yChannelSelector="G"/>
        </filter>

        {/* ── RIM GLOW FILTER — crisp white edge silhouette ── */}
        <filter id={`${uid}_rimGlow`} x="-22%" y="-22%" width="144%" height="144%">
          <feMorphology operator="dilate" radius="2.2" in="SourceAlpha" result="dilated"/>
          <feGaussianBlur stdDeviation="1.4" in="dilated" result="soft"/>
          <feFlood floodColor="white" floodOpacity="0.92" result="white"/>
          <feComposite in="white" in2="soft" operator="in" result="rim"/>
          <feMerge><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* BG ambient */}
      <circle cx="50" cy="62" r="62" fill={`url(#${uid}_bgTint)`} />

      {/* L0: Back hair */}
      {isLong && <HairBack style={c.hair?.style} color={c.hair?.color} uid={uid} />}

      {/* L1: Body / neck / ears */}
      <BodyLayer skinColor={skin} uid={uid} />

      {/* L2: Outfit — fabric displaced */}
      <g filter={`url(#${uid}_fabric)`}>
        <g filter={`url(#${uid}_weave)`}>
          <OutfitLayer outfitConfig={c.outfit} uid={uid} />
        </g>
      </g>

      {/* L3: Face — sculpted jaw */}
      <Face3D skin={skin} faceShape={c.faceShape} uid={uid} />

      {/* L4: Eyes — iris + eyelid AO + dual specular */}
      <Eyes3D
        eyeConfig={c.eyes}
        eyebrowConfig={c.eyebrows}
        eyelashConfig={c.eyelashes}
        uid={uid}
      />

      {/* L5: Nose */}
      <Nose3D noseConfig={c.nose} />

      {/* L6: Cheeks */}
      <Cheeks3D expression={expr} />

      {/* L7: Mouth */}
      <Mouth3D mouthConfig={c.mouth} expression={expr} />

      {/* L8: Front hair — rim glow */}
      <g filter={`url(#${uid}_rimGlow)`}>
        <HairFront style={c.hair?.style} color={c.hair?.color} />
        {c.hair?.style !== 'bald' && (
          <ellipse cx="43" cy="20" rx="20" ry="8.5" fill={`url(#${uid}_hairSh)`} />
        )}
      </g>

      {/* L9: Accessories */}
      <AccessoryLayer accessory={c.accessory} />

      {/* ── CINEMATIC LIGHTING PASSES (over all geometry) ── */}
      {/* KEY: warm 45° top-left */}
      <ellipse cx="34" cy="36" rx="30" ry="26" fill={`url(#${uid}_key)`} />
      {/* RIM: white top-back crown */}
      <ellipse cx="50" cy="14" rx="44" ry="22" fill={`url(#${uid}_rim)`} />
      {/* RIM left shoulder edge */}
      <ellipse cx="10" cy="46" rx="22" ry="36" fill={`url(#${uid}_rimL)`} />
      {/* FILL: cool right bounce */}
      <ellipse cx="86" cy="56" rx="38" ry="42" fill={`url(#${uid}_fill)`} />
    </svg>
  );
}

// ─── Animated display with pulsing aura ───────────────────────────────────────
const SPRING = { type:'spring', stiffness:340, damping:26 };

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
      {/* Outer aura */}
      <motion.div
        animate={{ scale:[1,1.06,1], opacity:[0.22,0.42,0.22] }}
        transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size + 110, height: size + 110,
          background: `radial-gradient(circle, ${bg}28 0%, transparent 62%)`,
        }}
      />
      {/* Inner aura ring */}
      <motion.div
        animate={{ scale:[1,1.05,1], opacity:[0.50,0.80,0.50] }}
        transition={{ duration:3.2, repeat:Infinity, ease:'easeInOut', delay:0.8 }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size + 40, height: size + 40,
          background: `radial-gradient(circle, ${bg}42 0%, transparent 70%)`,
          boxShadow: `0 0 70px ${bg}50, 0 0 110px ${bg}25`,
        }}
      />

      <motion.div
        key={animKey}
        initial={{ scale:0.80, opacity:0, y:10 }}
        animate={{ scale:1,    opacity:1, y:0 }}
        transition={SPRING}
        className="relative z-10"
      >
        <div
          className="rounded-full flex items-center justify-center overflow-hidden"
          style={{
            width: size, height: size,
            background: `radial-gradient(circle at 33% 26%, ${bg}3A 0%, ${bg}14 68%, ${bg}07 100%)`,
            boxShadow: `0 28px 70px ${bg}50, 0 0 0 1.5px ${bg}60, inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -3px 10px rgba(0,0,0,0.28)`,
          }}
        >
          <AvatarSVG config={config} size={Math.round(size * 0.92)} expression={expression} />
        </div>

        {/* Sparkle */}
        <motion.span
          animate={{ y:[-3,5,-3], rotate:[0,18,-14,0], scale:[1,1.3,1] }}
          transition={{ duration:3.8, repeat:Infinity, ease:'easeInOut' }}
          className="absolute -top-2 -right-1 text-lg select-none pointer-events-none"
        >✨</motion.span>
      </motion.div>
    </div>
  );
}