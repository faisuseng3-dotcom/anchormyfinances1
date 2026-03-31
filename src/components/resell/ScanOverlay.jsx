import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AI_THOUGHTS = [
  { delay: 0,    text: 'Skannar efter guldgruvan...' },
  { delay: 1400, text: 'AI:n letar efter liknande prylar på marknaden...' },
  { delay: 2800, text: 'Beräknar ditt bästa resell-pris just nu...' },
  { delay: 4200, text: 'Kollar priser på Tradera, Blocket & Vinted...' },
  { delay: 5600, text: 'Analyserar skick och marknadstrend...' },
];

export default function ScanOverlay({ imageData }) {
  const [scanY, setScanY] = useState(0);
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Scan line animation
    const scanInterval = setInterval(() => {
      setScanY(y => (y >= 100 ? 0 : y + 0.8));
    }, 16);

    // Elapsed time counter
    const timeInterval = setInterval(() => {
      setElapsed(e => e + 100);
    }, 100);

    return () => {
      clearInterval(scanInterval);
      clearInterval(timeInterval);
    };
  }, []);

  // Update thought index based on elapsed
  useEffect(() => {
    const nextIdx = AI_THOUGHTS.filter(t => t.delay <= elapsed).length - 1;
    if (nextIdx !== thoughtIndex && nextIdx >= 0) {
      setThoughtIndex(nextIdx);
    }
  }, [elapsed]);

  const currentThought = AI_THOUGHTS[Math.min(thoughtIndex, AI_THOUGHTS.length - 1)];

  return (
    <div className="relative w-full aspect-square rounded-3xl overflow-hidden">
      {/* Dimmed image */}
      {imageData && (
        <img
          src={imageData}
          alt="scanning"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.5) contrast(1.1)' }}
        />
      )}

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(0,200,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Scanning light beam */}
      <motion.div
        className="absolute left-0 right-0 pointer-events-none z-20"
        style={{ top: `${scanY}%` }}
      >
        {/* Core line */}
        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-90" />
        {/* Soft glow above */}
        <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-cyan-400/30" />
        {/* Soft glow below */}
        <div className="absolute top-0.5 left-0 right-0 h-8 bg-gradient-to-b from-cyan-400/30 to-transparent" />
      </motion.div>

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />

      {/* Center target */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative w-20 h-20"
        >
          <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/60" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/60" />
          <div className="absolute inset-3 border border-cyan-400/50 rounded-full" />
        </motion.div>
      </div>

      {/* AI Thought bubble */}
      <div className="absolute bottom-6 left-4 right-4 flex flex-col items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={thoughtIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-cyan-400/30"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.7, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0"
            />
            <span className="text-xs font-mono text-cyan-300 tracking-wide">{currentThought.text}</span>
          </motion.div>
        </AnimatePresence>

        {/* Timer */}
        <p className="text-[10px] text-cyan-400/50 font-mono tracking-widest">
          AI VISION · {(elapsed / 1000).toFixed(1)}s
        </p>
      </div>
    </div>
  );
}