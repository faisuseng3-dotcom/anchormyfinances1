import React from 'react';
import { motion } from 'framer-motion';

export default function AnchorSplash() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#040814',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        gap: 18,
      }}
    >
      {/* Ikon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <svg width="56" height="56" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#0a1628"/>
          <path d="M8 22V10h4.2c2.8 0 4.6 1.5 4.6 3.9 0 1.6-.8 2.8-2.1 3.4l3.1 4.7h-2.9l-2.7-4.2H10.2V22H8zm2.2-6h1.9c1.4 0 2.2-.7 2.2-1.8S13.5 12 12 12h-1.8v4z" fill="#fff"/>
          <circle cx="22" cy="16" r="5" stroke="#6B9FFF" strokeWidth="2"/>
        </svg>
      </motion.div>

      {/* Wordmark */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.5, ease: 'easeOut' }}
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontWeight: 800,
          fontSize: 32,
          letterSpacing: '-0.03em',
          color: '#ffffff',
          lineHeight: 1,
        }}
      >
        Anchor
      </motion.p>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        style={{
          width: 200,
          height: 2,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
          marginTop: 8,
        }}
      >
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.8, delay: 0.4, ease: 'easeInOut' }}
          style={{
            height: '100%',
            borderRadius: 99,
            background: 'linear-gradient(90deg, #6B9FFF, #4FFFB0)',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
