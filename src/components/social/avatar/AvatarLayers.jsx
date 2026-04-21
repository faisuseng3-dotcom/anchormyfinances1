// Avatar Layering Engine — All SVG layers rendered in Z-order

import React from 'react';

// ─── HAIR BACK (long styles render behind face) ────────────────────────────
export function HairBack({ style, color }) {
  const hc = color || '#1C1008';
  if (style === 'long_straight') {
    return (
      <>
        <rect x="20" y="30" width="11" height="54" rx="5" fill={hc} />
        <rect x="69" y="30" width="11" height="54" rx="5" fill={hc} />
      </>
    );
  }
  if (style === 'curly_big') {
    return (
      <>
        <circle cx="18" cy="48" r="8" fill={hc} />
        <circle cx="82" cy="48" r="8" fill={hc} />
        <circle cx="16" cy="62" r="6" fill={hc} />
        <circle cx="84" cy="62" r="6" fill={hc} />
      </>
    );
  }
  if (style === 'ponytail') {
    return (
      <>
        <rect x="68" y="28" width="10" height="32" rx="5" fill={hc} />
        <ellipse cx="73" cy="62" rx="7" ry="5" fill={hc} />
      </>
    );
  }
  if (style === 'bob') {
    return (
      <>
        <rect x="19" y="28" width="12" height="30" rx="6" fill={hc} />
        <rect x="69" y="28" width="12" height="30" rx="6" fill={hc} />
      </>
    );
  }
  return null;
}

// ─── BODY ──────────────────────────────────────────────────────────────────
export function BodyLayer({ skinColor }) {
  const sk = skinColor || '#FFDBAC';
  return (
    <>
      {/* Neck */}
      <rect x="44" y="80" width="12" height="16" rx="5" fill={sk} />
      {/* Ears */}
      <ellipse cx="26" cy="55" rx="4.5" ry="6" fill={sk} />
      <ellipse cx="74" cy="55" rx="4.5" ry="6" fill={sk} />
      <ellipse cx="26" cy="55" rx="2.5" ry="4" fill="rgba(0,0,0,0.06)" />
      <ellipse cx="74" cy="55" rx="2.5" ry="4" fill="rgba(0,0,0,0.06)" />
    </>
  );
}

// ─── FACE ──────────────────────────────────────────────────────────────────
export function FaceLayer({ skinColor, faceShape }) {
  const sk = skinColor || '#FFDBAC';
  const ry = faceShape === 'square' ? 20 : faceShape === 'heart' ? 22 : faceShape === 'oval' ? 26 : 22;
  const rx = faceShape === 'square' ? 22 : faceShape === 'heart' ? 20 : 22;
  return (
    <>
      <ellipse cx="50" cy="55" rx={rx} ry={ry} fill={sk} />
      {/* Subtle face shading */}
      <ellipse cx="33" cy="62" rx="6" ry="8" fill="rgba(200,110,80,0.08)" />
      <ellipse cx="67" cy="62" rx="6" ry="8" fill="rgba(200,110,80,0.08)" />
    </>
  );
}

// ─── EYES ──────────────────────────────────────────────────────────────────
export function EyeLayer({ eyeConfig, eyebrowConfig, eyelashConfig }) {
  const ec = eyeConfig?.color || '#2D3436';
  const eyeType = eyeConfig?.type || 'almond';
  const browType = eyebrowConfig?.type || 'natural';
  const lashType = eyelashConfig?.type || 'natural';

  const L = { x: 37, y: 55 };
  const R = { x: 63, y: 55 };

  const eyeShape = (x, y) => {
    switch (eyeType) {
      case 'round':  return <circle cx={x} cy={y} r="5.5" fill={ec} />;
      case 'cat':    return <ellipse cx={x} cy={y} rx="6.5" ry="3.8" fill={ec} style={{ transform: `rotate(-8deg)`, transformOrigin: `${x}px ${y}px` }} />;
      case 'hooded': return <ellipse cx={x} cy={y} rx="5.5" ry="3.8" fill={ec} />;
      case 'wide':   return <ellipse cx={x} cy={y} rx="7" ry="4.5" fill={ec} />;
      default:       return <ellipse cx={x} cy={y} rx="5.5" ry="4.2" fill={ec} />;
    }
  };

  const brow = (x, y) => {
    switch (browType) {
      case 'arched': return <path d={`M${x-6} ${y-11} Q${x+2} ${y-18} ${x+6} ${y-13}`} stroke="#1a1a1a" strokeWidth="2.2" fill="none" strokeLinecap="round" />;
      case 'thick':  return <path d={`M${x-6} ${y-11} Q${x} ${y-15} ${x+6} ${y-11}`} stroke="#1a1a1a" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
      case 'thin':   return <path d={`M${x-6} ${y-11} Q${x} ${y-15} ${x+6} ${y-11}`} stroke="#1a1a1a" strokeWidth="1" fill="none" strokeLinecap="round" />;
      default:       return <path d={`M${x-6} ${y-11} Q${x} ${y-15} ${x+6} ${y-11}`} stroke="#1a1a1a" strokeWidth="2.2" fill="none" strokeLinecap="round" />;
    }
  };

  const lashes = (x, y) => {
    if (lashType === 'none') return null;
    if (lashType === 'dramatic') return (
      <>
        <line x1={x-5} y1={y-5} x2={x-8} y2={y-10} stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
        <line x1={x-2} y1={y-5.5} x2={x-3} y2={y-11} stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
        <line x1={x+1} y1={y-5.5} x2={x+1} y2={y-11} stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
        <line x1={x+4} y1={y-5} x2={x+6} y2={y-10} stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
      </>
    );
    return (
      <>
        <line x1={x-3} y1={y-5} x2={x-5} y2={y-9} stroke="#1a1a1a" strokeWidth="1.1" strokeLinecap="round" />
        <line x1={x} y1={y-5.5} x2={x} y2={y-9.5} stroke="#1a1a1a" strokeWidth="1.1" strokeLinecap="round" />
        <line x1={x+3} y1={y-5} x2={x+5} y2={y-9} stroke="#1a1a1a" strokeWidth="1.1" strokeLinecap="round" />
      </>
    );
  };

  const pupilHighlight = (x, y) => (
    <>
      <circle cx={x} cy={y} r="2.8" fill="white" />
      <circle cx={x+0.8} cy={y-0.8} r="1.4" fill={ec} />
      <circle cx={x+1.4} cy={y-1.4} r="0.7" fill="white" opacity="0.95" />
    </>
  );

  return (
    <>
      {brow(L.x, L.y)}
      {brow(R.x, R.y)}
      {eyeShape(L.x, L.y)}
      {eyeShape(R.x, R.y)}
      {pupilHighlight(L.x, L.y)}
      {pupilHighlight(R.x, R.y)}
      {lashes(L.x, L.y)}
      {lashes(R.x, R.y)}
    </>
  );
}

// ─── NOSE ──────────────────────────────────────────────────────────────────
export function NoseLayer({ noseConfig }) {
  const type = noseConfig?.type || 'button';
  const shad = 'rgba(0,0,0,0.11)';
  switch (type) {
    case 'wide':     return <><ellipse cx="44" cy="69" rx="3.5" ry="2.5" fill={shad} /><ellipse cx="56" cy="69" rx="3.5" ry="2.5" fill={shad} /></>;
    case 'narrow':   return <ellipse cx="50" cy="69" rx="2.5" ry="4" fill={shad} />;
    case 'upturned': return <path d="M46 72 Q50 66 54 72" stroke={shad} strokeWidth="2" fill="none" strokeLinecap="round" />;
    default:         return <ellipse cx="50" cy="69" rx="4" ry="3" fill={shad} />;
  }
}

// ─── MOUTH — driven by expression ─────────────────────────────────────────
export function MouthLayer({ mouthConfig, expression }) {
  const lc = mouthConfig?.lipColor || '#C48A8A';

  // Expression overrides mouth type
  const EXPR_MAP = { neutral: 'smile', happy: 'open', excited: 'open', focused: 'smirk' };
  const type = expression && expression !== 'neutral' ? (EXPR_MAP[expression] || mouthConfig?.type) : (mouthConfig?.type || 'smile');

  switch (type) {
    case 'smirk': return <path d="M38 77 Q46 82 60 75" stroke={lc} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    case 'open':
      return (
        <>
          <path d="M39 76 Q50 86 61 76" stroke={lc} strokeWidth="2.5" fill={lc} opacity="0.7" strokeLinecap="round" />
          <ellipse cx="50" cy="80" rx="10" ry="5" fill="#1a1a1a" opacity="0.85" />
          <ellipse cx="50" cy="79" rx="9" ry="3.5" fill="white" opacity="0.9" />
        </>
      );
    case 'pouty':
      return (
        <>
          <path d="M39 74 Q44 79 50 74 Q56 79 61 74" fill={lc} opacity="0.85" />
          <path d="M39 74 Q50 82 61 74" stroke={lc} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
    default: // smile
      return <path d="M38 76 Q50 84 62 76" stroke={lc} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  }
}

// ─── HAIR FRONT ────────────────────────────────────────────────────────────
export function HairFront({ style, color }) {
  const hc = color || '#1C1008';
  switch (style) {
    case 'medium_wave':
      return (
        <>
          <ellipse cx="50" cy="28" rx="30" ry="18" fill={hc} />
          <path d="M20 32 Q18 44 22 52" fill={hc} />
          <path d="M80 32 Q82 44 78 52" fill={hc} />
        </>
      );
    case 'long_straight':
      return <ellipse cx="50" cy="26" rx="30" ry="18" fill={hc} />;
    case 'curly_big':
      return (
        <>
          <ellipse cx="50" cy="22" rx="34" ry="20" fill={hc} />
          <circle cx="22" cy="32" r="8" fill={hc} />
          <circle cx="78" cy="32" r="8" fill={hc} />
        </>
      );
    case 'bun_top':
      return (
        <>
          <rect x="24" y="30" width="52" height="14" rx="7" fill={hc} />
          <circle cx="50" cy="20" r="12" fill={hc} />
        </>
      );
    case 'undercut':
      return <rect x="24" y="22" width="52" height="20" rx="8" fill={hc} />;
    case 'afro':
      return (
        <>
          <ellipse cx="50" cy="22" rx="36" ry="26" fill={hc} />
          <ellipse cx="22" cy="36" rx="12" ry="14" fill={hc} />
          <ellipse cx="78" cy="36" rx="12" ry="14" fill={hc} />
        </>
      );
    case 'ponytail':
      return <rect x="24" y="24" width="52" height="18" rx="8" fill={hc} />;
    case 'bob':
      return <ellipse cx="50" cy="26" rx="30" ry="16" fill={hc} />;
    case 'bald':
      return null;
    default: // short_clean
      return (
        <>
          <ellipse cx="50" cy="28" rx="28" ry="16" fill={hc} />
          <rect x="22" y="28" width="10" height="8" rx="5" fill={hc} />
          <rect x="68" y="28" width="10" height="8" rx="5" fill={hc} />
        </>
      );
  }
}

// ─── OUTFIT ────────────────────────────────────────────────────────────────
export function OutfitLayer({ outfitConfig }) {
  const cc = outfitConfig?.color || '#0D7377';
  const style = outfitConfig?.style || 'tshirt';
  switch (style) {
    case 'hoodie':
      return (
        <>
          <path d="M14 90 Q16 70 50 68 Q84 70 86 90 L100 120 L0 120 Z" fill={cc} />
          <path d="M34 68 Q42 60 50 68 Q58 60 66 68 L63 80 Q50 74 37 80 Z" fill={cc} style={{ filter: 'brightness(0.82)' }} />
          <rect x="41" y="68" width="18" height="4" rx="2" fill="rgba(0,0,0,0.15)" />
        </>
      );
    case 'blazer':
      return (
        <>
          <path d="M14 90 Q16 70 50 68 Q84 70 86 90 L100 120 L0 120 Z" fill={cc} />
          <path d="M42 68 L38 90 L50 82 L62 90 L58 68 L50 74 Z" fill="white" opacity="0.88" />
        </>
      );
    case 'suit':
      return (
        <>
          <path d="M14 90 Q16 70 50 68 Q84 70 86 90 L100 120 L0 120 Z" fill={cc} />
          <path d="M42 68 L40 120 L50 112 L60 120 L58 68 L50 74 Z" fill="white" opacity="0.92" />
          <path d="M45 76 L48 82 M52 82 L55 76" stroke={cc} strokeWidth="1" opacity="0.4" />
        </>
      );
    case 'turtleneck':
      return (
        <>
          <path d="M16 90 Q18 72 50 70 Q82 72 84 90 L100 120 L0 120 Z" fill={cc} />
          <rect x="36" y="64" width="28" height="14" rx="8" fill={cc} style={{ filter: 'brightness(1.1)' }} />
        </>
      );
    case 'bomber':
      return (
        <>
          <path d="M12 90 Q14 68 50 66 Q86 68 88 90 L100 120 L0 120 Z" fill={cc} />
          <rect x="14" y="88" width="72" height="6" rx="3" fill="rgba(255,255,255,0.2)" />
        </>
      );
    case 'denim':
      return (
        <>
          <path d="M16 90 Q18 72 50 70 Q82 72 84 90 L100 120 L0 120 Z" fill={cc} />
          <line x1="50" y1="70" x2="50" y2="120" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="20" y1="82" x2="80" y2="82" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </>
      );
    case 'sport':
      return (
        <>
          <path d="M14 90 Q16 70 50 68 Q84 70 86 90 L100 120 L0 120 Z" fill={cc} />
          <path d="M50 68 L50 120" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
        </>
      );
    default: // tshirt
      return <path d="M16 90 Q18 72 50 70 Q82 72 84 90 L100 120 L0 120 Z" fill={cc} />;
  }
}

// ─── ACCESSORY ─────────────────────────────────────────────────────────────
export function AccessoryLayer({ accessory }) {
  switch (accessory) {
    case 'glasses_round':
      return (
        <>
          <circle cx="37" cy="55" r="8" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.65" />
          <circle cx="63" cy="55" r="8" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.65" />
          <line x1="45" y1="55" x2="55" y2="55" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.65" />
          <line x1="22" y1="53" x2="29" y2="55" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.65" />
          <line x1="78" y1="53" x2="71" y2="55" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.65" />
        </>
      );
    case 'glasses_square':
      return (
        <>
          <rect x="28" y="50" width="18" height="12" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.65" />
          <rect x="54" y="50" width="18" height="12" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.65" />
          <line x1="46" y1="55" x2="54" y2="55" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.65" />
          <line x1="22" y1="53" x2="28" y2="55" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.65" />
          <line x1="78" y1="53" x2="72" y2="55" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.65" />
        </>
      );
    case 'sunglasses':
      return (
        <>
          <rect x="27" y="50" width="20" height="11" rx="5" fill="#1a1a1a" opacity="0.88" />
          <rect x="53" y="50" width="20" height="11" rx="5" fill="#1a1a1a" opacity="0.88" />
          <line x1="47" y1="55" x2="53" y2="55" stroke="#1a1a1a" strokeWidth="2" />
          <line x1="22" y1="52" x2="27" y2="55" stroke="#1a1a1a" strokeWidth="2" />
          <line x1="78" y1="52" x2="73" y2="55" stroke="#1a1a1a" strokeWidth="2" />
        </>
      );
    case 'cap':
      return (
        <>
          <rect x="20" y="20" width="60" height="14" rx="7" fill="#2D2D2D" />
          <ellipse cx="50" cy="34" rx="34" ry="5" fill="#1a1a1a" opacity="0.75" />
        </>
      );
    case 'beanie':
      return (
        <>
          <rect x="22" y="18" width="56" height="22" rx="10" fill="#A78BFA" />
          <ellipse cx="50" cy="18" r="10" fill="#C4B5FD" />
          <rect x="20" y="34" width="60" height="8" rx="4" fill="#C4B5FD" opacity="0.55" />
        </>
      );
    case 'earrings':
      return (
        <>
          <circle cx="21" cy="60" r="3.5" fill="#F6AD55" />
          <circle cx="79" cy="60" r="3.5" fill="#F6AD55" />
        </>
      );
    case 'headband':
      return <rect x="20" y="30" width="60" height="8" rx="4" fill="#FC8181" opacity="0.92" />;
    default:
      return null;
  }
}

// ─── CHEEKS ────────────────────────────────────────────────────────────────
export function CheeksLayer({ expression }) {
  const opacity = expression === 'happy' || expression === 'excited' ? 0.28 : 0.15;
  return (
    <>
      <ellipse cx="31" cy="65" rx="6.5" ry="3.5" fill={`rgba(255,140,120,${opacity})`} />
      <ellipse cx="69" cy="65" rx="6.5" ry="3.5" fill={`rgba(255,140,120,${opacity})`} />
    </>
  );
}