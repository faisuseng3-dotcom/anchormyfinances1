// PBR Avatar Engine — Anchor Avatar v6 Memoji Edition
// Memoji-style: big head, soft round features, expressive, 3D-lit clothing

import React, { useId } from 'react';

// ─── Color Math ───────────────────────────────────────────────────────────────
export function hexBlend(a, b, t) {
  if (!a || !b) return a || b || '#888';
  const p = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const [r1,g1,b1] = p(a), [r2,g2,b2] = p(b);
  return '#' + [r1+(r2-r1)*t, g1+(g2-g1)*t, b1+(b2-b1)*t]
    .map(v => Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
}

export function hexAdjust(hex, amt) {
  if (!hex?.startsWith('#')) return hex || '#888';
  const n = parseInt(hex.slice(1),16);
  const r = Math.max(0,Math.min(255,(n>>16)+amt));
  const g = Math.max(0,Math.min(255,((n>>8)&0xff)+amt));
  const b = Math.max(0,Math.min(255,(n&0xff)+amt));
  return `#${[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}`;
}

// ─── Memoji Head — big, round, soft ──────────────────────────────────────────
function SculptedHead({ skin, faceShape, uid }) {
  const skinHi  = hexBlend(skin, '#FFFFFF', 0.42);
  const skinMid = skin;
  const skinDk  = hexBlend(skin, '#180800', 0.28);
  const skinSh  = hexBlend(skin, '#080000', 0.20);
  const sss     = hexBlend(skin, '#FF3311', 0.18);

  // Memoji proportions: wide, round face
  let rx=27, ry=28, jaw=20;
  if (faceShape==='round')  { rx=28; ry=26; jaw=22; }
  if (faceShape==='square') { rx=27; ry=25; jaw=25; }
  if (faceShape==='heart')  { rx=25; ry=28; jaw=14; }

  const cx=50, cy=58;
  // Very smooth, Memoji-style jaw — almost circular at top
  const jawPath = `
    M${cx-rx} ${cy-6}
    C${cx-rx-2} ${cy-ry} ${cx-rx+4} ${cy-ry-4} ${cx} ${cy-ry-2}
    C${cx+rx-4} ${cy-ry-4} ${cx+rx+2} ${cy-ry} ${cx+rx} ${cy-6}
    C${cx+rx+3} ${cy+8} ${cx+jaw+2} ${cy+ry-4} ${cx+jaw*.6} ${cy+ry+4}
    Q${cx} ${cy+ry+10} ${cx-jaw*.6} ${cy+ry+4}
    C${cx-jaw-2} ${cy+ry-4} ${cx-rx-3} ${cy+8} ${cx-rx} ${cy-6}Z`;

  return (
    <>
      <path d={jawPath} fill={`url(#${uid}_faceGrad)`} />
      <path d={jawPath} fill={`url(#${uid}_sss)`} />
      {/* Cheekbone highlight — big soft blush area */}
      <ellipse cx={cx-13} cy={cy+8} rx="16" ry="11" fill={`url(#${uid}_cheekL)`} />
      <ellipse cx={cx+13} cy={cy+8} rx="13" ry="9" fill={`url(#${uid}_cheekR)`} />
      {/* Jaw shadow */}
      <path d={jawPath} fill={`url(#${uid}_jawSh)`} />
      {/* Brow ridge highlight */}
      <ellipse cx={cx-2} cy={cy-ry+5} rx="18" ry="6" fill="rgba(255,255,255,0.13)" />
      {/* Nose-bridge shadow */}
      <path d={`M${cx} ${cy-ry+10} Q${cx-1} ${cy+4} ${cx} ${cy+14}`}
        stroke="rgba(0,0,0,0.055)" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      {/* Temple AO */}
      <ellipse cx={cx-rx+2} cy={cy-14} rx="6" ry="11" fill="rgba(0,0,0,0.055)" />
      <ellipse cx={cx+rx-2} cy={cy-14} rx="6" ry="11" fill="rgba(0,0,0,0.055)" />
      {/* Under-chin AO */}
      <ellipse cx={cx} cy={cy+ry+7} rx="17" ry="5.5" fill="rgba(0,0,0,0.13)" />
    </>
  );
}

// ─── PBR Eyes — large, Memoji-style ──────────────────────────────────────────
function PBREye({ cx, cy, eyeConfig, browConfig, lashConfig, uid }) {
  const col = eyeConfig?.color || '#2D4A6B';
  const type = eyeConfig?.type || 'almond';
  const brow = browConfig?.type || 'natural';
  const lash = lashConfig?.type || 'natural';
  const iHi  = hexBlend(col,'#FFFFFF',0.45);
  const iDk  = hexBlend(col,'#000000',0.55);
  const browCol = '#1C1008';

  // Memoji eyes are large and expressive
  const dims = { almond:[6,4.5], round:[6,6], cat:[6.5,4.5], hooded:[5,4], wide:[7,5.5] };
  const [rx, ry] = dims[type] || dims.almond;
  const catRot = type==='cat' ? `rotate(-10,${cx},${cy})` : '';

  const by = cy - 15;
  const bsw = brow==='thick' ? 5.5 : brow==='thin' ? 1.6 : 3.2;
  const bcy = brow==='arched' ? -9 : -7;

  const lashPts = lash==='dramatic'
    ? [[-8,-10],[-4,-12],[0,-12.5],[4,-12],[8,-10],[11,-8]]
    : [[-6,-7],[0,-8],[6,-7]];

  return (
    <g>
      {/* Eyebrow — thicker, rounder */}
      <path d={`M${cx-9} ${by+2} Q${cx+1} ${by+bcy} ${cx+9} ${by}`}
        stroke={browCol} strokeWidth={bsw} fill="none" strokeLinecap="round" />
      <path d={`M${cx-6} ${by+1} Q${cx} ${by+bcy+1} ${cx+6} ${by+0.5}`}
        stroke="rgba(255,255,255,0.10)" strokeWidth="0.9" fill="none" strokeLinecap="round" />

      {/* Socket shadow */}
      <ellipse cx={cx} cy={cy+ry+2.5} rx={rx+4} ry="2.5" fill="rgba(0,0,0,0.10)" />

      {/* Sclera */}
      <g transform={catRot}>
        <ellipse cx={cx} cy={cy} rx={rx+3.5} ry={ry+1.2} fill="white" />
        <ellipse cx={cx} cy={cy} rx={rx+3.5} ry={ry+1.2} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="0.8" />

        {/* Iris */}
        <defs>
          <radialGradient id={`${uid}_iris_${cx}`} cx="36%" cy="30%" r="68%">
            <stop offset="0%"   stopColor={iHi} />
            <stop offset="50%"  stopColor={col} />
            <stop offset="100%" stopColor={iDk} />
          </radialGradient>
        </defs>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${uid}_iris_${cx})`} />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="rgba(0,0,0,0.40)" strokeWidth="1" />

        {/* Pupil */}
        <ellipse cx={cx} cy={cy+0.4} rx={rx*.52} ry={ry*.52} fill="#030202" />

        {/* Upper lid AO */}
        <defs>
          <linearGradient id={`${uid}_lidao_${cx}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"  stopColor="rgba(0,0,0,0.42)" />
            <stop offset="55%" stopColor="rgba(0,0,0,0.07)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>
        <ellipse cx={cx} cy={cy-ry*.12} rx={rx+3.5} ry={(ry+1.2)*.50} fill={`url(#${uid}_lidao_${cx})`} />

        {/* Specular highlight — large, Memoji style */}
        <circle cx={cx-rx*.28} cy={cy-ry*.42} r={rx*.34} fill="white" opacity="0.98" />
        <circle cx={cx+rx*.35} cy={cy-ry*.28} r={rx*.18} fill="white" opacity="0.75" />
        <ellipse cx={cx} cy={cy-ry*.22} rx={rx+3.5} ry={(ry+1.2)*.38} fill="white" opacity="0.04" />
      </g>

      {/* Upper lid line */}
      <path d={`M${cx-rx-2.5} ${cy-ry*.7} Q${cx} ${cy-ry-1.5} ${cx+rx+2.5} ${cy-ry*.7}`}
        stroke="rgba(0,0,0,0.16)" strokeWidth="1.4" fill="none" />

      {/* Lashes */}
      {lash !== 'none' && lashPts.map(([dx,dy],i) => (
        <line key={i}
          x1={cx+dx*.55} y1={cy-ry-1.5}
          x2={cx+dx}     y2={cy-ry+dy}
          stroke="#080404"
          strokeWidth={lash==='dramatic' ? 2 : 1.5}
          strokeLinecap="round" />
      ))}
    </g>
  );
}

// ─── Nose — Memoji soft subtle ────────────────────────────────────────────────
function PBRNose({ noseConfig }) {
  const t = noseConfig?.type || 'button';
  const ao='rgba(0,0,0,0.10)', hi='rgba(255,255,255,0.18)', sh='rgba(0,0,0,0.07)';
  if (t==='wide') return <>
    <path d="M49 70 Q48 76 46 79 Q50 81 54 79 Q52 76 51 70 Z" fill={sh} />
    <ellipse cx="43" cy="78" rx="6" ry="4" fill={ao} />
    <ellipse cx="57" cy="78" rx="6" ry="4" fill={ao} />
    <ellipse cx="43.5" cy="76" rx="2.2" ry="1.5" fill={hi} />
    <ellipse cx="57.5" cy="76" rx="2.2" ry="1.5" fill={hi} />
  </>;
  if (t==='narrow') return <>
    <path d="M50 70 Q49 75 47 78 Q50 80 53 78 Q51 75 50 70 Z" fill={ao} opacity="0.8" />
    <ellipse cx="47.5" cy="79" rx="2.2" ry="1.6" fill={ao} />
    <ellipse cx="52.5" cy="79" rx="2.2" ry="1.6" fill={ao} />
    <ellipse cx="50" cy="71" rx="1" ry="1.5" fill={hi} opacity="0.7" />
  </>;
  if (t==='upturned') return <>
    <path d="M44 80 Q50 73 56 80" stroke={ao} strokeWidth="2.8" fill="none" strokeLinecap="round" />
    <ellipse cx="45" cy="80" rx="2.8" ry="2" fill={ao} />
    <ellipse cx="55" cy="80" rx="2.8" ry="2" fill={ao} />
    <ellipse cx="45.5" cy="79" rx="1.1" ry="0.9" fill={hi} />
    <ellipse cx="55.5" cy="79" rx="1.1" ry="0.9" fill={hi} />
  </>;
  // button
  return <>
    <path d="M49 70 Q48 75 47 78 Q50 80 53 78 Q52 75 51 70 Z" fill={sh} />
    <ellipse cx="50" cy="74" rx="6" ry="5" fill={ao} />
    <ellipse cx="47" cy="79" rx="2.7" ry="2" fill={ao} />
    <ellipse cx="53" cy="79" rx="2.7" ry="2" fill={ao} />
    <ellipse cx="49.5" cy="73" rx="2.2" ry="1.4" fill={hi} />
  </>;
}

// ─── Cheeks — Memoji style soft blush ────────────────────────────────────────
function PBRCheeks({ expression }) {
  const a = (expression==='happy'||expression==='excited') ? 0.42 : 0.16;
  return <>
    <ellipse cx="26" cy="72" rx="10" ry="6" fill={`rgba(255,100,80,${a})`} />
    <ellipse cx="74" cy="72" rx="10" ry="6" fill={`rgba(255,100,80,${a})`} />
    <ellipse cx="26" cy="72" rx="5" ry="3" fill={`rgba(255,160,140,${a*.5})`} />
    <ellipse cx="74" cy="72" rx="5" ry="3" fill={`rgba(255,160,140,${a*.5})`} />
  </>;
}

// ─── Mouth — Memoji style plump ───────────────────────────────────────────────
function PBRMouth({ mouthConfig, expression }) {
  const lc = mouthConfig?.lipColor || '#C48A8A';
  const dk = hexBlend(lc,'#000000',0.30);
  const hi = hexBlend(lc,'#FFFFFF',0.42);
  const MAP = { neutral:'smile', happy:'open', excited:'open', focused:'smirk' };
  const t = expression && expression!=='neutral' ? (MAP[expression]||mouthConfig?.type) : (mouthConfig?.type||'smile');

  if (t==='smirk') return <>
    <path d="M36 85 Q46 91 63 82" stroke="rgba(0,0,0,0.10)" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M36 84 Q46 90 63 81" stroke={lc} strokeWidth="3.2" fill="none" strokeLinecap="round" />
    <path d="M36 84 Q42 87 46 85" stroke={hi} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.45" />
    <circle cx="63" cy="81.5" r="1.4" fill={dk} opacity="0.42" />
  </>;
  if (t==='open') return <>
    <path d="M35 83 Q50 96 65 83" fill={lc} opacity="0.92" />
    <ellipse cx="50" cy="89" rx="12.5" ry="7" fill="#0E0404" />
    <ellipse cx="50" cy="86.5" rx="11" ry="4.5" fill="rgba(248,244,240,0.96)" />
    <path d="M35 83 Q50 96 65 83" stroke={dk} strokeWidth="1.3" fill="none" strokeLinecap="round" />
    <path d="M38 83.5 Q50 87 62 83.5" stroke={hi} strokeWidth="1" fill="none" opacity="0.38" strokeLinecap="round" />
  </>;
  if (t==='pouty') return <>
    <path d="M36 86 Q50 95 64 86 Q58 93 50 94 Q42 93 36 86Z" fill={lc} opacity="0.9"/>
    <path d="M36 86 Q50 91 64 86" stroke={dk} strokeWidth="1.2" fill="none"/>
    <path d="M40 86.5 Q50 89 60 86.5" stroke={hi} strokeWidth="0.9" fill="none" opacity="0.4" strokeLinecap="round"/>
    <ellipse cx="50" cy="87" rx="7" ry="2" fill={hi} opacity="0.25"/>
  </>;
  // smile (default)
  return <>
    <path d="M36 84 Q50 96 64 84" stroke="rgba(0,0,0,0.09)" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M36 83 Q50 95 64 83" stroke={lc} strokeWidth="3.2" fill="none" strokeLinecap="round" />
    <path d="M37 83 Q50 91 63 83" stroke={hi} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.40" />
    <circle cx="36.5" cy="83.5" r="1.6" fill={dk} opacity="0.28" />
    <circle cx="63.5" cy="83.5" r="1.6" fill={dk} opacity="0.28" />
  </>;
}

// ─── Neck + Ears ───────────────────────────────────────────────────────────────
function PBRBody({ skin }) {
  const dk = hexAdjust(skin, -20);
  const blush = 'rgba(210,90,70,0.08)';
  const innerEar = hexAdjust(skin, -10);
  return <>
    {/* Neck */}
    <path d="M43 89 Q43 106 44.5 107 Q50 110 55.5 107 Q57 106 57 89 Z" fill={skin} />
    <path d="M43 89 Q43 103 44.5 107" stroke={dk} strokeWidth="2" fill="none" opacity="0.30" strokeLinecap="round"/>
    <path d="M55 90 Q56 103 55.5 107" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Left ear — bigger, rounder */}
    <ellipse cx="23" cy="63" rx="6" ry="7.5" fill={skin} />
    <ellipse cx="25" cy="63" rx="3.5" ry="6.5" fill={dk} opacity="0.20" />
    <ellipse cx="22.5" cy="63" rx="3" ry="4.5" fill={innerEar} />
    <ellipse cx="22.5" cy="63" rx="1.6" ry="2.8" fill={blush} />
    <ellipse cx="19" cy="63" rx="2.2" ry="4.5" fill="rgba(255,150,100,0.15)" />
    {/* Right ear */}
    <ellipse cx="77" cy="63" rx="6" ry="7.5" fill={skin} />
    <ellipse cx="75" cy="63" rx="3.5" ry="6.5" fill={dk} opacity="0.20" />
    <ellipse cx="77.5" cy="63" rx="3" ry="4.5" fill={innerEar} />
    <ellipse cx="77.5" cy="63" rx="1.6" ry="2.8" fill={blush} />
    <ellipse cx="81" cy="63" rx="2.2" ry="4.5" fill="rgba(255,150,100,0.15)" />
  </>;
}

// ─── Defs ─────────────────────────────────────────────────────────────────────
function PBRDefs({ uid, skin, bg, eyeColor }) {
  const skinHi  = hexBlend(skin,'#FFFFFF',0.35);
  const skinDk  = hexBlend(skin,'#1A0800',0.30);
  const skinSh  = hexBlend(skin,'#0A0200',0.20);
  const skinSSS = hexBlend(skin,'#FF4422',0.18);
  return (
    <defs>
      <radialGradient id={`${uid}_faceGrad`} cx="30%" cy="20%" r="78%">
        <stop offset="0%"   stopColor={skinHi}  />
        <stop offset="38%"  stopColor={skin}     />
        <stop offset="72%"  stopColor={skinDk}   />
        <stop offset="100%" stopColor={skinSh}   />
      </radialGradient>
      <radialGradient id={`${uid}_sss`} cx="50%" cy="50%" r="50%">
        <stop offset="50%"  stopColor={skinSSS} stopOpacity="0" />
        <stop offset="80%"  stopColor={skinSSS} stopOpacity="0.22" />
        <stop offset="100%" stopColor={skinSSS} stopOpacity="0.42" />
      </radialGradient>
      <radialGradient id={`${uid}_cheekL`} cx="25%" cy="55%" r="42%">
        <stop offset="0%"   stopColor={skinHi} stopOpacity="0.55" />
        <stop offset="100%" stopColor={skinHi} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}_cheekR`} cx="75%" cy="55%" r="38%">
        <stop offset="0%"   stopColor={skinHi} stopOpacity="0.20" />
        <stop offset="100%" stopColor={skinHi} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}_jawSh`} cx="50%" cy="100%" r="52%">
        <stop offset="0%"   stopColor={skinSh} stopOpacity="0.48" />
        <stop offset="100%" stopColor={skinSh} stopOpacity="0" />
      </radialGradient>
      {/* 3-point lighting */}
      <radialGradient id={`${uid}_key`} cx="26%" cy="10%" r="72%">
        <stop offset="0%"   stopColor="#FFF9F0" stopOpacity="0.70" />
        <stop offset="50%"  stopColor="#FFE8D0" stopOpacity="0.20" />
        <stop offset="100%" stopColor="#FFE5CC" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}_fill`} cx="88%" cy="60%" r="52%">
        <stop offset="0%"   stopColor="#AACCFF" stopOpacity="0.20" />
        <stop offset="100%" stopColor="#AACCFF" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}_rim`} cx="50%" cy="0%" r="60%">
        <stop offset="0%"   stopColor="white" stopOpacity="0.90" />
        <stop offset="30%"  stopColor="white" stopOpacity="0.28" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}_rimL`} cx="0%" cy="30%" r="45%">
        <stop offset="0%"   stopColor="white" stopOpacity="0.38" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}_bgTint`} cx="50%" cy="35%" r="62%">
        <stop offset="0%"   stopColor={bg} stopOpacity="0.28" />
        <stop offset="100%" stopColor={bg} stopOpacity="0.02" />
      </radialGradient>
      <linearGradient id={`${uid}_hairSh`} x1="12%" y1="0%" x2="72%" y2="55%">
        <stop offset="0%"   stopColor="white" stopOpacity="0.48" />
        <stop offset="38%"  stopColor="white" stopOpacity="0.12" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>
      {/* Clothing 3D gradient — vertical */}
      <linearGradient id={`${uid}_clothTop`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="white" stopOpacity="0.22" />
        <stop offset="40%"  stopColor="white" stopOpacity="0.06" />
        <stop offset="100%" stopColor="black" stopOpacity="0.18" />
      </linearGradient>
      <linearGradient id={`${uid}_clothSide`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="black" stopOpacity="0.18" />
        <stop offset="20%"  stopColor="black" stopOpacity="0.06" />
        <stop offset="50%"  stopColor="white" stopOpacity="0.10" />
        <stop offset="80%"  stopColor="black" stopOpacity="0.05" />
        <stop offset="100%" stopColor="black" stopOpacity="0.22" />
      </linearGradient>
      {/* Fabric noise */}
      <filter id={`${uid}_fabric`} x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="4" seed="5" result="noise"/>
        <feColorMatrix type="matrix"
          values="0 0 0 0 0.88  0 0 0 0 0.88  0 0 0 0 0.88  0 0 0 0.13 0"
          in="noise" result="tinted"/>
        <feBlend in="SourceGraphic" in2="tinted" mode="multiply"/>
      </filter>
      {/* Rim glow */}
      <filter id={`${uid}_rimGlow`} x="-22%" y="-22%" width="144%" height="144%">
        <feMorphology operator="dilate" radius="2.5" in="SourceAlpha" result="dilated"/>
        <feGaussianBlur stdDeviation="1.6" in="dilated" result="soft"/>
        <feFlood floodColor="white" floodOpacity="0.90" result="white"/>
        <feComposite in="white" in2="soft" operator="in" result="rim"/>
        <feMerge><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
  );
}

// ─── Hair Back ────────────────────────────────────────────────────────────────
export const LONG_HAIR_STYLES = ['long_straight','curly_big','ponytail','bob'];

export function HairBack({ style, color, uid }) {
  const hc = color || '#1C1008';
  const sh = hexAdjust(hc,-35);
  if (style==='long_straight') return <>
    <path d="M16 38 Q11 65 13 98 Q17 106 22 98 Q24 65 20 38 Z" fill={hc} />
    <path d="M84 38 Q89 65 87 98 Q83 106 78 98 Q76 65 80 38 Z" fill={hc} />
    <path d="M17 38 Q13 62 14 94" stroke={sh} strokeWidth="2.5" fill="none" opacity="0.30" strokeLinecap="round"/>
  </>;
  if (style==='curly_big') return <>
    <ellipse cx="14" cy="52" rx="13" ry="16" fill={hc} />
    <ellipse cx="86" cy="52" rx="13" ry="16" fill={hc} />
    <ellipse cx="12" cy="70" rx="11" ry="13" fill={hc} />
    <ellipse cx="88" cy="70" rx="11" ry="13" fill={hc} />
  </>;
  if (style==='ponytail') return <>
    <path d="M66 30 Q62 50 64 72 Q68 80 72 72 Q76 50 74 30 Z" fill={hc} />
    <rect x="62" y="70" width="14" height="5" rx="2.5" fill={hexAdjust(hc,-12)} />
  </>;
  if (style==='bob') return <>
    <path d="M15 30 Q10 50 12 67 Q16 72 22 67 Q24 50 20 30 Z" fill={hc} />
    <path d="M85 30 Q90 50 88 67 Q84 72 78 67 Q76 50 80 30 Z" fill={hc} />
  </>;
  return null;
}

// ─── Hair Front — Memoji round hair with volume ───────────────────────────────
export function HairFront({ style, color }) {
  const hc = color || '#1C1008';
  const hi = hexAdjust(hc, 30);
  const sh = hexAdjust(hc,-30);

  switch(style) {
    case 'medium_wave': return <>
      <ellipse cx="50" cy="28" rx="35" ry="22" fill={hc} />
      <path d="M16 34 Q12 52 16 64" stroke={hc} strokeWidth="15" fill="none" strokeLinecap="round"/>
      <path d="M84 34 Q88 52 84 64" stroke={hc} strokeWidth="15" fill="none" strokeLinecap="round"/>
      <path d="M17 34 Q14 52 17 62" stroke={sh} strokeWidth="3" fill="none" opacity="0.30" strokeLinecap="round"/>
      <ellipse cx="41" cy="20" rx="15" ry="6" fill={hi} opacity="0.30"/>
    </>;
    case 'long_straight': return <>
      <ellipse cx="50" cy="26" rx="35" ry="21" fill={hc} />
      <ellipse cx="41" cy="19" rx="14" ry="5" fill={hi} opacity="0.28"/>
    </>;
    case 'curly_big': return <>
      <ellipse cx="50" cy="22" rx="38" ry="25" fill={hc} />
      <circle cx="18" cy="34" r="13" fill={hc} />
      <circle cx="82" cy="34" r="13" fill={hc} />
      <ellipse cx="41" cy="13" rx="15" ry="6" fill={hi} opacity="0.24"/>
    </>;
    case 'bun_top': return <>
      <rect x="20" y="30" width="60" height="18" rx="9" fill={hc} />
      <circle cx="50" cy="14" r="16" fill={hc} />
      <circle cx="44" cy="9" r="8" fill={hi} opacity="0.22"/>
      <rect x="20" y="30" width="60" height="5" rx="4" fill={sh} opacity="0.32"/>
    </>;
    case 'undercut': return <>
      <rect x="15" y="28" width="14" height="20" rx="7" fill={hexAdjust(hc,-8)} opacity="0.7"/>
      <rect x="71" y="28" width="14" height="20" rx="7" fill={hexAdjust(hc,-8)} opacity="0.7"/>
      <rect x="20" y="18" width="60" height="24" rx="10" fill={hc} />
      <ellipse cx="41" cy="21" rx="14" ry="5.5" fill={hi} opacity="0.27"/>
    </>;
    case 'afro': return <>
      <ellipse cx="50" cy="18" rx="40" ry="30" fill={hc} />
      <ellipse cx="17" cy="36" rx="15" ry="18" fill={hc} />
      <ellipse cx="83" cy="36" rx="15" ry="18" fill={hc} />
      <ellipse cx="41" cy="8" rx="16" ry="7" fill={hi} opacity="0.20"/>
    </>;
    case 'ponytail': return <>
      <rect x="20" y="22" width="60" height="22" rx="10" fill={hc} />
      <ellipse cx="41" cy="25" rx="13" ry="5" fill={hi} opacity="0.26"/>
    </>;
    case 'bob': return <>
      <ellipse cx="50" cy="26" rx="35" ry="19" fill={hc} />
      <path d="M18 24 Q15 35 17 46" stroke={sh} strokeWidth="3.5" fill="none" opacity="0.28" strokeLinecap="round"/>
      <path d="M82 24 Q85 35 83 46" stroke={sh} strokeWidth="3.5" fill="none" opacity="0.28" strokeLinecap="round"/>
      <ellipse cx="41" cy="19" rx="12" ry="4.5" fill={hi} opacity="0.27"/>
    </>;
    case 'bald': return <>
      <ellipse cx="42" cy="38" rx="15" ry="7" fill="rgba(255,255,255,0.08)" />
    </>;
    default: // short_clean
      return <>
        <ellipse cx="50" cy="27" rx="33" ry="19" fill={hc} />
        <rect x="17" y="26" width="14" height="14" rx="7" fill={hc} />
        <rect x="69" y="26" width="14" height="14" rx="7" fill={hc} />
        <ellipse cx="41" cy="19" rx="13" ry="5" fill={hi} opacity="0.27"/>
      </>;
  }
}

// ─── Outfit — 3D-lit, Memoji-style clothing ────────────────────────────────────
export function Outfit({ config, uid }) {
  const cc = config?.color || '#0D7377';
  const st = config?.style || 'tshirt';
  const dk   = hexAdjust(cc,-36);
  const dkk  = hexAdjust(cc,-60);
  const lt   = hexAdjust(cc, 32);
  const llt  = hexAdjust(cc, 55);
  const fold = hexAdjust(cc,-45);
  const rim  = hexBlend(cc,'#FFFFFF',0.28);

  switch(st) {
    case 'hoodie': return <>
      {/* Body */}
      <path d="M4 108 Q8 76 50 74 Q92 76 96 108 L100 130 L0 130 Z" fill={cc} />
      {/* Shoulder seams */}
      <path d="M8 76 Q22 70 30 76" stroke={fold} strokeWidth="1.8" fill="none" opacity="0.5" strokeLinecap="round"/>
      <path d="M92 76 Q78 70 70 76" stroke={fold} strokeWidth="1.8" fill="none" opacity="0.5" strokeLinecap="round"/>
      {/* Center fold lines */}
      <path d="M22 84 Q20 100 22 116" stroke={fold} strokeWidth="2.2" fill="none" opacity="0.38" strokeLinecap="round"/>
      <path d="M78 84 Q80 100 78 116" stroke={fold} strokeWidth="2.2" fill="none" opacity="0.38" strokeLinecap="round"/>
      {/* Hood */}
      <path d="M28 74 Q36 56 50 74 Q64 56 72 74 L68 88 Q50 81 32 88 Z" fill={dk} />
      <path d="M32 74 Q50 68 68 74 L66 82 Q50 76 34 82 Z" fill={dkk} opacity="0.45"/>
      <ellipse cx="50" cy="77" rx="5.5" ry="3" fill={dkk} opacity="0.65" />
      {/* Kangaroo pocket */}
      <rect x="30" y="104" width="40" height="18" rx="6" fill={dk} opacity="0.42" />
      <path d="M50 104 L50 122" stroke={fold} strokeWidth="1.2" fill="none" opacity="0.35"/>
      {/* 3D lighting */}
      <path d="M4 108 Q8 76 50 74 Q92 76 96 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothTop)`} />
      <path d="M4 108 Q8 76 50 74 Q92 76 96 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothSide)`} />
      {/* Rim highlight on shoulder */}
      <path d="M8 82 Q22 76 36 80" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
      <path d="M92 82 Q78 76 64 80" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
    </>;

    case 'blazer': return <>
      {/* Jacket body */}
      <path d="M4 108 Q8 76 50 74 Q92 76 96 108 L100 130 L0 130 Z" fill={cc} />
      {/* Lapels — white shirt underneath */}
      <path d="M42 74 L34 100 L50 90 Z" fill="white" opacity="0.94" />
      <path d="M58 74 L66 100 L50 90 Z" fill="white" opacity="0.94" />
      <path d="M42 74 L40 84 L50 78 L60 84 L58 74 L50 77 Z" fill={dkk} opacity="0.28"/>
      {/* Buttons */}
      {[96,108,120].map(y=><g key={y}>
        <circle cx="50" cy={y} r="2.5" fill={dkk} opacity="0.55" />
        <circle cx="49" cy={y-.9} r="0.8" fill="rgba(255,255,255,0.38)" />
      </g>)}
      {/* Collar shadow */}
      <path d="M36 74 Q50 80 64 74" stroke={fold} strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round"/>
      {/* Pocket square */}
      <path d="M64 82 L72 82 L72 74 Z" fill="white" opacity="0.65"/>
      {/* 3D lighting */}
      <path d="M4 108 Q8 76 50 74 Q92 76 96 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothTop)`} />
      <path d="M4 108 Q8 76 50 74 Q92 76 96 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothSide)`} />
      <path d="M8 82 Q22 76 36 80" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
      <path d="M92 82 Q78 76 64 80" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
    </>;

    case 'suit': return <>
      <path d="M4 108 Q8 76 50 74 Q92 76 96 108 L100 130 L0 130 Z" fill={cc} />
      <path d="M42 74 L38 130 L50 118 L62 130 L58 74 L50 78 Z" fill="white" opacity="0.95" />
      {/* Tie */}
      <path d="M46.5 78 L50 83.5 L53.5 78 L52 110 L50 112 L48 110 Z" fill="#C0392B" />
      <path d="M46.5 78 L50 83.5 L53.5 78 L52 85 Z" fill="#922B21" />
      {/* Jacket lapels */}
      <path d="M42 74 L36 86 L50 80 Z" fill={dk} opacity="0.3"/>
      <path d="M58 74 L64 86 L50 80 Z" fill={dk} opacity="0.3"/>
      <path d="M4 108 Q8 76 50 74 Q92 76 96 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothTop)`} />
      <path d="M4 108 Q8 76 50 74 Q92 76 96 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothSide)`} />
      <path d="M8 82 Q22 76 36 80" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
      <path d="M92 82 Q78 76 64 80" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
    </>;

    case 'turtleneck': return <>
      <path d="M8 108 Q12 78 50 76 Q88 78 92 108 L100 130 L0 130 Z" fill={cc} />
      {/* Turtleneck collar */}
      <path d="M30 64 Q50 60 70 64 Q70 76 50 78 Q30 76 30 64 Z" fill={lt} opacity="0.85"/>
      <path d="M30 70 Q50 74 70 70 Q70 76 50 78 Q30 76 30 70 Z" fill={dk} opacity="0.25"/>
      {/* Collar fold line */}
      <path d="M32 66 Q50 70 68 66" stroke="rgba(255,255,255,0.22)" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M8 108 Q12 78 50 76 Q88 78 92 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothTop)`} />
      <path d="M8 108 Q12 78 50 76 Q88 78 92 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothSide)`} />
      <path d="M12 84 Q24 78 38 82" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
      <path d="M88 84 Q76 78 62 82" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
    </>;

    case 'bomber': return <>
      <path d="M4 108 Q6 74 50 72 Q94 74 96 108 L100 130 L0 130 Z" fill={cc} />
      {/* Bomber collar */}
      <path d="M33 67 Q50 64 67 67 L67 78 Q50 75 33 78 Z" fill={dk} opacity="0.80" />
      {/* Bottom ribbing */}
      <path d="M4 118 Q50 122 96 118 L96 126 Q50 130 4 126 Z" fill={dk} opacity="0.55"/>
      {/* Center zip */}
      <path d="M50 72 L50 130" stroke="rgba(255,255,255,0.14)" strokeWidth="1.8"/>
      {/* Zip pull */}
      <rect x="48" y="80" width="4" height="6" rx="1" fill={dkk} opacity="0.7"/>
      <path d="M4 108 Q6 74 50 72 Q94 74 96 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothTop)`} />
      <path d="M4 108 Q6 74 50 72 Q94 74 96 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothSide)`} />
      <path d="M6 80 Q22 74 36 78" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
      <path d="M94 80 Q78 74 64 78" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
    </>;

    case 'denim': return <>
      <path d="M8 108 Q12 78 50 76 Q88 78 92 108 L100 130 L0 130 Z" fill={cc} />
      {/* Chest pocket */}
      <rect x="54" y="82" width="20" height="14" rx="2.5" fill={dk} opacity="0.40"/>
      <path d="M55 88 L73 88" stroke="rgba(255,255,255,0.10)" strokeWidth="0.7"/>
      {/* Collar */}
      <path d="M36 74 Q50 80 64 74 L62 78 Q50 83 38 78 Z" fill={dk} opacity="0.5"/>
      {/* Thread detail */}
      <path d="M12 100 Q14 108 12 116" stroke="rgba(255,220,80,0.28)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
      <path d="M88 100 Q86 108 88 116" stroke="rgba(255,220,80,0.28)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
      <path d="M8 108 Q12 78 50 76 Q88 78 92 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothTop)`} />
      <path d="M8 108 Q12 78 50 76 Q88 78 92 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothSide)`} />
      <path d="M12 84 Q24 78 38 82" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
      <path d="M88 84 Q76 78 62 82" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
    </>;

    case 'sport': return <>
      <path d="M4 108 Q8 76 50 74 Q92 76 96 108 L100 130 L0 130 Z" fill={cc} />
      {/* Side stripes */}
      <path d="M4 108 Q8 76 18 74 L22 130 Z" fill={llt} opacity="0.35" />
      <path d="M96 108 Q92 76 82 74 L78 130 Z" fill={llt} opacity="0.35" />
      {/* Logo circle */}
      <circle cx="50" cy="93" r="9" fill={dk} opacity="0.30"/>
      <circle cx="50" cy="93" r="6" fill={dk} opacity="0.20"/>
      {/* Collar */}
      <path d="M36 74 Q50 80 64 74 L62 78 Q50 84 38 78 Z" fill={dk} opacity="0.4"/>
      <path d="M4 108 Q8 76 50 74 Q92 76 96 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothTop)`} />
      <path d="M4 108 Q8 76 50 74 Q92 76 96 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothSide)`} />
      <path d="M8 82 Q22 76 36 80" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
      <path d="M92 82 Q78 76 64 80" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
    </>;

    default: // tshirt
      return <>
        <path d="M8 108 Q12 78 50 76 Q88 78 92 108 L100 130 L0 130 Z" fill={cc} />
        {/* Shoulder fold lines */}
        <path d="M14 84 Q16 100 14 118" stroke={fold} strokeWidth="2" fill="none" opacity="0.28" strokeLinecap="round"/>
        <path d="M86 84 Q84 100 86 118" stroke={fold} strokeWidth="2" fill="none" opacity="0.28" strokeLinecap="round"/>
        {/* Neckline */}
        <path d="M38 76 Q50 83 62 76" stroke={dk} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.38"/>
        {/* Chest highlight */}
        <ellipse cx="38" cy="88" rx="14" ry="7" fill={llt} opacity="0.11"/>
        {/* 3D lighting */}
        <path d="M8 108 Q12 78 50 76 Q88 78 92 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothTop)`} />
        <path d="M8 108 Q12 78 50 76 Q88 78 92 108 L100 130 L0 130 Z" fill={`url(#${uid}_clothSide)`} />
        {/* Rim highlight on shoulders */}
        <path d="M12 84 Q24 78 38 82" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
        <path d="M88 84 Q76 78 62 82" stroke={rim} strokeWidth="1.4" fill="none" opacity="0.50" strokeLinecap="round"/>
      </>;
  }
}

// ─── Accessories — more detailed ───────────────────────────────────────────────
export function Accessory({ type }) {
  switch(type) {
    case 'glasses_round': return <>
      <ellipse cx="34" cy="62" rx="11" ry="3.5" fill="rgba(0,0,0,0.12)" />
      <ellipse cx="66" cy="62" rx="11" ry="3.5" fill="rgba(0,0,0,0.12)" />
      <circle cx="34" cy="58" r="11" fill="rgba(140,200,255,0.08)" stroke="#1a1a1a" strokeWidth="2.8" opacity="0.82"/>
      <circle cx="66" cy="58" r="11" fill="rgba(140,200,255,0.08)" stroke="#1a1a1a" strokeWidth="2.8" opacity="0.82"/>
      {/* Lens shine */}
      <path d="M26 53 Q34 50 40 53" stroke="rgba(255,255,255,0.38)" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M58 53 Q66 50 72 53" stroke="rgba(255,255,255,0.38)" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      {/* Bridge */}
      <line x1="45" y1="58" x2="55" y2="58" stroke="#1a1a1a" strokeWidth="2.2" opacity="0.78"/>
      {/* Arms */}
      <line x1="21" y1="55" x2="23.5" y2="58" stroke="#1a1a1a" strokeWidth="2.5" opacity="0.8"/>
      <line x1="79" y1="55" x2="76.5" y2="58" stroke="#1a1a1a" strokeWidth="2.5" opacity="0.8"/>
    </>;
    case 'glasses_square': return <>
      <ellipse cx="34" cy="62" rx="12" ry="3.5" fill="rgba(0,0,0,0.12)"/>
      <ellipse cx="66" cy="62" rx="12" ry="3.5" fill="rgba(0,0,0,0.12)"/>
      <rect x="22" y="52" width="24" height="14" rx="4" fill="rgba(140,200,255,0.08)" stroke="#1a1a1a" strokeWidth="2.6" opacity="0.82"/>
      <rect x="54" y="52" width="24" height="14" rx="4" fill="rgba(140,200,255,0.08)" stroke="#1a1a1a" strokeWidth="2.6" opacity="0.82"/>
      <path d="M24 54 L36 54" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M56 54 L68 54" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <line x1="46" y1="59" x2="54" y2="59" stroke="#1a1a1a" strokeWidth="2.2" opacity="0.78"/>
      <line x1="20" y1="55" x2="22.5" y2="58.5" stroke="#1a1a1a" strokeWidth="2.5" opacity="0.8"/>
      <line x1="80" y1="55" x2="77.5" y2="58.5" stroke="#1a1a1a" strokeWidth="2.5" opacity="0.8"/>
    </>;
    case 'sunglasses': return <>
      <ellipse cx="50" cy="64" rx="28" ry="4" fill="rgba(0,0,0,0.18)"/>
      {/* Gradient tinted lenses */}
      <path d="M22 58 Q34 50 48 58 L47 67 Q34 70 23 67 Z" fill="#0a0a0a" opacity="0.92"/>
      <path d="M52 58 Q66 50 78 58 L77 67 Q66 70 53 67 Z" fill="#0a0a0a" opacity="0.92"/>
      {/* Shine */}
      <path d="M25 54 Q34 51 45 54" stroke="rgba(255,255,255,0.24)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M55 54 Q66 51 75 54" stroke="rgba(255,255,255,0.24)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <circle cx="28" cy="55" r="1.8" fill="rgba(255,255,255,0.28)"/>
      <circle cx="56" cy="55" r="1.8" fill="rgba(255,255,255,0.28)"/>
      {/* Bridge + arms */}
      <path d="M48 58 Q50 55 52 58" stroke="#111" strokeWidth="2.8" fill="none"/>
      <line x1="20" y1="54" x2="23" y2="58" stroke="#111" strokeWidth="3"/>
      <line x1="80" y1="54" x2="77" y2="58" stroke="#111" strokeWidth="3"/>
    </>;
    case 'cap': return <>
      <ellipse cx="50" cy="34" rx="36" ry="5.5" fill="rgba(0,0,0,0.18)"/>
      <path d="M16 30 Q18 14 50 13 Q82 14 84 30 Q72 34 50 35 Q28 34 16 30 Z" fill="#2A2A2A"/>
      {/* Brim */}
      <path d="M14 32 Q28 38 50 38 Q72 38 86 32 L88 38 Q72 44 50 44 Q28 44 12 38 Z" fill="#1a1a1a" opacity="0.92"/>
      {/* Brim highlight */}
      <path d="M16 34 Q50 40 84 34" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Crown seam */}
      <path d="M16 30 Q50 34 84 30 Q80 32 50 33 Q20 32 16 30 Z" fill="#111" opacity="0.55"/>
      {/* Logo area */}
      <ellipse cx="42" cy="18" rx="11" ry="4.5" fill="rgba(255,255,255,0.07)"/>
    </>;
    case 'beanie': return <>
      <path d="M16 30 Q14 14 50 11 Q86 14 84 30 L82 44 Q50 48 18 44 Z" fill="#A78BFA"/>
      {/* Ribbing lines */}
      {[20,24,28,32,36,40].map(y=><path key={y} d={`M${16+(y-18)*.4} ${y} Q50 ${y+1.5} ${84-(y-18)*.4} ${y}`} stroke="#8B5CF6" strokeWidth="0.8" fill="none" opacity="0.55"/>)}
      {/* Fold at bottom */}
      <path d="M18 38 Q50 42 82 38 L82 44 Q50 48 18 44 Z" fill="#8B5CF6" opacity="0.65"/>
      {/* Pom pom */}
      <circle cx="50" cy="9" r="12" fill="#C4B5FD"/>
      <circle cx="50" cy="9" r="8" fill="#DDD6FE"/>
      <circle cx="46" cy="5" r="3" fill="rgba(255,255,255,0.48)"/>
      <ellipse cx="38" cy="18" rx="12" ry="4.5" fill="rgba(255,255,255,0.14)"/>
    </>;
    case 'earrings': return <>
      {/* Left */}
      <circle cx="19" cy="66" r="5.5" fill="#C8960A"/>
      <circle cx="17.5" cy="64.5" r="2.2" fill="#F5D060"/>
      <circle cx="17" cy="64" r="0.8" fill="rgba(255,255,255,0.58)"/>
      {/* Right */}
      <circle cx="81" cy="66" r="5.5" fill="#C8960A"/>
      <circle cx="79.5" cy="64.5" r="2.2" fill="#F5D060"/>
      <circle cx="79" cy="64" r="0.8" fill="rgba(255,255,255,0.58)"/>
    </>;
    case 'headband': return <>
      <path d="M17 36 Q50 43 83 36" stroke="rgba(0,0,0,0.20)" strokeWidth="4.5" fill="none"/>
      <path d="M16 30 Q50 37 84 30 L84 40 Q50 47 16 40 Z" fill="#FC8181"/>
      {/* Texture stripes */}
      {[33,36,39].map(y=><path key={y} d={`M17 ${y} Q50 ${y+1.5} 83 ${y}`} stroke="#E57373" strokeWidth="0.8" fill="none" opacity="0.45"/>)}
      {/* Highlight */}
      <path d="M18 31 Q50 38 82 31" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      {/* Shadow under */}
      <path d="M16 40 Q50 47 84 40" stroke="rgba(0,0,0,0.12)" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </>;
    default: return null;
  }
}

// ─── MAIN SVG EXPORT ──────────────────────────────────────────────────────────
export function AvatarSVG({ config, size = 100, expression }) {
  const reactId = useId().replace(/:/g,'_');
  const uid = `av${reactId}`;
  const c   = config || {};
  const bg  = c.bg || '#0D7377';
  const skin = c.skinColor || '#FFDBAC';
  const isLong = LONG_HAIR_STYLES.includes(c.hair?.style);
  const expr = expression || c.expression || 'neutral';

  return (
    <svg width={size} height={size} viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <PBRDefs uid={uid} skin={skin} bg={bg} eyeColor={c.eyes?.color} />

      {/* BG ambient */}
      <circle cx="50" cy="65" r="68" fill={`url(#${uid}_bgTint)`} />

      {/* L0: Back hair */}
      {isLong && <HairBack style={c.hair?.style} color={c.hair?.color} uid={uid} />}

      {/* L1: Body/ears/neck */}
      <PBRBody skin={skin} />

      {/* L2: Outfit with 3D lighting */}
      <g filter={`url(#${uid}_fabric)`}>
        <Outfit config={c.outfit} uid={uid} />
      </g>

      {/* L3: Sculpted face */}
      <SculptedHead skin={skin} faceShape={c.faceShape} uid={uid} />

      {/* L4: Eyes */}
      <PBREye cx={35} cy={58} eyeConfig={c.eyes} browConfig={c.eyebrows} lashConfig={c.eyelashes} uid={uid} />
      <PBREye cx={65} cy={58} eyeConfig={c.eyes} browConfig={c.eyebrows} lashConfig={c.eyelashes} uid={uid} />

      {/* L5: Nose */}
      <PBRNose noseConfig={c.nose} />

      {/* L6: Cheeks */}
      <PBRCheeks expression={expr} />

      {/* L7: Mouth */}
      <PBRMouth mouthConfig={c.mouth} expression={expr} />

      {/* L8: Front hair + rim glow */}
      <g filter={`url(#${uid}_rimGlow)`}>
        <HairFront style={c.hair?.style} color={c.hair?.color} />
        {c.hair?.style !== 'bald' && (
          <ellipse cx="41" cy="21" rx="22" ry="9" fill={`url(#${uid}_hairSh)`} />
        )}
      </g>

      {/* L9: Accessories */}
      <Accessory type={c.accessory} />

      {/* ── 3-POINT LIGHTING ── */}
      <ellipse cx="32" cy="38" rx="32" ry="28" fill={`url(#${uid}_key)`} />
      <ellipse cx="50" cy="12" rx="46" ry="24" fill={`url(#${uid}_rim)`} />
      <ellipse cx="8" cy="48" rx="24" ry="40" fill={`url(#${uid}_rimL)`} />
      <ellipse cx="88" cy="60" rx="40" ry="46" fill={`url(#${uid}_fill)`} />
    </svg>
  );
}