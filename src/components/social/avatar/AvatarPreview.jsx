// AvatarPreview — animated display with pulsing aura + sparkle
import React from 'react';
import { motion } from 'framer-motion';
import { AvatarSVG } from './PBREngine';

const SPRING = { type: 'spring', stiffness: 340, damping: 26 };

export default function AvatarPreview({ config, size = 170, expression }) {
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
        animate={{ scale: [1, 1.06, 1], opacity: [0.22, 0.42, 0.22] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size + 110, height: size + 110,
          background: `radial-gradient(circle, ${bg}28 0%, transparent 62%)`,
        }}
      />
      {/* Inner aura ring */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.50, 0.80, 0.50] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size + 40, height: size + 40,
          background: `radial-gradient(circle, ${bg}42 0%, transparent 70%)`,
          boxShadow: `0 0 70px ${bg}50, 0 0 110px ${bg}25`,
        }}
      />

      <motion.div
        key={animKey}
        initial={{ scale: 0.80, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
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
          animate={{ y: [-3, 5, -3], rotate: [0, 18, -14, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-2 -right-1 text-lg select-none pointer-events-none"
        >✨</motion.span>
      </motion.div>
    </div>
  );
}