// AvatarDisplay — Composites all layers in correct Z-order with animations

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HAIR_LONG_STYLES } from './AvatarConfig';
import {
  HairBack, BodyLayer, FaceLayer, EyeLayer, NoseLayer,
  MouthLayer, HairFront, OutfitLayer, AccessoryLayer, CheeksLayer,
} from './AvatarLayers';

const SPRING = { type: 'spring', stiffness: 340, damping: 24 };

export function AvatarSVG({ config, size = 100, expression }) {
  const c = config || {};
  const bg = c.bg || '#0D7377';
  const skinColor = c.skinColor || '#FFDBAC';
  const isLong = HAIR_LONG_STYLES.includes(c.hair?.style);
  const expr = expression || c.expression || 'neutral';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={`avatarBg_${size}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={bg} stopOpacity="0.35" />
          <stop offset="100%" stopColor={bg} stopOpacity="0.08" />
        </radialGradient>
      </defs>

      {/* Background circle */}
      <circle cx="50" cy="55" r="52" fill={`url(#avatarBg_${size})`} />

      {/* Z=0: Hair back (long styles behind face) */}
      {isLong && <HairBack style={c.hair?.style} color={c.hair?.color} />}

      {/* Z=1: Body parts (neck, ears) */}
      <BodyLayer skinColor={skinColor} />

      {/* Z=2: Face shape */}
      <FaceLayer skinColor={skinColor} faceShape={c.faceShape} />

      {/* Z=3: Eyes, brows, lashes */}
      <EyeLayer
        eyeConfig={c.eyes}
        eyebrowConfig={c.eyebrows}
        eyelashConfig={c.eyelashes}
      />

      {/* Z=3.5: Nose */}
      <NoseLayer noseConfig={c.nose} />

      {/* Z=3.6: Cheeks (expression-driven) */}
      <CheeksLayer expression={expr} />

      {/* Z=3.7: Mouth (expression-driven) */}
      <MouthLayer mouthConfig={c.mouth} expression={expr} />

      {/* Z=4: Outfit */}
      <OutfitLayer outfitConfig={c.outfit} />

      {/* Z=5: Hair front */}
      <HairFront style={c.hair?.style} color={c.hair?.color} />

      {/* Z=6: Accessory */}
      <AccessoryLayer accessory={c.accessory} />
    </svg>
  );
}

// Animated preview used in the builder — springs into place when config changes
export default function AvatarDisplay({ config, size = 160, expression }) {
  const bg = config?.bg || '#0D7377';
  return (
    <div className="flex flex-col items-center justify-center py-4"
      style={{ background: `radial-gradient(ellipse at 50% 100%, ${bg}18 0%, transparent 70%)` }}>
      <motion.div
        layout
        key={config?.hair?.style + config?.outfit?.style + config?.skinColor}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={SPRING}
        className="relative"
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: size, height: size,
            background: `radial-gradient(circle, ${bg}28 0%, ${bg}0a 100%)`,
            boxShadow: `0 8px 32px ${bg}28, 0 0 0 2px ${bg}38`,
          }}
        >
          <AvatarSVG config={config} size={size * 0.95} expression={expression} />
        </div>
        <motion.div
          animate={{ y: [-4, 4, -4], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-1 -right-1 text-xl select-none"
        >✨</motion.div>
      </motion.div>
    </div>
  );
}