/**
 * Bitmoji-style avatar — stor huvud, liten kropp, mjuk tecknad stil med tydlig kontur.
 */
import React, { useId } from 'react';
import { EXPRESSION_MOUTH_MAP } from './AvatarConfig';
import { OUTLINE, OUTLINE_WIDTH } from './bitmojiTheme';

export function hexBlend(a, b, t) {
  if (!a || !b) return a || b || '#888';
  const p = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  return (
    '#' +
    [r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function hexAdjust(hex, amt) {
  if (!hex?.startsWith('#')) return hex || '#888';
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const LONG = ['long_straight', 'curly_big', 'ponytail', 'bob'];

function strokeProps(extra = {}) {
  return {
    stroke: OUTLINE,
    strokeWidth: OUTLINE_WIDTH,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...extra,
  };
}

function Head({ skin, shape, uid }) {
  const cx = 100;
  const cy = 88;
  let w = 58;
  let h = 62;
  if (shape === 'round') {
    w = 60;
    h = 58;
  }
  if (shape === 'square') {
    w = 56;
    h = 54;
  }
  if (shape === 'heart') {
    w = 52;
    h = 64;
  }

  const face = `
    M${cx - w} ${cy - 6}
    C${cx - w - 2} ${cy - h} ${cx - 8} ${cy - h - 4} ${cx} ${cy - h - 2}
    C${cx + 8} ${cy - h - 4} ${cx + w + 2} ${cy - h} ${cx + w} ${cy - 6}
    C${cx + w + 4} ${cy + 14} ${cx + w - 4} ${cy + h - 4} ${cx} ${cy + h + 4}
    C${cx - w + 4} ${cy + h - 4} ${cx - w - 4} ${cy + 14} ${cx - w} ${cy - 6} Z`;

  return (
    <g>
      <ellipse cx={cx} cy={cy + h + 8} rx={w * 0.75} ry={10} fill="#000" opacity="0.08" />
      <path d={face} fill={`url(#${uid}_skin)`} {...strokeProps()} />
      <ellipse cx={cx - 22} cy={cy + 14} rx={14} ry={10} fill={`url(#${uid}_blush)`} />
      <ellipse cx={cx + 22} cy={cy + 14} rx={14} ry={10} fill={`url(#${uid}_blush)`} />
      <ellipse cx={cx - 18} cy={cy - 18} rx={22} ry={14} fill="#fff" opacity="0.22" />
    </g>
  );
}

function Ear({ cx, cy, skin }) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={9}
      ry={11}
      fill={hexBlend(skin, '#000', 0.06)}
      {...strokeProps()}
    />
  );
}

function Eye({ cx, cy, type, color }) {
  const map = {
    round: [11, 12],
    almond: [10, 11],
    wide: [12, 13],
    cat: [11, 10],
    hooded: [10, 10],
  };
  const [rx, ry] = map[type] || map.round;

  return (
    <g>
      <path
        d={`M${cx - rx - 4} ${cy + 2} Q${cx} ${cy - ry - 6} ${cx + rx + 4} ${cy + 2}`}
        fill="none"
        {...strokeProps({ strokeWidth: 3.2 })}
      />
      <ellipse cx={cx} cy={cy + 1} rx={rx + 3} ry={ry + 2} fill="#fff" {...strokeProps({ strokeWidth: 2.2 })} />
      <ellipse cx={cx} cy={cy + 2} rx={rx * 0.78} ry={ry * 0.82} fill={color} />
      <ellipse cx={cx} cy={cy + 3} rx={rx * 0.42} ry={ry * 0.45} fill="#1a1008" />
      <circle cx={cx - 3.5} cy={cy - 2} r={3.8} fill="#fff" />
      <circle cx={cx + 4} cy={cy - 0.5} r={2} fill="#fff" opacity="0.9" />
    </g>
  );
}

function Brow({ cx, cy, type }) {
  const thick = type === 'thick' ? 4.5 : type === 'thin' ? 2 : 3.2;
  const lift = type === 'arched' ? -8 : -5;
  return (
    <path
      d={`M${cx - 14} ${cy + 4} Q${cx} ${cy + lift} ${cx + 14} ${cy + 2}`}
      fill="none"
      stroke="#2B2118"
      strokeWidth={thick}
      strokeLinecap="round"
    />
  );
}

function Nose({ type }) {
  if (type === 'wide')
    return <ellipse cx="100" cy="108" rx="5" ry="3.5" fill={OUTLINE} opacity="0.1" />;
  if (type === 'narrow')
    return <path d="M100 102 L98.5 110 L101.5 110 Z" fill={OUTLINE} opacity="0.15" />;
  return (
    <path
      d="M100 102 Q99 108 100 111 Q101 108 100 102"
      fill="none"
      stroke={OUTLINE}
      strokeWidth="2"
      opacity="0.2"
      strokeLinecap="round"
    />
  );
}

function Mouth({ type, lip, expression }) {
  const m = EXPRESSION_MOUTH_MAP[expression] || type || 'smile';
  const c = lip || '#E85D6A';
  if (m === 'open')
    return (
      <g>
        <ellipse cx="100" cy="122" rx="14" ry="11" fill="#4A1520" {...strokeProps({ strokeWidth: 2 })} />
        <ellipse cx="100" cy="118" rx="12" ry="5" fill="#fff" />
        <path d="M86 122 Q100 134 114 122" fill="none" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      </g>
    );
  if (m === 'pouty')
    return <ellipse cx="100" cy="124" rx="9" ry="6" fill={c} {...strokeProps({ strokeWidth: 2 })} />;
  if (m === 'smirk')
    return (
      <path
        d="M86 122 Q102 128 118 116"
        fill="none"
        stroke={c}
        strokeWidth="4"
        strokeLinecap="round"
      />
    );
  return (
    <path
      d="M84 118 Q100 130 116 118"
      fill="none"
      stroke={c}
      strokeWidth="4.2"
      strokeLinecap="round"
    />
  );
}

function HairBack({ style, color }) {
  const dk = hexAdjust(color, -28);
  switch (style) {
    case 'long_straight':
      return (
        <path
          d="M42 70 Q38 175 55 195 Q100 205 145 195 Q162 175 158 70"
          fill={dk}
          {...strokeProps()}
        />
      );
    case 'curly_big':
      return (
        <path
          d="M35 75 Q25 120 32 165 Q55 200 100 205 Q145 200 168 165 Q175 120 165 75"
          fill={color}
          {...strokeProps()}
        />
      );
    case 'ponytail':
      return (
        <g>
          <ellipse cx="100" cy="178" rx="22" ry="38" fill={color} {...strokeProps()} />
          <circle cx="100" cy="148" r="14" fill={hexAdjust(color, 20)} {...strokeProps()} />
        </g>
      );
    case 'bob':
      return (
        <path
          d="M48 72 Q44 150 58 172 Q100 182 142 172 Q156 150 152 72"
          fill={color}
          {...strokeProps()}
        />
      );
    default:
      return null;
  }
}

function HairFront({ style, color }) {
  if (style === 'bald') return null;
  const hi = hexAdjust(color, 22);
  const cap = `M44 78 Q40 38 100 28 Q160 38 156 78 Q145 52 100 44 Q55 52 44 78 Z`;

  if (style === 'afro') {
    return (
      <g>
        {[55, 72, 88, 100, 112, 128, 145].map((x, i) => (
          <circle
            key={x}
            cx={x}
            cy={42 + (i % 3) * 4}
            r={18}
            fill={i % 2 ? hi : color}
            {...strokeProps({ strokeWidth: 2 })}
          />
        ))}
      </g>
    );
  }
  if (style === 'bun_top') {
    return (
      <g>
        <path d={cap} fill={color} {...strokeProps()} />
        <circle cx="100" cy="22" r="22" fill={hi} {...strokeProps()} />
        <circle cx="92" cy="14" r="7" fill="#fff" opacity="0.4" />
      </g>
    );
  }
  if (style === 'undercut') {
    return (
      <g>
        <path d="M44 80 Q48 42 100 36 Q152 42 156 80 L156 58 Q100 48 44 58 Z" fill={hexAdjust(color, -35)} />
        <path
          d="M52 74 Q56 40 100 32 Q144 40 148 74 Q138 54 100 48 Q62 54 52 74"
          fill={color}
          {...strokeProps()}
        />
      </g>
    );
  }
  if (style === 'medium_wave') {
    return (
      <path
        d="M38 80 Q30 48 58 32 Q100 22 Q142 32 170 48 Q162 80 148 58 Q100 46 Q52 58 38 80"
        fill={color}
        {...strokeProps()}
      />
    );
  }
  if (style === 'curly_big') {
    return (
      <path
        d="M32 82 Q20 50 55 28 Q100 18 Q145 28 170 50 Q158 82 145 55 Q100 42 Q55 55 32 82"
        fill={hi}
        {...strokeProps()}
      />
    );
  }
  return <path d={cap} fill={color} {...strokeProps()} />;
}

function Torso({ skin, outfitStyle, outfitColor, uid }) {
  const c = outfitColor;
  const dk = hexAdjust(c, -22);
  const hi = hexBlend(c, '#fff', 0.25);
  const neck = hexBlend(skin, '#000', 0.1);

  const bodyPath = `M28 168 Q32 138 100 132 Q168 138 172 168 L180 220 L20 220 Z`;

  let extras = null;
  if (outfitStyle === 'hoodie') {
    extras = (
      <>
        <path d="M100 138 L88 168 L112 168 Z" fill={dk} />
        <path d="M36 155 Q40 175 38 190" stroke={hi} strokeWidth="5" fill="none" opacity="0.35" strokeLinecap="round" />
        <circle cx="100" cy="158" r="3.5" fill={dk} />
      </>
    );
  } else if (outfitStyle === 'blazer' || outfitStyle === 'suit') {
    extras = (
      <>
        <path d="M100 134 L92 168 L108 168 Z" fill={hexBlend(c, '#fff', 0.12)} />
        <path d="M88 140 L100 158 L112 140 Z" fill="#fff" {...strokeProps({ strokeWidth: 2 })} />
      </>
    );
  } else if (outfitStyle === 'sport') {
    extras = (
      <>
        <path d="M28 168 L42 132 L52 220 Z" fill={hi} opacity="0.55" />
        <path d="M172 168 L158 132 L148 220 Z" fill={hi} opacity="0.55" />
      </>
    );
  }

  return (
    <g>
      <path d="M88 148 L82 168 L118 168 L112 148 Z" fill={neck} />
      <Ear cx={42} cy={108} skin={skin} />
      <Ear cx={158} cy={108} skin={skin} />
      <path d={bodyPath} fill={c} {...strokeProps()} />
      <path d={bodyPath} fill={`url(#${uid}_shirt)`} />
      {extras}
      <path d="M32 145 Q50 138 68 145" stroke={hi} strokeWidth="4" fill="none" opacity="0.25" strokeLinecap="round" />
    </g>
  );
}

function Accessory({ type, hairStyle }) {
  const hideUnderHat = ['cap', 'beanie'].includes(type);
  if (hideUnderHat && hairStyle !== 'bald') {
    /* hat drawn on top */
  }
  switch (type) {
    case 'glasses_round':
      return (
        <g>
          <circle cx="72" cy="98" r="16" fill="rgba(180,220,255,0.45)" {...strokeProps()} />
          <circle cx="128" cy="98" r="16" fill="rgba(180,220,255,0.45)" {...strokeProps()} />
          <path d="M88 98 L112 98" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'glasses_square':
      return (
        <g>
          <rect x="54" y="86" width="36" height="24" rx="6" fill="rgba(180,220,255,0.45)" {...strokeProps()} />
          <rect x="110" y="86" width="36" height="24" rx="6" fill="rgba(180,220,255,0.45)" {...strokeProps()} />
          <path d="M90 98 L110 98" stroke={OUTLINE} strokeWidth="3" />
        </g>
      );
    case 'sunglasses':
      return (
        <g>
          <path d="M48 98 Q72 82 96 98 L94 110 Q72 116 50 110 Z" fill="#111" {...strokeProps({ strokeWidth: 2.5 })} />
          <path d="M104 98 Q128 82 152 98 L150 110 Q128 116 106 110 Z" fill="#111" {...strokeProps({ strokeWidth: 2.5 })} />
          <path d="M96 98 Q100 92 104 98" stroke={OUTLINE} strokeWidth="2.5" fill="none" />
        </g>
      );
    case 'cap':
      return (
        <g>
          <path
            d="M32 68 Q36 38 100 34 Q164 38 168 68 Q148 76 100 78 Q52 76 32 68 Z"
            fill="#2D2D2D"
            {...strokeProps()}
          />
          <path
            d="M28 72 Q100 88 172 72 L176 80 Q100 96 24 80 Z"
            fill="#1a1a1a"
            {...strokeProps({ strokeWidth: 2.5 })}
          />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <path
            d="M40 72 Q38 42 100 36 Q162 42 160 72 L156 84 Q100 94 44 84 Z"
            fill="#6C4DFF"
            {...strokeProps()}
          />
          <circle cx="100" cy="28" r="18" fill="#9B7FFF" {...strokeProps()} />
        </g>
      );
    case 'earrings':
      return (
        <g>
          <circle cx="38" cy="112" r="6" fill="#FFD700" {...strokeProps({ strokeWidth: 2 })} />
          <circle cx="162" cy="112" r="6" fill="#FFD700" {...strokeProps({ strokeWidth: 2 })} />
        </g>
      );
    case 'headband':
      return (
        <path
          d="M42 72 Q100 86 158 72 L158 82 Q100 96 42 82 Z"
          fill="#FF5C8A"
          {...strokeProps()}
        />
      );
    default:
      return null;
  }
}

export function AvatarSVG({ config, size = 200, expression }) {
  const uid = `b${useId().replace(/:/g, '_')}`;
  const c = config || {};
  const bg = c.bg || '#5AC8FA';
  const skin = c.skinColor || '#FFCC9A';
  const hairStyle = c.hair?.style || 'short_clean';
  const hairColor = c.hair?.color || '#2C1810';
  const expr = expression || c.expression || 'neutral';
  const mouth = EXPRESSION_MOUTH_MAP[expr] || c.mouth?.type || 'smile';
  const acc = c.accessory;
  const hatCoversHair = acc === 'cap' || acc === 'beanie';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Avatar"
    >
      <defs>
        <radialGradient id={`${uid}_bg`} cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor={hexBlend(bg, '#fff', 0.28)} />
          <stop offset="85%" stopColor={bg} />
          <stop offset="100%" stopColor={hexAdjust(bg, -15)} />
        </radialGradient>
        <linearGradient id={`${uid}_skin`} x1="35%" y1="15%" x2="65%" y2="95%">
          <stop offset="0%" stopColor={hexBlend(skin, '#fff', 0.28)} />
          <stop offset="55%" stopColor={skin} />
          <stop offset="100%" stopColor={hexBlend(skin, '#000', 0.12)} />
        </linearGradient>
        <radialGradient id={`${uid}_blush`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF7A96" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FF7A96" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}_shirt`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={hexBlend(c.outfit?.color || '#5AC8FA', '#fff', 0.2)} />
          <stop offset="100%" stopColor={hexAdjust(c.outfit?.color || '#5AC8FA', -18)} />
        </linearGradient>
      </defs>

      <circle cx="100" cy="118" r="112" fill={`url(#${uid}_bg)`} />

      {LONG.includes(hairStyle) && !hatCoversHair && <HairBack style={hairStyle} color={hairColor} />}

      <Torso
        skin={skin}
        outfitStyle={c.outfit?.style || 'tshirt'}
        outfitColor={c.outfit?.color || '#5AC8FA'}
        uid={uid}
      />

      <Head skin={skin} shape={c.faceShape || 'oval'} uid={uid} />

      <Brow cx={72} cy={78} type={c.eyebrows?.type || 'natural'} />
      <Brow cx={128} cy={78} type={c.eyebrows?.type || 'natural'} />
      <Eye cx={72} cy={96} type={c.eyes?.type || 'round'} color={c.eyes?.color || '#4A3728'} />
      <Eye cx={128} cy={96} type={c.eyes?.type || 'round'} color={c.eyes?.color || '#4A3728'} />

      <Nose type={c.nose?.type || 'button'} />
      <Mouth type={mouth} lip={c.mouth?.lipColor} expression={expr} />

      {!hatCoversHair && <HairFront style={hairStyle} color={hairColor} />}

      <Accessory type={acc} hairStyle={hairStyle} />
    </svg>
  );
}