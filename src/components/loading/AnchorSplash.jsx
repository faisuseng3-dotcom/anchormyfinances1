import React from 'react';
import { motion } from 'framer-motion';

const LETTERS = ['L', 'a', 'g', 'o'];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.25,
    },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: 'easeOut' },
  },
};

export default function AnchorSplash() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#040814',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex' }}
      >
        {LETTERS.map((letter, i) => (
          <motion.span
            key={i}
            variants={letterVariants}
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: 800,
              fontSize: 42,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              lineHeight: 1,
              display: 'inline-block',
            }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}
