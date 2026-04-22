// AvatarDisplay — Composites all layers in correct Z-order

import React from 'react';
import { motion } from 'framer-motion';
import { HAIR_LONG_STYLES } from './AvatarConfig';
import {
  HairBack, BodyLayer, OutfitLayer, FaceLayer, EyeLayer,
  NoseLayer, CheeksLayer, MouthLayer, HairFront, AccessoryLayer,
} from './AvatarLayers';

const SPRING = { type: 'spring', stiffness: 360, damping: 26 };

// ─── Core SVG compositor — used everywhere in the app ──────────────────────
export function AvatarSVG({ config, size = 100, expression }) {
  const c = config || {};
  const bg = c.bg || '#0D7377';
  const skinColor = c.skinColor || '#FFDBAC';
  const isLong = HAIR_LONG_STYLES.includes(c.hair?.style);
  const expr = expression || c.expression || 'neutral';
  const uid = `av_${size}_${bg.replace('#', '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 124"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={`${uid}_bg`} cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor={bg} stopOpacity="0.3" />
          <stop offset="100%" stopColor={bg} stopOpacity="0.06" />
        </radialGradient>
        <radialGradient id={`${uid}_glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={bg} stopOpacity="0.15" />
          <stop offset="100%" stopColor={bg} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* BG soft glow */}
      <circle cx="50" cy="56" r="54" fill={`url(#${uid}_bg)`} />

      {/* LAYER 0 — Back hair (long styles only) */}
      {isLong && <HairBack style={c.hair?.style} color={c.hair?.color} />}

      {/* LAYER 1 — Body: neck, ears, shoulders */}
      <BodyLayer skinColor={skinColor} />

      {/* LAYER 2 — Outfit: rendered before face so collar is behind jaw */}
      <OutfitLayer outfitConfig={c.outfit} />

      {/* LAYER 3 — Face shape */}
      <FaceLayer skinColor={skinColor} faceShape={c.faceShape} />

      {/* LAYER 4 — Eyes + brows + lashes */}
      <EyeLayer
        eyeConfig={c.eyes}
        eyebrowConfig={c.eyebrows}
        eyelashConfig={c.eyelashes}
      />

      {/* LAYER 5 — Nose */}
      <NoseLayer noseConfig={c.nose} />

      {/* LAYER 6 — Cheeks (expression-reactive) */}
      <CheeksLayer expression={expr} />

      {/* LAYER 7 — Mouth (expression-reactive) */}
      <MouthLayer mouthConfig={c.mouth} expression={expr} />

      {/* LAYER 8 — Front hair / bangs */}
      <HairFront style={c.hair?.style} color={c.hair?.color} />

      {/* LAYER 9 — Accessories */}
      <AccessoryLayer accessory={c.accessory} />
    </svg>
  );
}

// ─── Animated builder preview ──────────────────────────────────────────────
export default function AvatarDisplay({ config, size = 160, expression }) {
  const bg = config?.bg || '#0D7377';
  const animKey = [
    config?.hair?.style, config?.hair?.color,
    config?.outfit?.style, config?.outfit?.color,
    config?.skinColor, config?.faceShape,
    config?.accessory, config?.eyes?.type,
  ].join('|');

  return (
    <div
      className="flex items-center justify-center py-5 relative"
      style={{
        background: `radial-gradient(ellipse at 50% 80%, ${bg}22 0%, transparent 65%)`,
        minHeight: size + 32,
      }}
    >
      {/* Ambient ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size + 24,
          height: size + 24,
          background: `radial-gradient(circle, ${bg}18 0%, transparent 70%)`,
          boxShadow: `0 0 40px ${bg}30`,
        }}
      />

      <motion.div
        key={animKey}
        initial={{ scale: 0.82, opacity: 0, y: 8 }}
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
            background: `radial-gradient(circle at 40% 35%, ${bg}28 0%, ${bg}0a 100%)`,
            boxShadow: `0 12px 40px ${bg}35, 0 0 0 2px ${bg}40`,
          }}
        >
          <AvatarSVG config={config} size={Math.round(size * 0.92)} expression={expression} />
        </div>

        {/* Floating sparkle */}
        <motion.span
          animate={{ y: [-3, 4, -3], rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-2 -right-2 text-lg select-none pointer-events-none"
        >✨</motion.span>
      </motion.div>
    </div>
  );
}