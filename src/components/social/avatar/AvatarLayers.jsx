// Avatar Layering Engine — High-Fidelity 3D Stylized SVG
// PBR-inspired: AO shadows, fabric folds, metallic sheen, SSS skin

import React from 'react';

// ─── HELPER: hex brightness ──────────────────────────────────────────────────
export function adjustHex(hex, amount) {
  if (!hex || !hex.startsWith('#')) return hex || '#888';
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

function sat(hex, factor) {
  // desaturate/saturate by blending toward gray
  if (!hex || !hex.startsWith('#')) return hex || '#888';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  const nr = Math.round(gray + (r - gray) * factor);
  const ng = Math.round(gray + (g - gray) * factor);
  const nb = Math.round(gray + (b - gray) * factor);
  return `#${[nr, ng, nb].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')}`;
}

// ─── BACK HAIR ───────────────────────────────────────────────────────────────
export function HairBack({ style, color, uid = 'hb' }) {
  const hc = color || '#1C1008';
  const shadow = adjustHex(hc, -35);
  const hi = adjustHex(hc, 20);

  if (style === 'long_straight') return (
    <>
      {/* Left strand with fold depth */}
      <path d="M18 32 Q14 60 16 92 Q19 98 24 92 Q26 60 22 32 Z" fill={hc} />
      <path d="M19 32 Q16 58 17 88" stroke={shadow} strokeWidth="2.5" fill="none" opacity="0.35" strokeLinecap="round"/>
      <path d="M21 32 Q24 55 23 85" stroke={hi} strokeWidth="1" fill="none" opacity="0.2" strokeLinecap="round"/>
      {/* Right strand */}
      <path d="M82 32 Q86 60 84 92 Q81 98 76 92 Q74 60 78 32 Z" fill={hc} />
      <path d="M81 32 Q84 58 83 88" stroke={shadow} strokeWidth="2.5" fill="none" opacity="0.35" strokeLinecap="round"/>
    </>
  );
  if (style === 'curly_big') return (
    <>
      {['#large1','#large2','#large3','#large4'].map((_, i) => null)}
      <ellipse cx="15" cy="46" rx="12" ry="14" fill={hc} />
      <ellipse cx="85" cy="46" rx="12" ry="14" fill={hc} />
      <ellipse cx="13" cy="62" rx="10" ry="11" fill={hc} />
      <ellipse cx="87" cy="62" rx="10" ry="11" fill={hc} />
      {/* AO shadow between curls */}
      <ellipse cx="14" cy="54" rx="4" ry="5" fill={shadow} opacity="0.25" />
      <ellipse cx="86" cy="54" rx="4" ry="5" fill={shadow} opacity="0.25" />
    </>
  );
  if (style === 'ponytail') return (
    <>
      {/* Ponytail tube with 3D depth */}
      <path d="M66 26 Q62 44 64 64 Q68 72 72 64 Q76 44 74 26 Z" fill={hc} />
      <path d="M68 26 Q65 44 66 62" stroke={shadow} strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round"/>
      <path d="M72 26 Q74 40 73 58" stroke={hi} strokeWidth="1" fill="none" opacity="0.18" strokeLinecap="round"/>
      {/* Hair tie */}
      <ellipse cx="70" cy="64" rx="7" ry="4" fill={shadow} opacity="0.6" />
      <rect x="63" y="62" width="14" height="4" rx="2" fill={adjustHex(hc, -10)} />
    </>
  );
  if (style === 'bob') return (
    <>
      <path d="M16 26 Q12 44 14 60 Q17 64 22 60 Q24 44 22 26 Z" fill={hc} />
      <path d="M84 26 Q88 44 86 60 Q83 64 78 60 Q76 44 78 26 Z" fill={hc} />
      <path d="M17 30 Q14 46 15 58" stroke={shadow} strokeWidth="1.5" fill="none" opacity="0.28" strokeLinecap="round"/>
      <path d="M83 30 Q86 46 85 58" stroke={shadow} strokeWidth="1.5" fill="none" opacity="0.28" strokeLinecap="round"/>
    </>
  );
  return null;
}

// ─── BODY (neck + ears with realistic SSS inner-ear) ─────────────────────────
export function BodyLayer({ skinColor, uid = 'body' }) {
  const sk = skinColor || '#FFDBAC';
  const dark = adjustHex(sk, -18);
  const innerEar = adjustHex(sk, -8);
  const blush = `rgba(210,90,70,0.09)`;

  return (
    <>
      {/* Neck with 3D cylindrical shading */}
      <path d="M43 79 Q43 97 44 97 Q50 99 56 97 Q57 97 57 79 Z" fill={sk} />
      {/* Neck shadow left */}
      <path d="M43 79 Q43 94 44.5 97" stroke={dark} strokeWidth="2" fill="none" opacity="0.35" strokeLinecap="round"/>
      {/* Neck highlight right */}
      <path d="M54 80 Q55 94 55 97" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* LEFT EAR — 3D with inner canal */}
      <ellipse cx="27" cy="56" rx="5.5" ry="7" fill={sk} />
      {/* AO shadow where ear meets face */}
      <ellipse cx="29" cy="56" rx="3" ry="6" fill={dark} opacity="0.22" />
      {/* Ear canal */}
      <ellipse cx="26.5" cy="56" rx="2.8" ry="4.2" fill={innerEar} />
      <ellipse cx="26.5" cy="56" rx="1.5" ry="2.5" fill={blush} />
      {/* SSS warm glow on ear edge */}
      <ellipse cx="23" cy="56" rx="2" ry="4" fill="rgba(255,150,100,0.18)" />

      {/* RIGHT EAR */}
      <ellipse cx="73" cy="56" rx="5.5" ry="7" fill={sk} />
      <ellipse cx="71" cy="56" rx="3" ry="6" fill={dark} opacity="0.22" />
      <ellipse cx="73.5" cy="56" rx="2.8" ry="4.2" fill={innerEar} />
      <ellipse cx="73.5" cy="56" rx="1.5" ry="2.5" fill={blush} />
      <ellipse cx="77" cy="56" rx="2" ry="4" fill="rgba(255,150,100,0.18)" />
    </>
  );
}

// ─── OUTFIT — fabric folds, AO shadows, realistic depth ──────────────────────
export function OutfitLayer({ outfitConfig, uid = 'outfit' }) {
  const cc = outfitConfig?.color || '#0D7377';
  const style = outfitConfig?.style || 'tshirt';
  const dark = adjustHex(cc, -32);
  const darker = adjustHex(cc, -55);
  const light = adjustHex(cc, 30);
  const lighter = adjustHex(cc, 50);
  // Fabric fold: AO crease color
  const fold = adjustHex(cc, -42);
  const hiSpec = adjustHex(cc, 60); // specular highlight

  switch (style) {
    case 'hoodie': return (
      <>
        {/* Base body */}
        <path d="M8 102 Q11 72 50 70 Q89 72 92 102 L100 124 L0 124 Z" fill={cc} />
        {/* Fabric folds — AO shadow creases */}
        <path d="M20 80 Q22 95 20 108" stroke={fold} strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round"/>
        <path d="M80 80 Q78 95 80 108" stroke={fold} strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round"/>
        <path d="M38 86 Q40 98 38 112" stroke={fold} strokeWidth="1.5" fill="none" opacity="0.25" strokeLinecap="round"/>
        <path d="M62 86 Q60 98 62 112" stroke={fold} strokeWidth="1.5" fill="none" opacity="0.25" strokeLinecap="round"/>
        {/* Hood with visible depth */}
        <path d="M30 70 Q38 56 50 70 Q62 56 70 70 L67 83 Q50 77 33 83 Z" fill={dark} />
        {/* Hood inner shadow */}
        <path d="M34 70 Q50 65 66 70 L64 78 Q50 73 36 78 Z" fill={darker} opacity="0.5"/>
        {/* Drawstring opening */}
        <ellipse cx="50" cy="73" rx="5" ry="2.5" fill={darker} opacity="0.7" />
        {/* Pocket with AO */}
        <rect x="32" y="98" width="36" height="16" rx="5" fill={dark} opacity="0.45" />
        <path d="M50 98 Q50 113 50 114" stroke={darker} strokeWidth="1.2" fill="none" opacity="0.5"/>
        {/* Shoulder highlight */}
        <ellipse cx="22" cy="76" rx="8" ry="4" fill={light} opacity="0.2" />
        <ellipse cx="78" cy="76" rx="8" ry="4" fill={light} opacity="0.2" />
      </>
    );

    case 'blazer': return (
      <>
        <path d="M8 102 Q11 72 50 70 Q89 72 92 102 L100 124 L0 124 Z" fill={cc} />
        {/* Fabric fold lines */}
        <path d="M16 84 Q18 100 16 116" stroke={fold} strokeWidth="2" fill="none" opacity="0.35" strokeLinecap="round"/>
        <path d="M84 84 Q82 100 84 116" stroke={fold} strokeWidth="2" fill="none" opacity="0.35" strokeLinecap="round"/>
        {/* Lapels — left */}
        <path d="M44 70 L36 96 L50 87 Z" fill="white" opacity="0.92" />
        <path d="M44 70 L38 82 L46 78 Z" fill={dark} opacity="0.22" />
        {/* Lapels — right */}
        <path d="M56 70 L64 96 L50 87 Z" fill="white" opacity="0.92" />
        <path d="M56 70 L62 82 L54 78 Z" fill={dark} opacity="0.22" />
        {/* Collar shadow AO */}
        <path d="M44 70 L42 80 L50 75 L58 80 L56 70 L50 74 Z" fill={darker} opacity="0.3"/>
        {/* Buttons — metallic */}
        {[90, 100, 110].map(y => (
          <g key={y}>
            <circle cx="50" cy={y} r="2.2" fill={darker} opacity="0.6" />
            <circle cx="49.2" cy={y - 0.8} r="0.7" fill="rgba(255,255,255,0.4)" />
          </g>
        ))}
        {/* Pocket square */}
        <path d="M18 84 L28 84 L26 92 L16 92 Z" fill={light} opacity="0.3" />
        {/* Shoulder structure highlight */}
        <path d="M10 84 Q14 76 24 74" stroke={lighter} strokeWidth="2" fill="none" opacity="0.22" strokeLinecap="round"/>
        <path d="M90 84 Q86 76 76 74" stroke={lighter} strokeWidth="2" fill="none" opacity="0.22" strokeLinecap="round"/>
      </>
    );

    case 'suit': return (
      <>
        <path d="M8 102 Q11 72 50 70 Q89 72 92 102 L100 124 L0 124 Z" fill={cc} />
        {/* Shirt front white */}
        <path d="M44 70 L40 124 L50 114 L60 124 L56 70 L50 74 Z" fill="white" opacity="0.94" />
        {/* Shirt AO shadow near edges */}
        <path d="M44 70 L41 80" stroke="rgba(0,0,0,0.12)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M56 70 L59 80" stroke="rgba(0,0,0,0.12)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Tie with gradient depth */}
        <path d="M47.5 76 L50 80.5 L52.5 76 L51.2 104 L50 106 L48.8 104 Z" fill="#C0392B" />
        <path d="M47.5 76 L50 80.5 L52.5 76 L51.2 82 Z" fill="#922B21" />
        {/* Tie knot highlight */}
        <ellipse cx="50" cy="76.5" rx="2" ry="1.2" fill="rgba(255,255,255,0.25)" />
        {/* Suit folds */}
        <path d="M16 82 Q18 98 16 118" stroke={fold} strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round"/>
        <path d="M84 82 Q82 98 84 118" stroke={fold} strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round"/>
      </>
    );

    case 'turtleneck': return (
      <>
        <path d="M10 102 Q13 74 50 72 Q87 74 90 102 L100 124 L0 124 Z" fill={cc} />
        {/* Knit texture folds */}
        <path d="M18 82 Q20 96 18 112" stroke={fold} strokeWidth="1.8" fill="none" opacity="0.35" strokeLinecap="round"/>
        <path d="M82 82 Q80 96 82 112" stroke={fold} strokeWidth="1.8" fill="none" opacity="0.35" strokeLinecap="round"/>
        {/* Turtleneck folds — multiple rings */}
        <path d="M33 62 Q50 58 67 62 Q67 68 50 70 Q33 68 33 62 Z" fill={light} opacity="0.8"/>
        <path d="M34 64 Q50 60.5 66 64" stroke={hiSpec} strokeWidth="0.8" fill="none" opacity="0.25" strokeLinecap="round"/>
        <path d="M33 62 Q50 66 67 62 Q67 68 50 70 Q33 68 33 62 Z" fill={dark} opacity="0.2"/>
        {/* Rib pattern */}
        {[64, 67, 70].map(y => (
          <path key={y} d={`M35 ${y} Q50 ${y+1} 65 ${y}`} stroke={fold} strokeWidth="0.8" fill="none" opacity="0.3"/>
        ))}
      </>
    );

    case 'bomber': return (
      <>
        <path d="M6 102 Q9 70 50 68 Q91 70 94 102 L100 124 L0 124 Z" fill={cc} />
        {/* Bomber folds */}
        <path d="M14 78 Q16 96 14 116" stroke={fold} strokeWidth="2.2" fill="none" opacity="0.4" strokeLinecap="round"/>
        <path d="M86 78 Q84 96 86 116" stroke={fold} strokeWidth="2.2" fill="none" opacity="0.4" strokeLinecap="round"/>
        {/* Ribbed collar */}
        <path d="M36 65 Q50 62 64 65 L64 74 Q50 71 36 74 Z" fill={dark} opacity="0.75" />
        {[66, 68.5, 71].map(y => (
          <path key={y} d={`M37 ${y} Q50 ${y+0.5} 63 ${y}`} stroke={adjustHex(dark, 15)} strokeWidth="0.7" fill="none" opacity="0.5"/>
        ))}
        {/* Ribbed hem */}
        <path d="M8 108 Q50 112 92 108 L92 116 Q50 120 8 116 Z" fill={dark} opacity="0.5"/>
        {[110, 113].map(y => (
          <path key={y} d={`M9 ${y} Q50 ${y+1} 91 ${y}`} stroke={adjustHex(dark, 15)} strokeWidth="0.7" fill="none" opacity="0.4"/>
        ))}
        {/* Zip */}
        <path d="M50 68 L50 116" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
        {/* Metal zip teeth */}
        {[74, 80, 86, 92, 98, 104].map(y => (
          <rect key={y} x="48.5" y={y} width="3" height="1.5" rx="0.5" fill="rgba(255,255,255,0.15)" />
        ))}
        {/* Patches */}
        <rect x="13" y="80" width="16" height="11" rx="3" fill={light} opacity="0.3" />
        <ellipse cx="21" cy="85.5" rx="4" ry="3" fill={lighter} opacity="0.25"/>
      </>
    );

    case 'denim': return (
      <>
        <path d="M10 102 Q13 74 50 72 Q87 74 90 102 L100 124 L0 124 Z" fill={cc} />
        {/* Denim seam lines */}
        <path d="M50 72 L50 124" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2"/>
        {/* Stitch lines */}
        <path d="M14 90 Q50 93 86 90" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"/>
        <path d="M14 82 Q24 79 26 90" stroke={fold} strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round"/>
        <path d="M86 82 Q76 79 74 90" stroke={fold} strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round"/>
        {/* Chest pocket */}
        <rect x="54" y="75" width="18" height="13" rx="2" fill={dark} opacity="0.38"/>
        <path d="M55 81 L71 81" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6"/>
        {/* Pocket stitch */}
        <rect x="54" y="75" width="18" height="1.5" rx="0.5" fill="rgba(255,255,255,0.08)"/>
        {/* Fade wash highlight */}
        <ellipse cx="36" cy="84" rx="10" ry="6" fill="rgba(255,255,255,0.04)"/>
      </>
    );

    case 'sport': return (
      <>
        <path d="M8 102 Q11 72 50 70 Q89 72 92 102 L100 124 L0 124 Z" fill={cc} />
        {/* Side stripe with 3D depth */}
        <path d="M8 102 Q11 72 20 70 L23 124 Z" fill={lighter} opacity="0.3" />
        <path d="M9 102 Q12 74 19 71" stroke={hiSpec} strokeWidth="0.8" fill="none" opacity="0.2"/>
        <path d="M92 102 Q89 72 80 70 L77 124 Z" fill={lighter} opacity="0.3" />
        {/* Moisture-wicking texture lines */}
        <path d="M26 76 Q50 79 74 76" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        <path d="M24 84 Q50 87 76 84" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
        {/* Logo circle */}
        <circle cx="50" cy="87" r="8" fill={dark} opacity="0.28"/>
        <circle cx="50" cy="87" r="5" fill={fold} opacity="0.2"/>
        <circle cx="48.5" cy="85.5" r="1.5" fill={hiSpec} opacity="0.3"/>
      </>
    );

    default: // tshirt
      return (
        <>
          <path d="M10 102 Q13 74 50 72 Q87 74 90 102 L100 124 L0 124 Z" fill={cc} />
          {/* Sleeve fold AO */}
          <path d="M16 80 Q18 94 16 110" stroke={fold} strokeWidth="1.8" fill="none" opacity="0.3" strokeLinecap="round"/>
          <path d="M84 80 Q82 94 84 110" stroke={fold} strokeWidth="1.8" fill="none" opacity="0.3" strokeLinecap="round"/>
          {/* Collar stitching */}
          <path d="M42 72 Q50 78 58 72" stroke={dark} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4"/>
          {/* Chest highlight */}
          <ellipse cx="40" cy="80" rx="12" ry="6" fill={lighter} opacity="0.12"/>
        </>
      );
  }
}

// ─── FACE ────────────────────────────────────────────────────────────────────
export function FaceLayer({ skinColor, faceShape, uid = 'face' }) {
  const sk = skinColor || '#FFDBAC';
  const dark = adjustHex(sk, -22);
  const hi = 'rgba(255,255,255,0.16)';
  const ao = 'rgba(0,0,0,0.055)';

  let rx = 23, ry = 26;
  if (faceShape === 'round')  { rx = 24; ry = 23; }
  if (faceShape === 'square') { rx = 24; ry = 21; }
  if (faceShape === 'heart')  { rx = 22; ry = 24; }

  return (
    <>
      {/* Base face */}
      <ellipse cx="50" cy="54" rx={rx} ry={ry} fill={sk} />

      {/* Side shading — 3D roundness */}
      <ellipse cx={50 - rx + 4} cy="54" rx="6" ry={ry - 2} fill={dark} opacity="0.22" />
      <ellipse cx={50 + rx - 4} cy="54" rx="6" ry={ry - 2} fill={dark} opacity="0.22" />

      {/* Under-chin AO */}
      <ellipse cx="50" cy={54 + ry - 4} rx="18" ry="6" fill={ao} />

      {/* Cheekbone AO shading */}
      <ellipse cx="30" cy="61" rx="8" ry="10" fill={ao} />
      <ellipse cx="70" cy="61" rx="8" ry="10" fill={ao} />

      {/* Temple AO */}
      <ellipse cx={50 - rx + 2} cy="40" rx="5" ry="7" fill={ao} />
      <ellipse cx={50 + rx - 2} cy="40" rx="5" ry="7" fill={ao} />

      {/* Forehead highlight — key light bounce */}
      <ellipse cx="45" cy="39" rx="11" ry="8" fill={hi} />

      {/* Center nose bridge highlight */}
      <path d="M49 42 Q50 56 49 68" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </>
  );
}

// ─── EYES ────────────────────────────────────────────────────────────────────
export function EyeLayer({ eyeConfig, eyebrowConfig, eyelashConfig }) {
  const ec = eyeConfig?.color || '#2D3436';
  const eyeType = eyeConfig?.type || 'almond';
  const browType = eyebrowConfig?.type || 'natural';
  const lashType = eyelashConfig?.type || 'natural';
  const browColor = '#2a1f10';
  const browHi = adjustHex(browColor, 20);

  const Lx = 36, Ly = 54;
  const Rx = 64, Ry = 54;

  function EyeShape({ cx, cy }) {
    // AO shadow under each eye
    const aoY = cy + 5;
    switch (eyeType) {
      case 'round': return (
        <>
          <ellipse cx={cx} cy={aoY} rx="7" ry="2.5" fill="rgba(0,0,0,0.1)" />
          <ellipse cx={cx} cy={cy} rx="7.2" ry="7.2" fill="white" />
          <circle cx={cx} cy={cy} r="4.6" fill={ec} />
          <circle cx={cx} cy={cy} r="2.6" fill="#080808" />
          {/* Iris depth ring */}
          <circle cx={cx} cy={cy} r="3.8" fill="none" stroke={adjustHex(ec, -18)} strokeWidth="0.6" opacity="0.5"/>
          {/* Primary specular */}
          <circle cx={cx + 1.8} cy={cy - 1.8} r="1.5" fill="white" />
          {/* Secondary small specular */}
          <circle cx={cx - 1.2} cy={cy + 1.2} r="0.6" fill="rgba(255,255,255,0.55)" />
        </>
      );
      case 'cat': return (
        <>
          <ellipse cx={cx} cy={aoY} rx="8" ry="2.5" fill="rgba(0,0,0,0.1)" />
          <ellipse cx={cx} cy={cy} rx="7.8" ry="4.8" fill="white" style={{ transform: `rotate(-8deg)`, transformOrigin: `${cx}px ${cy}px`}} />
          <ellipse cx={cx} cy={cy} rx="4.8" ry="3.6" fill={ec} style={{ transform: `rotate(-8deg)`, transformOrigin: `${cx}px ${cy}px`}} />
          <ellipse cx={cx} cy={cy} rx="2.1" ry="3.2" fill="#080808" />
          <circle cx={cx + 1.6} cy={cy - 1.2} r="1.3" fill="white" />
          <circle cx={cx - 0.9} cy={cy + 1} r="0.5" fill="rgba(255,255,255,0.5)" />
        </>
      );
      case 'hooded': return (
        <>
          <ellipse cx={cx} cy={aoY + 1} rx="7" ry="2.2" fill="rgba(0,0,0,0.09)" />
          <ellipse cx={cx} cy={cy + 1} rx="6.8" ry="4.2" fill="white" />
          <circle cx={cx} cy={cy + 1} r="4.1" fill={ec} />
          <circle cx={cx} cy={cy + 1} r="2.3" fill="#080808" />
          <circle cx={cx + 1.4} cy={cy - 0.5} r="1.1" fill="white" />
          <circle cx={cx - 0.8} cy={cy + 1.8} r="0.5" fill="rgba(255,255,255,0.5)" />
        </>
      );
      case 'wide': return (
        <>
          <ellipse cx={cx} cy={aoY} rx="9" ry="2.8" fill="rgba(0,0,0,0.1)" />
          <ellipse cx={cx} cy={cy} rx="8.2" ry="5.8" fill="white" />
          <circle cx={cx} cy={cy} r="5" fill={ec} />
          <circle cx={cx} cy={cy} r="3" fill="#080808" />
          <circle cx={cx + 1.4} cy={cy - 4} r="0.5" fill="none" stroke={adjustHex(ec,-12)} strokeWidth="0.6" opacity="0.4"/>
          <circle cx={cx + 2} cy={cy - 2} r="1.5" fill="white" />
          <circle cx={cx - 1.2} cy={cy + 1.5} r="0.6" fill="rgba(255,255,255,0.5)" />
        </>
      );
      default: // almond
        return (
          <>
            <ellipse cx={cx} cy={aoY} rx="7.5" ry="2.2" fill="rgba(0,0,0,0.09)" />
            <ellipse cx={cx} cy={cy} rx="7.2" ry="5" fill="white" />
            <circle cx={cx} cy={cy} r="4.3" fill={ec} />
            {/* Iris detail ring */}
            <circle cx={cx} cy={cy} r="3.5" fill="none" stroke={adjustHex(ec, -16)} strokeWidth="0.5" opacity="0.45"/>
            <circle cx={cx} cy={cy} r="2.5" fill="#080808" />
            {/* Primary specular highlight */}
            <circle cx={cx + 1.6} cy={cy - 1.6} r="1.3" fill="white" />
            {/* Secondary specular */}
            <circle cx={cx - 0.9} cy={cy + 1.1} r="0.55" fill="rgba(255,255,255,0.55)" />
          </>
        );
    }
  }

  function Brow({ cx, cy }) {
    const by = cy - 11;
    switch (browType) {
      case 'arched':
        return (
          <>
            <path d={`M${cx-7} ${by+2} Q${cx+1} ${by-7} ${cx+7} ${by}`} stroke={browColor} strokeWidth="2.8" fill="none" strokeLinecap="round"/>
            <path d={`M${cx-6} ${by+1.5} Q${cx+1} ${by-6} ${cx+6} ${by+0.5}`} stroke={browHi} strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.25"/>
          </>
        );
      case 'thick':
        return (
          <>
            <path d={`M${cx-7} ${by+1} Q${cx} ${by-5} ${cx+7} ${by+1}`} stroke={browColor} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
            <path d={`M${cx-6} ${by} Q${cx} ${by-4} ${cx+6} ${by}`} stroke={browHi} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.2"/>
          </>
        );
      case 'thin':
        return (
          <path d={`M${cx-7} ${by} Q${cx} ${by-4} ${cx+7} ${by}`} stroke={browColor} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        );
      default: // natural
        return (
          <>
            <path d={`M${cx-7} ${by+1} Q${cx} ${by-6} ${cx+7} ${by+1}`} stroke={browColor} strokeWidth="2.6" fill="none" strokeLinecap="round"/>
            <path d={`M${cx-5} ${by} Q${cx} ${by-5} ${cx+5} ${by}`} stroke={browHi} strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.22"/>
          </>
        );
    }
  }

  function Lashes({ cx, cy }) {
    if (lashType === 'none') return null;
    const base = cy - 4.8;
    if (lashType === 'dramatic') return (
      <>
        <line x1={cx-6} y1={base} x2={cx-11} y2={base-7} stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1={cx-3} y1={base-0.5} x2={cx-5} y2={base-8} stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1={cx} y1={base-0.8} x2={cx} y2={base-8.5} stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1={cx+3} y1={base-0.5} x2={cx+5} y2={base-8} stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1={cx+6} y1={base} x2={cx+10} y2={base-6} stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
        {/* AO cast shadow from lashes on eyelid */}
        <path d={`M${cx-6} ${cy-4} Q${cx} ${cy-3.5} ${cx+6} ${cy-4}`} stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none"/>
      </>
    );
    return (
      <>
        <line x1={cx-4} y1={base} x2={cx-6.5} y2={base-5} stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1={cx} y1={base-0.5} x2={cx} y2={base-5.5} stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1={cx+4} y1={base} x2={cx+6.5} y2={base-5} stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
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

// ─── NOSE ────────────────────────────────────────────────────────────────────
export function NoseLayer({ noseConfig }) {
  const type = noseConfig?.type || 'button';
  const ao = 'rgba(0,0,0,0.11)';
  const hi = 'rgba(255,255,255,0.14)';
  switch (type) {
    case 'wide': return (
      <>
        <ellipse cx="50" cy="64" rx="2" ry="4" fill={ao} opacity="0.7"/>
        <ellipse cx="44" cy="68" rx="4.5" ry="3" fill={ao} /><ellipse cx="56" cy="68" rx="4.5" ry="3" fill={ao} />
        <ellipse cx="44" cy="67.2" rx="1.5" ry="1" fill={hi} /><ellipse cx="56" cy="67.2" rx="1.5" ry="1" fill={hi} />
      </>
    );
    case 'narrow': return (
      <>
        <path d="M50 62 Q49 67 47 70 Q50 72 53 70 Q51 67 50 62 Z" fill={ao} opacity="0.8"/>
        <ellipse cx="47.5" cy="70" rx="1.8" ry="1.3" fill={ao} /><ellipse cx="52.5" cy="70" rx="1.8" ry="1.3" fill={ao} />
        <ellipse cx="50" cy="63" rx="0.8" ry="1.2" fill={hi} opacity="0.6"/>
      </>
    );
    case 'upturned': return (
      <>
        <path d="M45 71 Q50 64 55 71" stroke={ao} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <ellipse cx="46" cy="71" rx="2.2" ry="1.6" fill={ao} /><ellipse cx="54" cy="71" rx="2.2" ry="1.6" fill={ao} />
        <ellipse cx="46.5" cy="70.3" rx="0.9" ry="0.7" fill={hi} /><ellipse cx="54.5" cy="70.3" rx="0.9" ry="0.7" fill={hi} />
      </>
    );
    default: // button
      return (
        <>
          <ellipse cx="50" cy="66" rx="5" ry="4" fill={ao} />
          <ellipse cx="47" cy="70" rx="2.2" ry="1.6" fill={ao} /><ellipse cx="53" cy="70" rx="2.2" ry="1.6" fill={ao} />
          {/* Nose highlight */}
          <ellipse cx="49" cy="65" rx="1.8" ry="1.2" fill={hi} />
        </>
      );
  }
}

// ─── CHEEKS ───────────────────────────────────────────────────────────────────
export function CheeksLayer({ expression }) {
  const base = expression === 'happy' || expression === 'excited' ? 0.34 : 0.14;
  return (
    <>
      <ellipse cx="29" cy="65" rx="8" ry="4.5" fill={`rgba(255,120,100,${base})`} />
      <ellipse cx="71" cy="65" rx="8" ry="4.5" fill={`rgba(255,120,100,${base})`} />
      {/* Subtle inner glow */}
      <ellipse cx="29" cy="65" rx="4" ry="2.5" fill={`rgba(255,150,130,${base * 0.5})`} />
      <ellipse cx="71" cy="65" rx="4" ry="2.5" fill={`rgba(255,150,130,${base * 0.5})`} />
    </>
  );
}

// ─── MOUTH ───────────────────────────────────────────────────────────────────
export function MouthLayer({ mouthConfig, expression }) {
  const lc = mouthConfig?.lipColor || '#C48A8A';
  const dark = adjustHex(lc, -25);
  const hi = adjustHex(lc, 35);
  const EXPR_MAP = { neutral: 'smile', happy: 'open', excited: 'open', focused: 'smirk' };
  const type = expression && expression !== 'neutral' ? (EXPR_MAP[expression] || mouthConfig?.type) : (mouthConfig?.type || 'smile');

  switch (type) {
    case 'smirk': return (
      <>
        {/* Lip shadow under */}
        <path d="M37 78 Q44 83.5 60 75" stroke="rgba(0,0,0,0.12)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M37 77 Q44 82 60 74" stroke={lc} strokeWidth="2.8" fill="none" strokeLinecap="round"/>
        <path d="M37 77 Q40 79 44 77.5" stroke={hi} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.4"/>
        {/* Dimple */}
        <circle cx="60" cy="74.5" r="1.2" fill={dark} opacity="0.4"/>
      </>
    );
    case 'open': return (
      <>
        {/* Lip shape */}
        <path d="M37 75 Q50 87 63 75" fill={lc} opacity="0.88"/>
        {/* Mouth cavity with depth */}
        <ellipse cx="50" cy="80" rx="11.5" ry="6.5" fill="#140808"/>
        {/* Teeth — subtle shading */}
        <ellipse cx="50" cy="78" rx="10" ry="4.2" fill="rgba(248,244,240,0.96)"/>
        <line x1="41" y1="79" x2="59" y2="79" stroke="rgba(0,0,0,0.07)" strokeWidth="0.6"/>
        {/* Tooth divisions */}
        {[44, 47, 50, 53, 56].map(x => (
          <line key={x} x1={x} y1="75.5" x2={x} y2="79" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5"/>
        ))}
        {/* Upper lip outline */}
        <path d="M37 75 Q50 87 63 75" stroke={dark} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        {/* Lip highlight */}
        <path d="M40 75 Q50 78 60 75" stroke={hi} strokeWidth="1" fill="none" opacity="0.35" strokeLinecap="round"/>
      </>
    );
    case 'pouty': return (
      <>
        <path d="M37 78 Q50 88 63 78" stroke="rgba(0,0,0,0.1)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M39 73 Q44 78 50 73 Q56 78 61 73" fill={lc} opacity="0.92"/>
        <path d="M39 73 Q50 83 61 73" fill={dark} opacity="0.18"/>
        <path d="M39 73 Q50 83 61 73" stroke={dark} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M40 73 Q50 75.5 60 73" stroke={hi} strokeWidth="0.9" fill="none" opacity="0.4" strokeLinecap="round"/>
      </>
    );
    default: // smile
      return (
        <>
          <path d="M37 77 Q50 87.5 63 77" stroke="rgba(0,0,0,0.1)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M37 76 Q50 86 63 76" stroke={lc} strokeWidth="2.8" fill="none" strokeLinecap="round"/>
          <path d="M38 76 Q50 84 62 76" stroke={hi} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.35"/>
          {/* Smile dimples */}
          <circle cx="37.5" cy="76.5" r="1.5" fill={dark} opacity="0.3"/>
          <circle cx="62.5" cy="76.5" r="1.5" fill={dark} opacity="0.3"/>
        </>
      );
  }
}

// ─── HAIR FRONT ──────────────────────────────────────────────────────────────
export function HairFront({ style, color }) {
  const hc = color || '#1C1008';
  const hi = adjustHex(hc, 28);
  const sh = adjustHex(hc, -28);
  const fold = adjustHex(hc, -18);

  switch (style) {
    case 'medium_wave': return (
      <>
        <ellipse cx="50" cy="26" rx="32" ry="19" fill={hc} />
        {/* Wave side strands with folds */}
        <path d="M18 30 Q14 46 18 56" stroke={hc} strokeWidth="13" fill="none" strokeLinecap="round"/>
        <path d="M82 30 Q86 46 82 56" stroke={hc} strokeWidth="13" fill="none" strokeLinecap="round"/>
        {/* Fold depth lines */}
        <path d="M19 30 Q15.5 46 19 55" stroke={sh} strokeWidth="3" fill="none" opacity="0.35" strokeLinecap="round"/>
        <path d="M81 30 Q84.5 46 81 55" stroke={sh} strokeWidth="3" fill="none" opacity="0.35" strokeLinecap="round"/>
        {/* Hair shine */}
        <ellipse cx="43" cy="19" rx="13" ry="5" fill={hi} opacity="0.28"/>
        <ellipse cx="38" cy="17" rx="5" ry="2.5" fill={hi} opacity="0.22"/>
      </>
    );
    case 'long_straight': return (
      <>
        <ellipse cx="50" cy="24" rx="32" ry="18" fill={hc} />
        {/* Strand depth */}
        <path d="M21 22 Q18 32 19 40" stroke={sh} strokeWidth="3" fill="none" opacity="0.3" strokeLinecap="round"/>
        <path d="M79 22 Q82 32 81 40" stroke={sh} strokeWidth="3" fill="none" opacity="0.3" strokeLinecap="round"/>
        <ellipse cx="43" cy="18" rx="12" ry="4.5" fill={hi} opacity="0.27"/>
      </>
    );
    case 'curly_big': return (
      <>
        <ellipse cx="50" cy="20" rx="36" ry="22" fill={hc} />
        {/* Side curls */}
        <circle cx="19" cy="30" r="11" fill={hc} />
        <circle cx="81" cy="30" r="11" fill={hc} />
        <circle cx="14" cy="45" r="8" fill={hc} />
        <circle cx="86" cy="45" r="8" fill={hc} />
        {/* Curl AO shadows */}
        <circle cx="19" cy="30" r="8" fill={sh} opacity="0.2" />
        <circle cx="81" cy="30" r="8" fill={sh} opacity="0.2" />
        {/* Top highlight */}
        <ellipse cx="41" cy="13" rx="13" ry="5.5" fill={hi} opacity="0.24"/>
        <ellipse cx="36" cy="11" rx="5" ry="2.5" fill={hi} opacity="0.2"/>
      </>
    );
    case 'bun_top': return (
      <>
        <rect x="22" y="28" width="56" height="16" rx="8" fill={hc} />
        {/* Bun */}
        <circle cx="50" cy="15" r="14" fill={hc} />
        {/* Bun highlight */}
        <circle cx="45" cy="10" r="7" fill={hi} opacity="0.22"/>
        <ellipse cx="43" cy="9" rx="4" ry="2.5" fill={hi} opacity="0.25"/>
        {/* Bun wrap line */}
        <path d="M37 15 Q50 8 63 15" stroke={sh} strokeWidth="1.5" fill="none" opacity="0.3"/>
        {/* Band AO */}
        <rect x="22" y="28" width="56" height="4" rx="4" fill={sh} opacity="0.35"/>
      </>
    );
    case 'undercut': return (
      <>
        {/* Shaved sides */}
        <rect x="18" y="26" width="12" height="18" rx="6" fill={adjustHex(hc, -8)} opacity="0.7"/>
        <rect x="70" y="26" width="12" height="18" rx="6" fill={adjustHex(hc, -8)} opacity="0.7"/>
        {/* Top part */}
        <rect x="22" y="18" width="56" height="22" rx="9" fill={hc} />
        <ellipse cx="43" cy="20" rx="13" ry="5" fill={hi} opacity="0.27"/>
        {/* Fade line AO */}
        <path d="M22 34 Q50 37 78 34" stroke={sh} strokeWidth="1.5" fill="none" opacity="0.4"/>
      </>
    );
    case 'afro': return (
      <>
        <ellipse cx="50" cy="19" rx="38" ry="28" fill={hc} />
        <ellipse cx="18" cy="34" rx="14" ry="16" fill={hc} />
        <ellipse cx="82" cy="34" rx="14" ry="16" fill={hc} />
        {/* AO shadow at base */}
        <ellipse cx="50" cy="36" rx="28" ry="6" fill={sh} opacity="0.3"/>
        {/* Volume highlight */}
        <ellipse cx="43" cy="10" rx="15" ry="6.5" fill={hi} opacity="0.22"/>
      </>
    );
    case 'ponytail': return (
      <>
        <rect x="22" y="22" width="56" height="20" rx="9" fill={hc} />
        {/* Pulled-back strands */}
        <path d="M23 28 Q50 32 77 28" stroke={sh} strokeWidth="1.5" fill="none" opacity="0.25"/>
        <ellipse cx="43" cy="24" rx="12" ry="4.5" fill={hi} opacity="0.26"/>
      </>
    );
    case 'bob': return (
      <>
        <ellipse cx="50" cy="24" rx="32" ry="17" fill={hc} />
        {/* Side strands depth */}
        <path d="M20 22 Q17 32 19 42" stroke={sh} strokeWidth="3" fill="none" opacity="0.28" strokeLinecap="round"/>
        <path d="M80 22 Q83 32 81 42" stroke={sh} strokeWidth="3" fill="none" opacity="0.28" strokeLinecap="round"/>
        <ellipse cx="43" cy="18" rx="11" ry="4" fill={hi} opacity="0.27"/>
      </>
    );
    case 'bald': return (
      <>
        {/* Scalp highlight */}
        <ellipse cx="44" cy="36" rx="14" ry="6" fill="rgba(255,255,255,0.1)" />
        <ellipse cx="40" cy="33" rx="6" ry="3" fill="rgba(255,255,255,0.07)" />
      </>
    );
    default: // short_clean
      return (
        <>
          <ellipse cx="50" cy="25" rx="30" ry="17" fill={hc} />
          {/* Side coverage */}
          <rect x="20" y="24" width="13" height="12" rx="6" fill={hc} />
          <rect x="67" y="24" width="13" height="12" rx="6" fill={hc} />
          {/* Hair shine */}
          <ellipse cx="43" cy="18" rx="12" ry="4.5" fill={hi} opacity="0.27"/>
          <ellipse cx="38" cy="16" rx="5" ry="2.2" fill={hi} opacity="0.2"/>
          {/* AO at hairline */}
          <path d="M22 34 Q50 38 78 34" stroke={sh} strokeWidth="1" fill="none" opacity="0.25"/>
        </>
      );
  }
}

// ─── ACCESSORIES — 3D assets with AO, metallic, fabric ───────────────────────
export function AccessoryLayer({ accessory }) {
  switch (accessory) {
    case 'glasses_round': return (
      <>
        {/* AO shadow cast on face */}
        <ellipse cx="36" cy="57" rx="10" ry="3" fill="rgba(0,0,0,0.12)" />
        <ellipse cx="64" cy="57" rx="10" ry="3" fill="rgba(0,0,0,0.12)" />
        {/* Frame */}
        <circle cx="36" cy="54" r="9.5" fill="none" stroke="#1a1616" strokeWidth="2.5" opacity="0.8"/>
        <circle cx="64" cy="54" r="9.5" fill="none" stroke="#1a1616" strokeWidth="2.5" opacity="0.8"/>
        {/* Lens tint */}
        <circle cx="36" cy="54" r="9.5" fill="rgba(140,190,255,0.07)"/>
        <circle cx="64" cy="54" r="9.5" fill="rgba(140,190,255,0.07)"/>
        {/* Lens specular reflection arc */}
        <path d="M29 49 Q36 47 43 49" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M57 49 Q64 47 71 49" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        {/* Bridge */}
        <line x1="45.5" y1="54" x2="54.5" y2="54" stroke="#1a1616" strokeWidth="2" opacity="0.75"/>
        {/* Temple arms */}
        <line x1="23" y1="51.5" x2="26.5" y2="54" stroke="#1a1616" strokeWidth="2.2" opacity="0.8"/>
        <line x1="77" y1="51.5" x2="73.5" y2="54" stroke="#1a1616" strokeWidth="2.2" opacity="0.8"/>
        {/* Frame highlight — metallic top edge */}
        <path d="M29 50 Q36 48 43 50" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" fill="none"/>
        <path d="M57 50 Q64 48 71 50" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" fill="none"/>
      </>
    );
    case 'glasses_square': return (
      <>
        <ellipse cx="36" cy="57" rx="11" ry="3" fill="rgba(0,0,0,0.12)"/>
        <ellipse cx="64" cy="57" rx="11" ry="3" fill="rgba(0,0,0,0.12)"/>
        <rect x="25.5" y="49" width="21" height="13.5" rx="3.5" fill="rgba(140,190,255,0.07)" stroke="#1a1616" strokeWidth="2.4" opacity="0.8"/>
        <rect x="53.5" y="49" width="21" height="13.5" rx="3.5" fill="rgba(140,190,255,0.07)" stroke="#1a1616" strokeWidth="2.4" opacity="0.8"/>
        {/* Lens specular */}
        <path d="M27 51 L38 51" stroke="rgba(255,255,255,0.32)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
        <path d="M55 51 L66 51" stroke="rgba(255,255,255,0.32)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
        <line x1="46.5" y1="55.5" x2="53.5" y2="55.5" stroke="#1a1616" strokeWidth="2" opacity="0.75"/>
        <line x1="22" y1="52" x2="25.5" y2="54.5" stroke="#1a1616" strokeWidth="2.2" opacity="0.8"/>
        <line x1="78" y1="52" x2="74.5" y2="54.5" stroke="#1a1616" strokeWidth="2.2" opacity="0.8"/>
        {/* Frame top highlight */}
        <line x1="27" y1="50" x2="45" y2="50" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8"/>
        <line x1="55" y1="50" x2="73" y2="50" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8"/>
      </>
    );
    case 'sunglasses': return (
      <>
        {/* Cast shadow on face */}
        <ellipse cx="50" cy="60" rx="26" ry="3.5" fill="rgba(0,0,0,0.18)"/>
        {/* Dark lenses with gradient */}
        <path d="M24 55 Q36 48 48 55 L47 63 Q36 66 25 63 Z" fill="#111" opacity="0.94"/>
        <path d="M52 55 Q64 48 76 55 L75 63 Q64 66 53 63 Z" fill="#111" opacity="0.94"/>
        {/* Lens highlight — realistic reflection */}
        <path d="M27 51 Q36 49 45 51" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M55 51 Q64 49 73 51" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Small specular dot */}
        <circle cx="30" cy="52" r="1.5" fill="rgba(255,255,255,0.3)"/>
        <circle cx="58" cy="52" r="1.5" fill="rgba(255,255,255,0.3)"/>
        {/* Bridge */}
        <path d="M48 55 Q50 53 52 55" stroke="#222" strokeWidth="2.5" fill="none"/>
        {/* Temple arms */}
        <line x1="22" y1="51" x2="25" y2="55" stroke="#111" strokeWidth="2.8"/>
        <line x1="78" y1="51" x2="75" y2="55" stroke="#111" strokeWidth="2.8"/>
      </>
    );
    case 'cap': return (
      <>
        {/* Cap shadow on forehead */}
        <ellipse cx="50" cy="32" rx="34" ry="5" fill="rgba(0,0,0,0.18)"/>
        {/* Cap body with fabric depth */}
        <path d="M18 28 Q20 14 50 13 Q80 14 82 28 Q70 32 50 33 Q30 32 18 28 Z" fill="#2A2A2A"/>
        {/* Cap panels */}
        <path d="M50 13 Q50 33 50 33" stroke="#1a1a1a" strokeWidth="0.8" opacity="0.5"/>
        <path d="M34 13.5 Q32 23 30 33" stroke="#1a1a1a" strokeWidth="0.6" opacity="0.3"/>
        <path d="M66 13.5 Q68 23 70 33" stroke="#1a1a1a" strokeWidth="0.6" opacity="0.3"/>
        {/* Brim */}
        <path d="M16 30 Q30 36 50 36 Q70 36 84 30 L86 35 Q70 40 50 40 Q30 40 14 35 Z" fill="#1a1a1a" opacity="0.9"/>
        <path d="M16 30 Q50 38 84 30" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8"/>
        {/* Cap sweatband */}
        <path d="M18 28 Q50 32 82 28 Q80 30 50 31 Q20 30 18 28 Z" fill="#1a1a1a" opacity="0.6"/>
        {/* Crown highlight */}
        <ellipse cx="44" cy="17" rx="10" ry="4" fill="rgba(255,255,255,0.07)"/>
        {/* Brim highlight edge */}
        <path d="M17 31 Q50 37 83 31" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"/>
      </>
    );
    case 'beanie': return (
      <>
        {/* Beanie body */}
        <path d="M18 28 Q16 14 50 11 Q84 14 82 28 L80 42 Q50 46 20 42 Z" fill="#A78BFA"/>
        {/* Knit ribbing lines */}
        {[18, 22, 26, 30, 34, 38].map(y => (
          <path key={y} d={`M${18 + (y-18)*0.4} ${y} Q50 ${y+1} ${82-(y-18)*0.4} ${y}`}
            stroke="#8B5CF6" strokeWidth="0.7" fill="none" opacity="0.55"/>
        ))}
        {/* Fold band */}
        <path d="M18 36 Q50 40 82 36 L80 42 Q50 46 20 42 Z" fill="#8B5CF6" opacity="0.65"/>
        {[37, 39, 41].map(y => (
          <path key={y} d={`M20 ${y} Q50 ${y+0.5} 80 ${y}`} stroke="#7C3AED" strokeWidth="0.6" fill="none" opacity="0.45"/>
        ))}
        {/* Pom-pom with fuzzy depth */}
        <circle cx="50" cy="9" r="10" fill="#C4B5FD"/>
        <circle cx="50" cy="9" r="7" fill="#DDD6FE"/>
        <circle cx="50" cy="9" r="4" fill="#EDE9FE"/>
        <circle cx="47" cy="6" r="2.5" fill="rgba(255,255,255,0.45)"/>
        {/* Beanie highlight */}
        <ellipse cx="40" cy="17" rx="10" ry="4" fill="rgba(255,255,255,0.12)"/>
      </>
    );
    case 'earrings': return (
      <>
        {/* Gold stud earrings with metallic sheen */}
        {/* Left */}
        <circle cx="22" cy="60" r="4.5" fill="#D4A017"/>
        <circle cx="22" cy="60" r="4.5" fill="none" stroke="#B8860B" strokeWidth="0.8"/>
        <circle cx="20.5" cy="58.5" r="1.8" fill="#F5D060"/>
        <circle cx="20.2" cy="58.2" r="0.7" fill="rgba(255,255,255,0.55)"/>
        {/* Right */}
        <circle cx="78" cy="60" r="4.5" fill="#D4A017"/>
        <circle cx="78" cy="60" r="4.5" fill="none" stroke="#B8860B" strokeWidth="0.8"/>
        <circle cx="76.5" cy="58.5" r="1.8" fill="#F5D060"/>
        <circle cx="76.2" cy="58.2" r="0.7" fill="rgba(255,255,255,0.55)"/>
        {/* Drop shadow */}
        <ellipse cx="22" cy="64" rx="3" ry="1" fill="rgba(0,0,0,0.2)"/>
        <ellipse cx="78" cy="64" rx="3" ry="1" fill="rgba(0,0,0,0.2)"/>
      </>
    );
    case 'headband': return (
      <>
        {/* AO shadow under headband on hair */}
        <path d="M19 34 Q50 40 81 34" stroke="rgba(0,0,0,0.2)" strokeWidth="4" fill="none"/>
        {/* Headband body — fabric with stretch */}
        <path d="M18 28 Q50 34 82 28 L82 38 Q50 44 18 38 Z" fill="#FC8181"/>
        {/* Fabric texture */}
        {[30, 33, 36].map(y => (
          <path key={y} d={`M19 ${y} Q50 ${y+1} 81 ${y}`} stroke="#E57373" strokeWidth="0.7" fill="none" opacity="0.4"/>
        ))}
        {/* Top highlight */}
        <path d="M20 29 Q50 35 80 29" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        {/* Center fold highlight */}
        <ellipse cx="50" cy="33" rx="12" ry="2.5" fill="rgba(255,255,255,0.12)"/>
      </>
    );
    default: return null;
  }
}