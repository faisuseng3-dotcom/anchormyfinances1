// PBR Avatar Engine — Anchor Avatar v5
// Physical Based Rendering: SSS skin, 3-point lighting, sculpted geometry, rim glow
// Every face has volume. No flat shapes. No plastic skin.

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

// ─── Sculpted Head / Face ─────────────────────────────────────────────────────
function SculptedHead({ skin, faceShape, uid }) {
  const skinHi  = hexBlend(skin, '#FFFFFF', 0.32);
  const skinMid = skin;
  const skinDk  = hexBlend(skin, '#180800', 0.34);
  const skinSh  = hexBlend(skin, '#080000', 0.24);
  const sss     = hexBlend(skin, '#FF3311', 0.22);

  // Face shape dimensions
  let W=23, H=26, jaw=18;
  if (faceShape==='round')  { W=24; H=22; jaw=21; }
  if (faceShape==='square') { W=25; H=21; jaw=24; }
  if (faceShape==='heart')  { W=22; H=25; jaw=13; }

  const cx=50, cy=54;
  // S-curve jaw path — anatomically correct
  const jawPath = `
    M${cx-W} ${cy-4}
    Q${cx-W-1} ${cy-H} ${cx} ${cy-H}
    Q${cx+W+1} ${cy-H} ${cx+W} ${cy-4}
    Q${cx+W+2} ${cy+5} ${cx+jaw} ${cy+H-2}
    Q${cx+jaw*.5} ${cy+H+4} ${cx} ${cy+H+5}
    Q${cx-jaw*.5} ${cy+H+4} ${cx-jaw} ${cy+H-2}
    Q${cx-W-2} ${cy+5} ${cx-W} ${cy-4}Z`;

  return (
    <>
      <path d={jawPath} fill={`url(#${uid}_faceGrad)`} />
      <path d={jawPath} fill={`url(#${uid}_sss)`} />
      {/* Cheekbone key-light highlight */}
      <ellipse cx={cx-10} cy={cy+5} rx="14" ry="9" fill={`url(#${uid}_cheekL)`} />
      <ellipse cx={cx+10} cy={cy+5} rx="11" ry="7" fill={`url(#${uid}_cheekR)`} />
      {/* Jaw shadow */}
      <path d={jawPath} fill={`url(#${uid}_jawSh)`} />
      {/* Brow ridge micro-highlight */}
      <ellipse cx={cx-2} cy={cy-H+7} rx="16" ry="5" fill="rgba(255,255,255,0.10)" />
      {/* Nose-bridge shadow line */}
      <path d={`M${cx} ${cy-H+11} Q${cx-1} ${cy+3} ${cx} ${cy+13}`}
        stroke="rgba(0,0,0,0.06)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Temple AO */}
      <ellipse cx={cx-W+1} cy={cy-13} rx="5" ry="9" fill="rgba(0,0,0,0.06)" />
      <ellipse cx={cx+W-1} cy={cy-13} rx="5" ry="9" fill="rgba(0,0,0,0.06)" />
      {/* Under-chin AO */}
      <ellipse cx={cx} cy={cy+H+3} rx="15" ry="5" fill="rgba(0,0,0,0.15)" />
      {/* Jawline crease */}
      <path d={`M${cx-jaw} ${cy+H-2} Q${cx} ${cy+H+5} ${cx+jaw} ${cy+H-2}`}
        stroke="rgba(0,0,0,0.09)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  );
}

// ─── PBR Eyes ─────────────────────────────────────────────────────────────────
function PBREye({ cx, cy, eyeConfig, browConfig, lashConfig, uid }) {
  const col = eyeConfig?.color || '#2D4A6B';
  const type = eyeConfig?.type || 'almond';
  const brow = browConfig?.type || 'natural';
  const lash = lashConfig?.type || 'natural';
  const iHi  = hexBlend(col,'#FFFFFF',0.40);
  const iDk  = hexBlend(col,'#000000',0.52);
  const browCol = '#1C1008';

  // Iris sizes by type
  const dims = { almond:[4.6,3.8], round:[5,5], cat:[5.4,3.8], hooded:[4.2,3.4], wide:[5.6,4.8] };
  const [rx, ry] = dims[type] || dims.almond;
  const catRot = type==='cat' ? `rotate(-9,${cx},${cy})` : '';

  // Brow Y
  const by = cy - 12;
  const bsw = brow==='thick' ? 5 : brow==='thin' ? 1.4 : 2.8;
  const bcy = brow==='arched' ? -8 : -6;

  // Lash points
  const lashPts = lash==='dramatic'
    ? [[-6,-8],[-3,-9],[0,-9.5],[3,-9],[6,-8],[9,-6.5]]
    : [[-4.5,-5.5],[0,-6.5],[4.5,-5.5]];

  return (
    <g>
      {/* Eyebrow */}
      <path d={`M${cx-7.5} ${by+2} Q${cx+1} ${by+bcy} ${cx+7.5} ${by}`}
        stroke={browCol} strokeWidth={bsw} fill="none" strokeLinecap="round" />
      <path d={`M${cx-5} ${by+1} Q${cx} ${by+bcy+1} ${cx+5} ${by+0.5}`}
        stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" fill="none" strokeLinecap="round" />

      {/* Socket AO drop shadow */}
      <ellipse cx={cx} cy={cy+ry+2} rx={rx+3} ry="2.2" fill="rgba(0,0,0,0.11)" />

      {/* Sclera (white) */}
      <g transform={catRot}>
        <ellipse cx={cx} cy={cy} rx={rx+3} ry={ry+0.9} fill="white" />
        <ellipse cx={cx} cy={cy} rx={rx+3} ry={ry+0.9} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.7" />

        {/* Iris gradient */}
        <defs>
          <radialGradient id={`${uid}_iris_${cx}`} cx="36%" cy="30%" r="68%">
            <stop offset="0%"   stopColor={iHi} />
            <stop offset="50%"  stopColor={col} />
            <stop offset="100%" stopColor={iDk} />
          </radialGradient>
        </defs>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${uid}_iris_${cx})`} />

        {/* Limbal ring */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="rgba(0,0,0,0.42)" strokeWidth="0.9" />

        {/* Pupil */}
        <ellipse cx={cx} cy={cy+0.3} rx={rx*.54} ry={ry*.54} fill="#050203" />

        {/* Eyelid AO — upper lid shadow */}
        <defs>
          <linearGradient id={`${uid}_lidao_${cx}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"  stopColor="rgba(0,0,0,0.44)" />
            <stop offset="55%" stopColor="rgba(0,0,0,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>
        <ellipse cx={cx} cy={cy-ry*.15} rx={rx+3} ry={(ry+0.9)*.52} fill={`url(#${uid}_lidao_${cx})`} />

        {/* Specular — 10 o'clock (primary) */}
        <circle cx={cx-rx*.30} cy={cy-ry*.38} r={rx*.28} fill="white" opacity="0.97" />
        {/* Specular — 2 o'clock (secondary) */}
        <circle cx={cx+rx*.32} cy={cy-ry*.26} r={rx*.16} fill="white" opacity="0.72" />
        {/* Cornea micro-gloss */}
        <ellipse cx={cx} cy={cy-ry*.25} rx={rx+3} ry={(ry+0.9)*.40} fill="white" opacity="0.05" />
      </g>

      {/* Upper lid line */}
      <path d={`M${cx-rx-2} ${cy-ry*.7} Q${cx} ${cy-ry-1} ${cx+rx+2} ${cy-ry*.7}`}
        stroke="rgba(0,0,0,0.18)" strokeWidth="1.3" fill="none" />

      {/* Lashes */}
      {lash !== 'none' && lashPts.map(([dx,dy],i) => (
        <line key={i}
          x1={cx+dx*.55} y1={cy-ry-1}
          x2={cx+dx}     y2={cy-ry+dy}
          stroke="#0a0604"
          strokeWidth={lash==='dramatic' ? 1.8 : 1.3}
          strokeLinecap="round" />
      ))}
    </g>
  );
}

// ─── Nose ─────────────────────────────────────────────────────────────────────
function PBRNose({ noseConfig }) {
  const t = noseConfig?.type || 'button';
  const ao='rgba(0,0,0,0.12)', hi='rgba(255,255,255,0.15)', sh='rgba(0,0,0,0.08)';
  if (t==='wide') return <>
    <path d="M49 62 Q48 67 46 70 Q50 72 54 70 Q52 67 51 62 Z" fill={sh} />
    <ellipse cx="43" cy="69" rx="5.5" ry="3.5" fill={ao} />
    <ellipse cx="57" cy="69" rx="5.5" ry="3.5" fill={ao} />
    <ellipse cx="43.5" cy="67.5" rx="2" ry="1.3" fill={hi} />
    <ellipse cx="57.5" cy="67.5" rx="2" ry="1.3" fill={hi} />
  </>;
  if (t==='narrow') return <>
    <path d="M50 62 Q49 67 47 70 Q50 72 53 70 Q51 67 50 62 Z" fill={ao} opacity="0.85" />
    <ellipse cx="47.5" cy="70.5" rx="2" ry="1.5" fill={ao} />
    <ellipse cx="52.5" cy="70.5" rx="2" ry="1.5" fill={ao} />
    <ellipse cx="50" cy="63" rx="0.9" ry="1.4" fill={hi} opacity="0.7" />
  </>;
  if (t==='upturned') return <>
    <path d="M45 71.5 Q50 64.5 55 71.5" stroke={ao} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <ellipse cx="46" cy="71.5" rx="2.5" ry="1.8" fill={ao} />
    <ellipse cx="54" cy="71.5" rx="2.5" ry="1.8" fill={ao} />
    <ellipse cx="46.5" cy="70.5" rx="1" ry="0.8" fill={hi} />
    <ellipse cx="54.5" cy="70.5" rx="1" ry="0.8" fill={hi} />
  </>;
  // button (default)
  return <>
    <path d="M49 62 Q48 67 47 70 Q50 72 53 70 Q52 67 51 62 Z" fill={sh} />
    <ellipse cx="50" cy="66" rx="5.5" ry="4.5" fill={ao} />
    <ellipse cx="47" cy="70.5" rx="2.4" ry="1.8" fill={ao} />
    <ellipse cx="53" cy="70.5" rx="2.4" ry="1.8" fill={ao} />
    <ellipse cx="49.5" cy="65" rx="2" ry="1.3" fill={hi} />
  </>;
}

// ─── Cheeks ────────────────────────────────────────────────────────────────────
function PBRCheeks({ expression }) {
  const a = (expression==='happy'||expression==='excited') ? 0.38 : 0.14;
  return <>
    <ellipse cx="29" cy="65" rx="8.5" ry="5" fill={`rgba(255,110,90,${a})`} />
    <ellipse cx="71" cy="65" rx="8.5" ry="5" fill={`rgba(255,110,90,${a})`} />
    <ellipse cx="29" cy="65" rx="4" ry="2.5" fill={`rgba(255,160,140,${a*.5})`} />
    <ellipse cx="71" cy="65" rx="4" ry="2.5" fill={`rgba(255,160,140,${a*.5})`} />
  </>;
}

// ─── Mouth ─────────────────────────────────────────────────────────────────────
function PBRMouth({ mouthConfig, expression }) {
  const lc = mouthConfig?.lipColor || '#C48A8A';
  const dk = hexBlend(lc,'#000000',0.28);
  const hi = hexBlend(lc,'#FFFFFF',0.38);
  const MAP = { neutral:'smile', happy:'open', excited:'open', focused:'smirk' };
  const t = expression && expression!=='neutral' ? (MAP[expression]||mouthConfig?.type) : (mouthConfig?.type||'smile');

  if (t==='smirk') return <>
    <path d="M38 77.5 Q46 83 61 75" stroke="rgba(0,0,0,0.12)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M38 76.5 Q46 82 61 74" stroke={lc} strokeWidth="2.8" fill="none" strokeLinecap="round" />
    <path d="M38 76.5 Q42 78.5 46 77" stroke={hi} strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.45" />
    <circle cx="61" cy="74.5" r="1.2" fill={dk} opacity="0.45" />
  </>;
  if (t==='open') return <>
    <path d="M37 75 Q50 87 63 75" fill={lc} opacity="0.90" />
    <ellipse cx="50" cy="80.5" rx="11.5" ry="6.5" fill="#100606" />
    <ellipse cx="50" cy="78.2" rx="10" ry="4" fill="rgba(248,244,240,0.97)" />
    <path d="M37 75 Q50 87 63 75" stroke={dk} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <path d="M40 75.5 Q50 78 60 75.5" stroke={hi} strokeWidth="0.9" fill="none" opacity="0.38" strokeLinecap="round" />
  </>;
  // smile
  return <>
    <path d="M37 77 Q50 87.5 63 77" stroke="rgba(0,0,0,0.11)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M37 76 Q50 86 63 76" stroke={lc} strokeWidth="2.8" fill="none" strokeLinecap="round" />
    <path d="M38 76 Q50 83.5 62 76" stroke={hi} strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.38" />
    <circle cx="37.5" cy="76.5" r="1.4" fill={dk} opacity="0.30" />
    <circle cx="62.5" cy="76.5" r="1.4" fill={dk} opacity="0.30" />
  </>;
}

// ─── Neck + Ears ───────────────────────────────────────────────────────────────
function PBRBody({ skin }) {
  const dk = hexAdjust(skin, -18);
  const blush = 'rgba(210,90,70,0.09)';
  const innerEar = hexAdjust(skin, -8);
  return <>
    {/* Neck */}
    <path d="M43 79 Q43 97 44 97 Q50 99 56 97 Q57 97 57 79 Z" fill={skin} />
    <path d="M43 79 Q43 94 44.5 97" stroke={dk} strokeWidth="2" fill="none" opacity="0.35" strokeLinecap="round"/>
    <path d="M54 80 Q55 94 55 97" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Left ear */}
    <ellipse cx="27" cy="56" rx="5.5" ry="7" fill={skin} />
    <ellipse cx="29" cy="56" rx="3" ry="6" fill={dk} opacity="0.22" />
    <ellipse cx="26.5" cy="56" rx="2.8" ry="4.2" fill={innerEar} />
    <ellipse cx="26.5" cy="56" rx="1.5" ry="2.5" fill={blush} />
    <ellipse cx="23" cy="56" rx="2" ry="4" fill="rgba(255,150,100,0.18)" />
    {/* Right ear */}
    <ellipse cx="73" cy="56" rx="5.5" ry="7" fill={skin} />
    <ellipse cx="71" cy="56" rx="3" ry="6" fill={dk} opacity="0.22" />
    <ellipse cx="73.5" cy="56" rx="2.8" ry="4.2" fill={innerEar} />
    <ellipse cx="73.5" cy="56" rx="1.5" ry="2.5" fill={blush} />
    <ellipse cx="77" cy="56" rx="2" ry="4" fill="rgba(255,150,100,0.18)" />
  </>;
}

// ─── Defs: all gradients + filters ────────────────────────────────────────────
function PBRDefs({ uid, skin, bg, eyeColor }) {
  const skinHi  = hexBlend(skin,'#FFFFFF',0.30);
  const skinDk  = hexBlend(skin,'#1A0800',0.32);
  const skinSh  = hexBlend(skin,'#0A0200',0.22);
  const skinSSS = hexBlend(skin,'#FF4422',0.20);
  return (
    <defs>
      {/* Face main radial — key light top-left */}
      <radialGradient id={`${uid}_faceGrad`} cx="32%" cy="22%" r="75%">
        <stop offset="0%"   stopColor={skinHi}  />
        <stop offset="35%"  stopColor={skin}     />
        <stop offset="70%"  stopColor={skinDk}   />
        <stop offset="100%" stopColor={skinSh}   />
      </radialGradient>
      {/* SSS scatter */}
      <radialGradient id={`${uid}_sss`} cx="50%" cy="50%" r="50%">
        <stop offset="50%"  stopColor={skinSSS} stopOpacity="0" />
        <stop offset="80%"  stopColor={skinSSS} stopOpacity="0.28" />
        <stop offset="100%" stopColor={skinSSS} stopOpacity="0.50" />
      </radialGradient>
      {/* Cheekbone key */}
      <radialGradient id={`${uid}_cheekL`} cx="25%" cy="55%" r="42%">
        <stop offset="0%"   stopColor={skinHi} stopOpacity="0.52" />
        <stop offset="100%" stopColor={skinHi} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}_cheekR`} cx="75%" cy="55%" r="38%">
        <stop offset="0%"   stopColor={skinHi} stopOpacity="0.18" />
        <stop offset="100%" stopColor={skinHi} stopOpacity="0" />
      </radialGradient>
      {/* Jaw shadow */}
      <radialGradient id={`${uid}_jawSh`} cx="50%" cy="100%" r="52%">
        <stop offset="0%"   stopColor={skinSh} stopOpacity="0.52" />
        <stop offset="100%" stopColor={skinSh} stopOpacity="0" />
      </radialGradient>
      {/* 3-point lighting */}
      <radialGradient id={`${uid}_key`} cx="26%" cy="12%" r="70%">
        <stop offset="0%"   stopColor="#FFF8EE" stopOpacity="0.65" />
        <stop offset="50%"  stopColor="#FFE5CC" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#FFE5CC" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}_fill`} cx="88%" cy="58%" r="52%">
        <stop offset="0%"   stopColor="#AACCFF" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#AACCFF" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}_rim`} cx="50%" cy="0%" r="58%">
        <stop offset="0%"   stopColor="white" stopOpacity="0.85" />
        <stop offset="30%"  stopColor="white" stopOpacity="0.30" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}_rimL`} cx="0%" cy="30%" r="45%">
        <stop offset="0%"   stopColor="white" stopOpacity="0.42" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
      {/* BG ambient */}
      <radialGradient id={`${uid}_bgTint`} cx="50%" cy="35%" r="62%">
        <stop offset="0%"   stopColor={bg} stopOpacity="0.30" />
        <stop offset="100%" stopColor={bg} stopOpacity="0.03" />
      </radialGradient>
      {/* Hair shine */}
      <linearGradient id={`${uid}_hairSh`} x1="12%" y1="0%" x2="72%" y2="55%">
        <stop offset="0%"   stopColor="white" stopOpacity="0.40" />
        <stop offset="38%"  stopColor="white" stopOpacity="0.10" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>
      {/* Fabric texture */}
      <filter id={`${uid}_fabric`} x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" seed="3" result="noise"/>
        <feColorMatrix type="matrix"
          values="0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0.16 0"
          in="noise" result="tinted"/>
        <feBlend in="SourceGraphic" in2="tinted" mode="multiply"/>
      </filter>
      {/* Rim glow filter */}
      <filter id={`${uid}_rimGlow`} x="-22%" y="-22%" width="144%" height="144%">
        <feMorphology operator="dilate" radius="2.2" in="SourceAlpha" result="dilated"/>
        <feGaussianBlur stdDeviation="1.4" in="dilated" result="soft"/>
        <feFlood floodColor="white" floodOpacity="0.92" result="white"/>
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
  const hi = hexAdjust(hc,20);
  if (style==='long_straight') return <>
    <path d="M18 32 Q14 60 16 92 Q19 98 24 92 Q26 60 22 32 Z" fill={hc} />
    <path d="M82 32 Q86 60 84 92 Q81 98 76 92 Q74 60 78 32 Z" fill={hc} />
    <path d="M19 32 Q16 58 17 88" stroke={sh} strokeWidth="2.5" fill="none" opacity="0.35" strokeLinecap="round"/>
  </>;
  if (style==='curly_big') return <>
    <ellipse cx="15" cy="46" rx="12" ry="14" fill={hc} />
    <ellipse cx="85" cy="46" rx="12" ry="14" fill={hc} />
    <ellipse cx="13" cy="62" rx="10" ry="11" fill={hc} />
    <ellipse cx="87" cy="62" rx="10" ry="11" fill={hc} />
  </>;
  if (style==='ponytail') return <>
    <path d="M66 26 Q62 44 64 64 Q68 72 72 64 Q76 44 74 26 Z" fill={hc} />
    <rect x="63" y="62" width="14" height="4" rx="2" fill={hexAdjust(hc,-10)} />
  </>;
  if (style==='bob') return <>
    <path d="M16 26 Q12 44 14 60 Q17 64 22 60 Q24 44 22 26 Z" fill={hc} />
    <path d="M84 26 Q88 44 86 60 Q83 64 78 60 Q76 44 78 26 Z" fill={hc} />
  </>;
  return null;
}

// ─── Hair Front ───────────────────────────────────────────────────────────────
export function HairFront({ style, color }) {
  const hc = color || '#1C1008';
  const hi = hexAdjust(hc,28);
  const sh = hexAdjust(hc,-28);

  switch(style) {
    case 'medium_wave': return <>
      <ellipse cx="50" cy="26" rx="32" ry="19" fill={hc} />
      <path d="M18 30 Q14 46 18 56" stroke={hc} strokeWidth="13" fill="none" strokeLinecap="round"/>
      <path d="M82 30 Q86 46 82 56" stroke={hc} strokeWidth="13" fill="none" strokeLinecap="round"/>
      <path d="M19 30 Q15.5 46 19 55" stroke={sh} strokeWidth="3" fill="none" opacity="0.35" strokeLinecap="round"/>
      <ellipse cx="43" cy="19" rx="13" ry="5" fill={hi} opacity="0.28"/>
    </>;
    case 'long_straight': return <>
      <ellipse cx="50" cy="24" rx="32" ry="18" fill={hc} />
      <ellipse cx="43" cy="18" rx="12" ry="4.5" fill={hi} opacity="0.27"/>
    </>;
    case 'curly_big': return <>
      <ellipse cx="50" cy="20" rx="36" ry="22" fill={hc} />
      <circle cx="19" cy="30" r="11" fill={hc} />
      <circle cx="81" cy="30" r="11" fill={hc} />
      <ellipse cx="43" cy="13" rx="13" ry="5.5" fill={hi} opacity="0.24"/>
    </>;
    case 'bun_top': return <>
      <rect x="22" y="28" width="56" height="16" rx="8" fill={hc} />
      <circle cx="50" cy="15" r="14" fill={hc} />
      <circle cx="45" cy="10" r="7" fill={hi} opacity="0.22"/>
      <rect x="22" y="28" width="56" height="4" rx="4" fill={sh} opacity="0.35"/>
    </>;
    case 'undercut': return <>
      <rect x="18" y="26" width="12" height="18" rx="6" fill={hexAdjust(hc,-8)} opacity="0.7"/>
      <rect x="70" y="26" width="12" height="18" rx="6" fill={hexAdjust(hc,-8)} opacity="0.7"/>
      <rect x="22" y="18" width="56" height="22" rx="9" fill={hc} />
      <ellipse cx="43" cy="20" rx="13" ry="5" fill={hi} opacity="0.27"/>
    </>;
    case 'afro': return <>
      <ellipse cx="50" cy="19" rx="38" ry="28" fill={hc} />
      <ellipse cx="18" cy="34" rx="14" ry="16" fill={hc} />
      <ellipse cx="82" cy="34" rx="14" ry="16" fill={hc} />
      <ellipse cx="43" cy="10" rx="15" ry="6.5" fill={hi} opacity="0.22"/>
    </>;
    case 'ponytail': return <>
      <rect x="22" y="22" width="56" height="20" rx="9" fill={hc} />
      <ellipse cx="43" cy="24" rx="12" ry="4.5" fill={hi} opacity="0.26"/>
    </>;
    case 'bob': return <>
      <ellipse cx="50" cy="24" rx="32" ry="17" fill={hc} />
      <path d="M20 22 Q17 32 19 42" stroke={sh} strokeWidth="3" fill="none" opacity="0.28" strokeLinecap="round"/>
      <path d="M80 22 Q83 32 81 42" stroke={sh} strokeWidth="3" fill="none" opacity="0.28" strokeLinecap="round"/>
      <ellipse cx="43" cy="18" rx="11" ry="4" fill={hi} opacity="0.27"/>
    </>;
    case 'bald': return <>
      <ellipse cx="44" cy="36" rx="14" ry="6" fill="rgba(255,255,255,0.10)" />
    </>;
    default: // short_clean
      return <>
        <ellipse cx="50" cy="25" rx="30" ry="17" fill={hc} />
        <rect x="20" y="24" width="13" height="12" rx="6" fill={hc} />
        <rect x="67" y="24" width="13" height="12" rx="6" fill={hc} />
        <ellipse cx="43" cy="18" rx="12" ry="4.5" fill={hi} opacity="0.27"/>
      </>;
  }
}

// ─── Outfit ────────────────────────────────────────────────────────────────────
export function Outfit({ config }) {
  const cc = config?.color || '#0D7377';
  const st = config?.style || 'tshirt';
  const dk  = hexAdjust(cc,-32);
  const dkk = hexAdjust(cc,-55);
  const lt  = hexAdjust(cc,30);
  const llt = hexAdjust(cc,50);
  const fold = hexAdjust(cc,-42);
  const hiSpec = hexAdjust(cc,60);

  switch(st) {
    case 'hoodie': return <>
      <path d="M8 102 Q11 72 50 70 Q89 72 92 102 L100 124 L0 124 Z" fill={cc} />
      <path d="M20 80 Q22 95 20 108" stroke={fold} strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round"/>
      <path d="M80 80 Q78 95 80 108" stroke={fold} strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round"/>
      <path d="M30 70 Q38 56 50 70 Q62 56 70 70 L67 83 Q50 77 33 83 Z" fill={dk} />
      <path d="M34 70 Q50 65 66 70 L64 78 Q50 73 36 78 Z" fill={dkk} opacity="0.5"/>
      <ellipse cx="50" cy="73" rx="5" ry="2.5" fill={dkk} opacity="0.7" />
      <rect x="32" y="98" width="36" height="16" rx="5" fill={dk} opacity="0.45" />
    </>;
    case 'blazer': return <>
      <path d="M8 102 Q11 72 50 70 Q89 72 92 102 L100 124 L0 124 Z" fill={cc} />
      <path d="M44 70 L36 96 L50 87 Z" fill="white" opacity="0.92" />
      <path d="M56 70 L64 96 L50 87 Z" fill="white" opacity="0.92" />
      <path d="M44 70 L42 80 L50 75 L58 80 L56 70 L50 74 Z" fill={dkk} opacity="0.3"/>
      {[90,100,110].map(y=><g key={y}><circle cx="50" cy={y} r="2.2" fill={dkk} opacity="0.6" /><circle cx="49.2" cy={y-.8} r="0.7" fill="rgba(255,255,255,0.4)" /></g>)}
    </>;
    case 'suit': return <>
      <path d="M8 102 Q11 72 50 70 Q89 72 92 102 L100 124 L0 124 Z" fill={cc} />
      <path d="M44 70 L40 124 L50 114 L60 124 L56 70 L50 74 Z" fill="white" opacity="0.94" />
      <path d="M47.5 76 L50 80.5 L52.5 76 L51.2 104 L50 106 L48.8 104 Z" fill="#C0392B" />
      <path d="M47.5 76 L50 80.5 L52.5 76 L51.2 82 Z" fill="#922B21" />
    </>;
    case 'turtleneck': return <>
      <path d="M10 102 Q13 74 50 72 Q87 74 90 102 L100 124 L0 124 Z" fill={cc} />
      <path d="M33 62 Q50 58 67 62 Q67 68 50 70 Q33 68 33 62 Z" fill={lt} opacity="0.8"/>
      <path d="M33 62 Q50 66 67 62 Q67 68 50 70 Q33 68 33 62 Z" fill={dk} opacity="0.2"/>
    </>;
    case 'bomber': return <>
      <path d="M6 102 Q9 70 50 68 Q91 70 94 102 L100 124 L0 124 Z" fill={cc} />
      <path d="M36 65 Q50 62 64 65 L64 74 Q50 71 36 74 Z" fill={dk} opacity="0.75" />
      <path d="M8 108 Q50 112 92 108 L92 116 Q50 120 8 116 Z" fill={dk} opacity="0.5"/>
      <path d="M50 68 L50 116" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
    </>;
    case 'denim': return <>
      <path d="M10 102 Q13 74 50 72 Q87 74 90 102 L100 124 L0 124 Z" fill={cc} />
      <rect x="54" y="75" width="18" height="13" rx="2" fill={dk} opacity="0.38"/>
      <path d="M55 81 L71 81" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6"/>
      <ellipse cx="36" cy="84" rx="10" ry="6" fill="rgba(255,255,255,0.04)"/>
    </>;
    case 'sport': return <>
      <path d="M8 102 Q11 72 50 70 Q89 72 92 102 L100 124 L0 124 Z" fill={cc} />
      <path d="M8 102 Q11 72 20 70 L23 124 Z" fill={llt} opacity="0.3" />
      <path d="M92 102 Q89 72 80 70 L77 124 Z" fill={llt} opacity="0.3" />
      <circle cx="50" cy="87" r="8" fill={dk} opacity="0.28"/>
    </>;
    default: // tshirt
      return <>
        <path d="M10 102 Q13 74 50 72 Q87 74 90 102 L100 124 L0 124 Z" fill={cc} />
        <path d="M16 80 Q18 94 16 110" stroke={fold} strokeWidth="1.8" fill="none" opacity="0.3" strokeLinecap="round"/>
        <path d="M84 80 Q82 94 84 110" stroke={fold} strokeWidth="1.8" fill="none" opacity="0.3" strokeLinecap="round"/>
        <path d="M42 72 Q50 78 58 72" stroke={dk} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4"/>
        <ellipse cx="40" cy="80" rx="12" ry="6" fill={llt} opacity="0.12"/>
      </>;
  }
}

// ─── Accessories ──────────────────────────────────────────────────────────────
export function Accessory({ type }) {
  switch(type) {
    case 'glasses_round': return <>
      <ellipse cx="36" cy="57" rx="10" ry="3" fill="rgba(0,0,0,0.12)" />
      <ellipse cx="64" cy="57" rx="10" ry="3" fill="rgba(0,0,0,0.12)" />
      <circle cx="36" cy="54" r="9.5" fill="rgba(140,190,255,0.07)" stroke="#1a1616" strokeWidth="2.5" opacity="0.8"/>
      <circle cx="64" cy="54" r="9.5" fill="rgba(140,190,255,0.07)" stroke="#1a1616" strokeWidth="2.5" opacity="0.8"/>
      <path d="M29 49 Q36 47 43 49" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M57 49 Q64 47 71 49" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <line x1="45.5" y1="54" x2="54.5" y2="54" stroke="#1a1616" strokeWidth="2" opacity="0.75"/>
      <line x1="23" y1="51.5" x2="26.5" y2="54" stroke="#1a1616" strokeWidth="2.2" opacity="0.8"/>
      <line x1="77" y1="51.5" x2="73.5" y2="54" stroke="#1a1616" strokeWidth="2.2" opacity="0.8"/>
    </>;
    case 'glasses_square': return <>
      <ellipse cx="36" cy="57" rx="11" ry="3" fill="rgba(0,0,0,0.12)"/>
      <ellipse cx="64" cy="57" rx="11" ry="3" fill="rgba(0,0,0,0.12)"/>
      <rect x="25.5" y="49" width="21" height="13.5" rx="3.5" fill="rgba(140,190,255,0.07)" stroke="#1a1616" strokeWidth="2.4" opacity="0.8"/>
      <rect x="53.5" y="49" width="21" height="13.5" rx="3.5" fill="rgba(140,190,255,0.07)" stroke="#1a1616" strokeWidth="2.4" opacity="0.8"/>
      <path d="M27 51 L38 51" stroke="rgba(255,255,255,0.32)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      <path d="M55 51 L66 51" stroke="rgba(255,255,255,0.32)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      <line x1="46.5" y1="55.5" x2="53.5" y2="55.5" stroke="#1a1616" strokeWidth="2" opacity="0.75"/>
      <line x1="22" y1="52" x2="25.5" y2="54.5" stroke="#1a1616" strokeWidth="2.2" opacity="0.8"/>
      <line x1="78" y1="52" x2="74.5" y2="54.5" stroke="#1a1616" strokeWidth="2.2" opacity="0.8"/>
    </>;
    case 'sunglasses': return <>
      <ellipse cx="50" cy="60" rx="26" ry="3.5" fill="rgba(0,0,0,0.18)"/>
      <path d="M24 55 Q36 48 48 55 L47 63 Q36 66 25 63 Z" fill="#111" opacity="0.94"/>
      <path d="M52 55 Q64 48 76 55 L75 63 Q64 66 53 63 Z" fill="#111" opacity="0.94"/>
      <path d="M27 51 Q36 49 45 51" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M55 51 Q64 49 73 51" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="30" cy="52" r="1.5" fill="rgba(255,255,255,0.3)"/>
      <circle cx="58" cy="52" r="1.5" fill="rgba(255,255,255,0.3)"/>
      <path d="M48 55 Q50 53 52 55" stroke="#222" strokeWidth="2.5" fill="none"/>
      <line x1="22" y1="51" x2="25" y2="55" stroke="#111" strokeWidth="2.8"/>
      <line x1="78" y1="51" x2="75" y2="55" stroke="#111" strokeWidth="2.8"/>
    </>;
    case 'cap': return <>
      <ellipse cx="50" cy="32" rx="34" ry="5" fill="rgba(0,0,0,0.18)"/>
      <path d="M18 28 Q20 14 50 13 Q80 14 82 28 Q70 32 50 33 Q30 32 18 28 Z" fill="#2A2A2A"/>
      <path d="M16 30 Q30 36 50 36 Q70 36 84 30 L86 35 Q70 40 50 40 Q30 40 14 35 Z" fill="#1a1a1a" opacity="0.9"/>
      <path d="M18 28 Q50 32 82 28 Q80 30 50 31 Q20 30 18 28 Z" fill="#1a1a1a" opacity="0.6"/>
      <ellipse cx="44" cy="17" rx="10" ry="4" fill="rgba(255,255,255,0.07)"/>
    </>;
    case 'beanie': return <>
      <path d="M18 28 Q16 14 50 11 Q84 14 82 28 L80 42 Q50 46 20 42 Z" fill="#A78BFA"/>
      {[18,22,26,30,34,38].map(y=><path key={y} d={`M${18+(y-18)*.4} ${y} Q50 ${y+1} ${82-(y-18)*.4} ${y}`} stroke="#8B5CF6" strokeWidth="0.7" fill="none" opacity="0.55"/>)}
      <path d="M18 36 Q50 40 82 36 L80 42 Q50 46 20 42 Z" fill="#8B5CF6" opacity="0.65"/>
      <circle cx="50" cy="9" r="10" fill="#C4B5FD"/>
      <circle cx="50" cy="9" r="7" fill="#DDD6FE"/>
      <circle cx="47" cy="6" r="2.5" fill="rgba(255,255,255,0.45)"/>
      <ellipse cx="40" cy="17" rx="10" ry="4" fill="rgba(255,255,255,0.12)"/>
    </>;
    case 'earrings': return <>
      <circle cx="22" cy="60" r="4.5" fill="#D4A017"/>
      <circle cx="20.5" cy="58.5" r="1.8" fill="#F5D060"/>
      <circle cx="20.2" cy="58.2" r="0.7" fill="rgba(255,255,255,0.55)"/>
      <circle cx="78" cy="60" r="4.5" fill="#D4A017"/>
      <circle cx="76.5" cy="58.5" r="1.8" fill="#F5D060"/>
      <circle cx="76.2" cy="58.2" r="0.7" fill="rgba(255,255,255,0.55)"/>
    </>;
    case 'headband': return <>
      <path d="M19 34 Q50 40 81 34" stroke="rgba(0,0,0,0.2)" strokeWidth="4" fill="none"/>
      <path d="M18 28 Q50 34 82 28 L82 38 Q50 44 18 38 Z" fill="#FC8181"/>
      {[30,33,36].map(y=><path key={y} d={`M19 ${y} Q50 ${y+1} 81 ${y}`} stroke="#E57373" strokeWidth="0.7" fill="none" opacity="0.4"/>)}
      <path d="M20 29 Q50 35 80 29" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
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
    <svg width={size} height={size} viewBox="0 0 100 124" fill="none" xmlns="http://www.w3.org/2000/svg">
      <PBRDefs uid={uid} skin={skin} bg={bg} eyeColor={c.eyes?.color} />

      {/* BG ambient */}
      <circle cx="50" cy="62" r="62" fill={`url(#${uid}_bgTint)`} />

      {/* L0: Back hair */}
      {isLong && <HairBack style={c.hair?.style} color={c.hair?.color} uid={uid} />}

      {/* L1: Body/ears/neck */}
      <PBRBody skin={skin} />

      {/* L2: Outfit with fabric filter */}
      <g filter={`url(#${uid}_fabric)`}>
        <Outfit config={c.outfit} />
      </g>

      {/* L3: Sculpted face */}
      <SculptedHead skin={skin} faceShape={c.faceShape} uid={uid} />

      {/* L4: Eyes */}
      <PBREye cx={36} cy={54} eyeConfig={c.eyes} browConfig={c.eyebrows} lashConfig={c.eyelashes} uid={uid} />
      <PBREye cx={64} cy={54} eyeConfig={c.eyes} browConfig={c.eyebrows} lashConfig={c.eyelashes} uid={uid} />

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
          <ellipse cx="43" cy="20" rx="20" ry="8.5" fill={`url(#${uid}_hairSh)`} />
        )}
      </g>

      {/* L9: Accessories */}
      <Accessory type={c.accessory} />

      {/* ── 3-POINT LIGHTING PASSES ── */}
      <ellipse cx="34" cy="36" rx="30" ry="26" fill={`url(#${uid}_key)`} />
      <ellipse cx="50" cy="14" rx="44" ry="22" fill={`url(#${uid}_rim)`} />
      <ellipse cx="10" cy="46" rx="22" ry="36" fill={`url(#${uid}_rimL)`} />
      <ellipse cx="86" cy="56" rx="38" ry="42" fill={`url(#${uid}_fill)`} />
    </svg>
  );
}