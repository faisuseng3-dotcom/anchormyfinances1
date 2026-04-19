import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CrystalArtifact() {
  return (
    <Link to={createPageUrl('ProTools')} className="block">
      <motion.div
        whileTap={{ scale: 0.93 }}
        className="relative flex flex-col items-center justify-center rounded-3xl overflow-hidden"
        style={{
          height: 120,
          background: 'rgba(20,14,45,0.55)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(167,139,250,0.2)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(139,92,246,0.15)',
        }}
      >
        {/* Prismatic light reflections */}
        <motion.div
          animate={{ x: [-60, 60, -60], opacity: [0, 0.4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 30%, rgba(167,139,250,0.25) 50%, rgba(96,165,250,0.15) 55%, transparent 70%)',
          }}
        />
        <motion.div
          animate={{ x: [60, -60, 60], opacity: [0, 0.25, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(75deg, transparent 20%, rgba(236,72,153,0.15) 45%, rgba(167,139,250,0.2) 55%, transparent 75%)',
          }}
        />

        {/* Floating crystal */}
        <motion.div
          animate={{ y: [-4, 4, -4], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 36, lineHeight: 1, filter: 'drop-shadow(0 0 16px rgba(167,139,250,0.8))' }}
        >
          💎
        </motion.div>

        <p className="text-[9px] font-black tracking-widest mt-2" style={{ color: 'rgba(180,168,255,0.5)' }}>
          SUPERKRAFTER
        </p>
        <p className="text-xs font-black mt-0.5" style={{ color: 'rgba(224,216,255,0.8)' }}>Pro Verktyg</p>

        {/* Corner light bleeds */}
        <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 0 0, rgba(167,139,250,0.2) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 100% 100%, rgba(96,165,250,0.15) 0%, transparent 70%)' }} />
      </motion.div>
    </Link>
  );
}