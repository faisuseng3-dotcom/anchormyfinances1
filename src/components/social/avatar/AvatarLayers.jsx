// Avatar Layering Engine — Premium Cartoon SVG layers

import React from 'react';

// ─── BACK HAIR (long styles behind everything) ──────────────────────────────
export function HairBack({ style, color }) {
  const hc = color || '#1C1008';
  const shadow = adjustHex(hc, -30);

  if (style === 'long_straight') return (
    <>
      <rect x="18" y="32" width="13" height="60" rx="6" fill={hc} />
      <rect x="69" y="32" width="13" height="60" rx="6" fill={hc} />
      <rect x="18" y="32" width="6" height="60" rx="3" fill={shadow} opacity="0.3" />
    </>
  );
  if (style === 'curly_big') return (
    <>
      <circle cx="17" cy="50" r="10" fill={hc} />
      <circle cx="83" cy="50" r="10" fill={hc} />
      <circle cx="15" cy="65" r="8" fill={hc} />
      <circle cx="85" cy="65" r="8" fill={hc} />
    </>
  );
  if (style === 'ponytail') return (
    <>
      <rect x="66" y="26" width="12" height="36" rx="6" fill={hc} />
      <ellipse cx="72" cy="64" rx="8" ry="6" fill={hc} />
      <rect x="69" y="26" width="4" height="36" rx="2" fill={shadow} opacity="0.25" />
    </>
  );
  if (style === 'bob') return (
    <>
      <rect x="17" y="26" width="14" height="36" rx="7" fill={hc} />
      <rect x="69" y="26" width="14" height="36" rx="7" fill={hc} />
    </>
  );
  return null;
}

// ─── BODY (shoulders, neck, ears) ──────────────────────────────────────────
export function BodyLayer({ skinColor }) {
  const sk = skinColor || '#FFDBAC';
  const shadow = `rgba(0,0,0,0.1)`;
  const blush = `rgba(200,100,80,0.07)`;
  return (
    <>
      {/* Neck */}
      <rect x="43" y="79" width="14" height="18" rx="6" fill={sk} />
      <rect x="46" y="79" width="4" height="18" rx="2" fill={shadow} />
      {/* Ears */}
      <ellipse cx="27" cy="56" rx="5" ry="6.5" fill={sk} />
      <ellipse cx="73" cy="56" rx="5" ry="6.5" fill={sk} />
      {/* Ear inner */}
      <ellipse cx="27" cy="56" rx="2.8" ry="4.2" fill={blush} />
      <ellipse cx="73" cy="56" rx="2.8" ry="4.2" fill={blush} />
    </>
  );
}

// ─── OUTFIT (shoulders + chest) ─────────────────────────────────────────────
export function OutfitLayer({ outfitConfig }) {
  const cc = outfitConfig?.color || '#0D7377';
  const style = outfitConfig?.style || 'tshirt';
  const dark = adjustHex(cc, -28);
  const light = adjustHex(cc, 28);

  switch (style) {
    case 'hoodie': return (
      <>
        <path d="M8 100 Q12 72 50 70 Q88 72 92 100 L100 124 L0 124 Z" fill={cc} />
        {/* Hood */}
        <path d="M30 70 Q38 58 50 70 Q62 58 70 70 L67 82 Q50 76 33 82 Z" fill={dark} />
        <rect x="43" y="70" width="14" height="5" rx="2.5" fill="rgba(0,0,0,0.2)" />
        {/* Pocket */}
        <rect x="34" y="98" width="32" height="14" rx="4" fill={dark} opacity="0.5" />
        <line x1="50" y1="98" x2="50" y2="112" stroke={dark} strokeWidth="1" opacity="0.6" />
      </>
    );
    case 'blazer': return (
      <>
        <path d="M8 100 Q12 72 50 70 Q88 72 92 100 L100 124 L0 124 Z" fill={cc} />
        {/* Lapels */}
        <path d="M44 70 L38 95 L50 86 Z" fill="white" opacity="0.9" />
        <path d="M56 70 L62 95 L50 86 Z" fill="white" opacity="0.9" />
        {/* Collar shadow */}
        <path d="M44 70 L42 78 L50 74 L58 78 L56 70 L50 73 Z" fill={dark} opacity="0.35" />
        {/* Button */}
        <circle cx="50" cy="94" r="2" fill={dark} opacity="0.5" />
        <circle cx="50" cy="102" r="2" fill={dark} opacity="0.5" />
      </>
    );
    case 'suit': return (
      <>
        <path d="M8 100 Q12 72 50 70 Q88 72 92 100 L100 124 L0 124 Z" fill={cc} />
        <path d="M44 70 L40 124 L50 114 L60 124 L56 70 L50 74 Z" fill="white" opacity="0.93" />
        <path d="M44 70 L42 80 L50 75 L58 80 L56 70 L50 73 Z" fill={dark} opacity="0.3" />
        {/* Tie */}
        <path d="M47 76 L50 80 L53 76 L51 100 L50 102 L49 100 Z" fill="#E53E3E" />
        <path d="M47 76 L50 80 L53 76 L51 80 Z" fill="#C53030" />
      </>
    );
    case 'turtleneck': return (
      <>
        <path d="M10 100 Q14 74 50 72 Q86 74 90 100 L100 124 L0 124 Z" fill={cc} />
        {/* Turtleneck fold */}
        <rect x="34" y="62" width="32" height="16" rx="9" fill={light} />
        <rect x="36" y="70" width="28" height="10" rx="5" fill={cc} />
        <rect x="36" y="67" width="28" height="4" rx="2" fill={light} opacity="0.5" />
      </>
    );
    case 'bomber': return (
      <>
        <path d="M6 100 Q10 70 50 68 Q90 70 94 100 L100 124 L0 124 Z" fill={cc} />
        {/* Ribbed collar */}
        <rect x="36" y="66" width="28" height="8" rx="4" fill={dark} opacity="0.7" />
        {/* Ribbed hem */}
        <rect x="8" y="106" width="84" height="8" rx="4" fill={dark} opacity="0.5" />
        {/* Zip line */}
        <line x1="50" y1="68" x2="50" y2="114" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
        {/* Patches */}
        <rect x="15" y="82" width="14" height="10" rx="3" fill={light} opacity="0.35" />
      </>
    );
    case 'denim': return (
      <>
        <path d="M10 100 Q14 74 50 72 Q86 74 90 100 L100 124 L0 124 Z" fill={cc} />
        {/* Seam lines */}
        <line x1="50" y1="72" x2="50" y2="124" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <line x1="14" y1="88" x2="86" y2="88" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        {/* Chest pocket */}
        <rect x="56" y="76" width="16" height="11" rx="2" fill={dark} opacity="0.4" />
        <line x1="56" y1="81" x2="72" y2="81" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
      </>
    );
    case 'sport': return (
      <>
        <path d="M8 100 Q12 72 50 70 Q88 72 92 100 L100 124 L0 124 Z" fill={cc} />
        {/* Side stripe */}
        <path d="M8 100 Q12 72 22 70 L26 124 Z" fill={light} opacity="0.35" />
        <path d="M92 100 Q88 72 78 70 L74 124 Z" fill={light} opacity="0.35" />
        {/* Center logo area */}
        <circle cx="50" cy="88" r="7" fill={dark} opacity="0.3" />
      </>
    );
    default: // tshirt
      return (
        <>
          <path d="M10 100 Q14 74 50 72 Q86 74 90 100 L100 124 L0 124 Z" fill={cc} />
          {/* Collar */}
          <path d="M42 72 Q50 78 58 72" stroke={dark} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
        </>
      );
  }
}

// ─── FACE ───────────────────────────────────────────────────────────────────
export function FaceLayer({ skinColor, faceShape }) {
  const sk = skinColor || '#FFDBAC';
  const shad = `rgba(0,0,0,0.055)`;
  const hi = `rgba(255,255,255,0.18)`;

  let rx = 23, ry = 26;
  if (faceShape === 'round')  { rx = 24; ry = 23; }
  if (faceShape === 'square') { rx = 24; ry = 21; }
  if (faceShape === 'heart')  { rx = 22; ry = 24; }

  return (
    <>
      {/* Face base */}
      <ellipse cx="50" cy="54" rx={rx} ry={ry} fill={sk} />
      {/* Forehead highlight */}
      <ellipse cx="46" cy="40" rx="10" ry="7" fill={hi} />
      {/* Jaw shadow */}
      <ellipse cx="50" cy="74" rx="16" ry="5" fill={shad} />
      {/* Cheekbone shading */}
      <ellipse cx="30" cy="60" rx="7" ry="9" fill={shad} />
      <ellipse cx="70" cy="60" rx="7" ry="9" fill={shad} />
    </>
  );
}

// ─── EYES ───────────────────────────────────────────────────────────────────
export function EyeLayer({ eyeConfig, eyebrowConfig, eyelashConfig }) {
  const ec = eyeConfig?.color || '#2D3436';
  const eyeType = eyeConfig?.type || 'almond';
  const browType = eyebrowConfig?.type || 'natural';
  const lashType = eyelashConfig?.type || 'natural';
  const browColor = '#2a1f10';

  const Lx = 36, Ly = 54;
  const Rx = 64, Ry = 54;

  function EyeShape({ cx, cy }) {
    const white = 'white';
    switch (eyeType) {
      case 'round': return (
        <>
          <ellipse cx={cx} cy={cy} rx="7" ry="7" fill={white} />
          <circle cx={cx} cy={cy} r="4.5" fill={ec} />
          <circle cx={cx} cy={cy} r="2.5" fill="#0a0a0a" />
          <circle cx={cx + 1.5} cy={cy - 1.5} r="1.2" fill="white" />
        </>
      );
      case 'cat': return (
        <>
          <ellipse cx={cx} cy={cy} rx="7.5" ry="4.5" fill={white} style={{ transform: `rotate(-10deg)`, transformOrigin: `${cx}px ${cy}px` }} />
          <ellipse cx={cx} cy={cy} rx="4.5" ry="3.5" fill={ec} style={{ transform: `rotate(-10deg)`, transformOrigin: `${cx}px ${cy}px` }} />
          <ellipse cx={cx} cy={cy} rx="2" ry="3" fill="#0a0a0a" />
          <circle cx={cx + 1.5} cy={cy - 1} r="1.1" fill="white" />
        </>
      );
      case 'hooded': return (
        <>
          <ellipse cx={cx} cy={cy + 1} rx="6.5" ry="4" fill={white} />
          <circle cx={cx} cy={cy + 1} r="4" fill={ec} />
          <circle cx={cx} cy={cy + 1} r="2.2" fill="#0a0a0a" />
          <circle cx={cx + 1.2} cy={cy - 0.5} r="1" fill="white" />
        </>
      );
      case 'wide': return (
        <>
          <ellipse cx={cx} cy={cy} rx="8" ry="5.5" fill={white} />
          <circle cx={cx} cy={cy} r="4.8" fill={ec} />
          <circle cx={cx} cy={cy} r="2.8" fill="#0a0a0a" />
          <circle cx={cx + 1.5} cy={cy - 1.5} r="1.3" fill="white" />
        </>
      );
      default: // almond
        return (
          <>
            <ellipse cx={cx} cy={cy} rx="7" ry="4.8" fill={white} />
            <circle cx={cx} cy={cy} r="4.2" fill={ec} />
            <circle cx={cx} cy={cy} r="2.4" fill="#0a0a0a" />
            <circle cx={cx + 1.4} cy={cy - 1.4} r="1.1" fill="white" />
          </>
        );
    }
  }

  function Brow({ cx, cy }) {
    const by = cy - 11;
    switch (browType) {
      case 'arched': return <path d={`M${cx - 7} ${by + 2} Q${cx + 1} ${by - 6} ${cx + 7} ${by}`} stroke={browColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
      case 'thick':  return <path d={`M${cx - 7} ${by + 1} Q${cx} ${by - 4} ${cx + 7} ${by + 1}`} stroke={browColor} strokeWidth="4" fill="none" strokeLinecap="round" />;
      case 'thin':   return <path d={`M${cx - 7} ${by} Q${cx} ${by - 4} ${cx + 7} ${by}`} stroke={browColor} strokeWidth="1.2" fill="none" strokeLinecap="round" />;
      default:       return <path d={`M${cx - 7} ${by + 1} Q${cx} ${by - 5} ${cx + 7} ${by + 1}`} stroke={browColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    }
  }

  function Lashes({ cx, cy }) {
    if (lashType === 'none') return null;
    const base = cy - 4.5;
    if (lashType === 'dramatic') return (
      <>
        <line x1={cx - 6} y1={base} x2={cx - 10} y2={base - 6} stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
        <line x1={cx - 3} y1={base - 0.5} x2={cx - 4} y2={base - 7} stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
        <line x1={cx} y1={base - 0.8} x2={cx} y2={base - 7.5} stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
        <line x1={cx + 3} y1={base - 0.5} x2={cx + 5} y2={base - 7} stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
        <line x1={cx + 6} y1={base} x2={cx + 9} y2={base - 5} stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
      </>
    );
    return (
      <>
        <line x1={cx - 4} y1={base} x2={cx - 6} y2={base - 4.5} stroke="#1a1a1a" strokeWidth="1.1" strokeLinecap="round" />
        <line x1={cx} y1={base - 0.5} x2={cx} y2={base - 5} stroke="#1a1a1a" strokeWidth="1.1" strokeLinecap="round" />
        <line x1={cx + 4} y1={base} x2={cx + 6} y2={base - 4.5} stroke="#1a1a1a" strokeWidth="1.1" strokeLinecap="round" />
      </>
    );
  }

  return (
    <>
      <Brow cx={Lx} cy={Ly} /><Brow cx={Rx} cy={Ry} />
      <EyeShape cx={Lx} cy={Ly} /><EyeShape cx={Rx} cy={Ry} />
      <Lashes cx={Lx} cy={Ly} /><Lashes cx={Rx} cy={Ry} />
    </>
  );
}

// ─── NOSE ───────────────────────────────────────────────────────────────────
export function NoseLayer({ noseConfig }) {
  const type = noseConfig?.type || 'button';
  const c = 'rgba(0,0,0,0.12)';
  switch (type) {
    case 'wide':     return <><ellipse cx="44" cy="68" rx="4" ry="2.8" fill={c} /><ellipse cx="56" cy="68" rx="4" ry="2.8" fill={c} /></>;
    case 'narrow':   return <><ellipse cx="50" cy="67" rx="2.5" ry="4.5" fill={c} /><ellipse cx="48" cy="70" rx="1.5" ry="1.2" fill={c} /><ellipse cx="52" cy="70" rx="1.5" ry="1.2" fill={c} /></>;
    case 'upturned': return <><path d="M45 70 Q50 64 55 70" stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round" /><ellipse cx="46" cy="70" rx="2" ry="1.5" fill={c} /><ellipse cx="54" cy="70" rx="2" ry="1.5" fill={c} /></>;
    default:         return <><ellipse cx="50" cy="68" rx="4.5" ry="3.5" fill={c} /><ellipse cx="47" cy="70" rx="2" ry="1.5" fill={c} /><ellipse cx="53" cy="70" rx="2" ry="1.5" fill={c} /></>;
  }
}

// ─── CHEEKS ──────────────────────────────────────────────────────────────────
export function CheeksLayer({ expression }) {
  const op = expression === 'happy' || expression === 'excited' ? 0.32 : 0.13;
  return (
    <>
      <ellipse cx="29" cy="65" rx="7" ry="4" fill={`rgba(255,130,110,${op})`} />
      <ellipse cx="71" cy="65" rx="7" ry="4" fill={`rgba(255,130,110,${op})`} />
    </>
  );
}

// ─── MOUTH ──────────────────────────────────────────────────────────────────
export function MouthLayer({ mouthConfig, expression }) {
  const lc = mouthConfig?.lipColor || '#C48A8A';
  const dark = adjustHex(lc, -20);
  const EXPR_MAP = { neutral: 'smile', happy: 'open', excited: 'open', focused: 'smirk' };
  const type = expression && expression !== 'neutral' ? (EXPR_MAP[expression] || mouthConfig?.type) : (mouthConfig?.type || 'smile');

  switch (type) {
    case 'smirk': return (
      <>
        <path d="M37 77 Q44 82 60 74" stroke={lc} strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <path d="M37 77 Q41 79 44 77" stroke={dark} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
      </>
    );
    case 'open': return (
      <>
        <path d="M37 75 Q50 87 63 75" fill={lc} opacity="0.85" />
        <ellipse cx="50" cy="80" rx="11" ry="6" fill="#1a0a0a" opacity="0.9" />
        <ellipse cx="50" cy="79" rx="9.5" ry="4" fill="white" opacity="0.92" />
        {/* Teeth line */}
        <line x1="41" y1="79" x2="59" y2="79" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
        <path d="M37 75 Q50 87 63 75" stroke={dark} strokeWidth="1.5" fill="none" />
      </>
    );
    case 'pouty': return (
      <>
        <path d="M39 73 Q44 78 50 73 Q56 78 61 73" fill={lc} opacity="0.9" />
        <path d="M39 73 Q50 83 61 73" stroke={dark} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M39 73 Q50 75 61 73" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" fill="none" />
      </>
    );
    default: // smile
      return (
        <>
          <path d="M37 76 Q50 86 63 76" stroke={lc} strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M37 76 Q50 86 63 76" stroke={dark} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.3" />
        </>
      );
  }
}

// ─── HAIR FRONT ──────────────────────────────────────────────────────────────
export function HairFront({ style, color }) {
  const hc = color || '#1C1008';
  const hi = adjustHex(hc, 22);
  const sh = adjustHex(hc, -22);

  switch (style) {
    case 'medium_wave': return (
      <>
        <ellipse cx="50" cy="26" rx="32" ry="19" fill={hc} />
        <path d="M18 30 Q16 44 20 54" stroke={hc} strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M82 30 Q84 44 80 54" stroke={hc} strokeWidth="12" fill="none" strokeLinecap="round" />
        <ellipse cx="44" cy="20" rx="12" ry="5" fill={hi} opacity="0.3" />
      </>
    );
    case 'long_straight': return (
      <>
        <ellipse cx="50" cy="24" rx="32" ry="18" fill={hc} />
        <ellipse cx="44" cy="19" rx="11" ry="4" fill={hi} opacity="0.28" />
      </>
    );
    case 'curly_big': return (
      <>
        <ellipse cx="50" cy="20" rx="36" ry="22" fill={hc} />
        <circle cx="20" cy="30" r="10" fill={hc} />
        <circle cx="80" cy="30" r="10" fill={hc} />
        <circle cx="14" cy="45" r="7" fill={hc} />
        <circle cx="86" cy="45" r="7" fill={hc} />
        <ellipse cx="42" cy="14" rx="12" ry="5" fill={hi} opacity="0.25" />
      </>
    );
    case 'bun_top': return (
      <>
        <rect x="22" y="28" width="56" height="16" rx="8" fill={hc} />
        <circle cx="50" cy="16" r="13" fill={hc} />
        <circle cx="50" cy="16" r="8" fill={hi} opacity="0.2" />
        <ellipse cx="46" cy="14" rx="5" ry="3" fill={hi} opacity="0.3" />
      </>
    );
    case 'undercut': return (
      <>
        <rect x="22" y="20" width="56" height="22" rx="9" fill={hc} />
        <ellipse cx="44" cy="22" rx="12" ry="4" fill={hi} opacity="0.28" />
      </>
    );
    case 'afro': return (
      <>
        <ellipse cx="50" cy="20" rx="38" ry="28" fill={hc} />
        <ellipse cx="20" cy="34" rx="13" ry="15" fill={hc} />
        <ellipse cx="80" cy="34" rx="13" ry="15" fill={hc} />
        <ellipse cx="44" cy="12" rx="14" ry="6" fill={hi} opacity="0.22" />
      </>
    );
    case 'ponytail': return (
      <>
        <rect x="22" y="22" width="56" height="20" rx="9" fill={hc} />
        <ellipse cx="44" cy="24" rx="11" ry="4" fill={hi} opacity="0.28" />
      </>
    );
    case 'bob': return (
      <>
        <ellipse cx="50" cy="24" rx="32" ry="17" fill={hc} />
        <ellipse cx="44" cy="19" rx="11" ry="4" fill={hi} opacity="0.28" />
      </>
    );
    case 'bald': return (
      // Subtle shine on bald head
      <ellipse cx="44" cy="38" rx="12" ry="5" fill="rgba(255,255,255,0.12)" />
    );
    default: // short_clean
      return (
        <>
          <ellipse cx="50" cy="26" rx="30" ry="17" fill={hc} />
          <rect x="20" y="26" width="12" height="10" rx="6" fill={hc} />
          <rect x="68" y="26" width="12" height="10" rx="6" fill={hc} />
          <ellipse cx="44" cy="20" rx="11" ry="4" fill={hi} opacity="0.28" />
        </>
      );
  }
}

// ─── ACCESSORIES ─────────────────────────────────────────────────────────────
export function AccessoryLayer({ accessory }) {
  switch (accessory) {
    case 'glasses_round': return (
      <>
        <circle cx="36" cy="54" r="9" fill="none" stroke="#1a1a1a" strokeWidth="2.2" opacity="0.7" />
        <circle cx="64" cy="54" r="9" fill="none" stroke="#1a1a1a" strokeWidth="2.2" opacity="0.7" />
        <circle cx="36" cy="54" r="9" fill="rgba(150,200,255,0.08)" />
        <circle cx="64" cy="54" r="9" fill="rgba(150,200,255,0.08)" />
        <line x1="45" y1="54" x2="55" y2="54" stroke="#1a1a1a" strokeWidth="1.8" opacity="0.7" />
        <line x1="22" y1="52" x2="27" y2="54" stroke="#1a1a1a" strokeWidth="1.8" opacity="0.7" />
        <line x1="78" y1="52" x2="73" y2="54" stroke="#1a1a1a" strokeWidth="1.8" opacity="0.7" />
      </>
    );
    case 'glasses_square': return (
      <>
        <rect x="26" y="49" width="20" height="13" rx="3" fill="rgba(150,200,255,0.08)" stroke="#1a1a1a" strokeWidth="2.2" opacity="0.7" />
        <rect x="54" y="49" width="20" height="13" rx="3" fill="rgba(150,200,255,0.08)" stroke="#1a1a1a" strokeWidth="2.2" opacity="0.7" />
        <line x1="46" y1="55" x2="54" y2="55" stroke="#1a1a1a" strokeWidth="1.8" opacity="0.7" />
        <line x1="22" y1="52" x2="26" y2="54" stroke="#1a1a1a" strokeWidth="1.8" opacity="0.7" />
        <line x1="78" y1="52" x2="74" y2="54" stroke="#1a1a1a" strokeWidth="1.8" opacity="0.7" />
      </>
    );
    case 'sunglasses': return (
      <>
        <rect x="25" y="49" width="22" height="13" rx="6" fill="#1a1a1a" opacity="0.92" />
        <rect x="53" y="49" width="22" height="13" rx="6" fill="#1a1a1a" opacity="0.92" />
        <rect x="25" y="49" width="22" height="5" rx="3" fill="rgba(255,255,255,0.08)" />
        <rect x="53" y="49" width="22" height="5" rx="3" fill="rgba(255,255,255,0.08)" />
        <line x1="47" y1="55" x2="53" y2="55" stroke="#1a1a1a" strokeWidth="2.5" />
        <line x1="22" y1="51" x2="25" y2="54" stroke="#1a1a1a" strokeWidth="2.5" />
        <line x1="78" y1="51" x2="75" y2="54" stroke="#1a1a1a" strokeWidth="2.5" />
      </>
    );
    case 'cap': return (
      <>
        <ellipse cx="50" cy="27" rx="32" ry="10" fill="#2D2D2D" />
        <rect x="20" y="18" width="60" height="16" rx="8" fill="#333" />
        <ellipse cx="50" cy="34" rx="36" ry="6" fill="#1a1a1a" opacity="0.8" />
        <rect x="22" y="22" width="20" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
      </>
    );
    case 'beanie': return (
      <>
        <rect x="20" y="16" width="60" height="26" rx="12" fill="#A78BFA" />
        <rect x="20" y="36" width="60" height="8" rx="4" fill="#8B5CF6" opacity="0.6" />
        <circle cx="50" cy="14" r="9" fill="#C4B5FD" />
        <circle cx="50" cy="14" r="5" fill="#DDD6FE" />
      </>
    );
    case 'earrings': return (
      <>
        <circle cx="22" cy="62" r="4" fill="#F6AD55" />
        <circle cx="78" cy="62" r="4" fill="#F6AD55" />
        <circle cx="22" cy="62" r="2" fill="#ECC94B" />
        <circle cx="78" cy="62" r="2" fill="#ECC94B" />
      </>
    );
    case 'headband': return (
      <>
        <rect x="18" y="28" width="64" height="10" rx="5" fill="#FC8181" opacity="0.95" />
        <rect x="18" y="28" width="64" height="4" rx="3" fill="rgba(255,255,255,0.2)" />
      </>
    );
    default: return null;
  }
}

// ─── HELPER: hex brightness adjust ──────────────────────────────────────────
function adjustHex(hex, amount) {
  if (!hex || !hex.startsWith('#')) return hex;
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}