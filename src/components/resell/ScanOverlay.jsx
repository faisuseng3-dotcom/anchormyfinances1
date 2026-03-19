import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ScanOverlay({ imageData }) {
  const [scanY, setScanY] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanY(y => (y + 1) % 100);
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-square rounded-3xl overflow-hidden">
      {/* Image */}
      {imageData && (
        <img src={imageData} alt="scanning" className="w-full h-full object-cover" style={{ filter: 'brightness(0.7)' }} />
      )}

      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 z-20 pointer-events-none"
        style={{ top: `${scanY}%` }}
      >
        <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
        <div className="absolute inset-x-0 -top-4 h-8 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent" />
      </motion.div>

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(0,200,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Center crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/60" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/60" />
          <div className="absolute inset-2 border border-cyan-400/40 rounded-full" />
        </div>
      </div>

      {/* Status */}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-cyan-400/30">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-cyan-400"
          />
          <span className="text-xs font-mono text-cyan-300 tracking-widest">SCANNING...</span>
        </div>
        <p className="text-[10px] text-cyan-400/60 font-mono tracking-widest">AI VISION ACTIVE</p>
      </div>
    </div>
  );
}