import React from 'react';
import { motion } from 'framer-motion';
import { AvatarSVG } from './BitmojiEngine';

export default function AvatarPreview({ config, size = 200, expression }) {
  const bg = config?.bg || '#5AC8FA';
  const animKey = [
    config?.hair?.style,
    config?.hair?.color,
    config?.outfit?.style,
    config?.skinColor,
    config?.accessory,
  ].join('|');

  return (
    <div className="flex items-center justify-center" style={{ minHeight: size + 32 }}>
      <motion.div
        key={animKey}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="rounded-[28px] p-3 shadow-lg"
        style={{
          background: `linear-gradient(145deg, ${bg} 0%, ${bg}dd 100%)`,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,0.35)',
        }}
      >
        <div
          className="rounded-[22px] overflow-hidden bg-white/20"
          style={{ width: size, height: Math.round(size * 1.15) }}
        >
          <AvatarSVG config={config} size={size} expression={expression} />
        </div>
      </motion.div>
    </div>
  );
}
