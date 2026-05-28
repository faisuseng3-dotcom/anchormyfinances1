import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sectionMetaClass } from '@/lib/anchorTheme';

const STEPS = [
  { delay: 0, text: 'Läser bilden…' },
  { delay: 1200, text: 'Jämför med liknande annonser…' },
  { delay: 2400, text: 'Beräknar prisintervall…' },
  { delay: 3600, text: 'Nästan klart…' },
];

export default function ScanOverlay({ imageData }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timeInterval = setInterval(() => setElapsed((e) => e + 100), 100);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const nextIdx = STEPS.filter((t) => t.delay <= elapsed).length - 1;
    if (nextIdx >= 0 && nextIdx !== stepIndex) setStepIndex(nextIdx);
  }, [elapsed, stepIndex]);

  const current = STEPS[Math.min(stepIndex, STEPS.length - 1)];

  return (
    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white/[0.04]">
      {imageData && (
        <img
          src={imageData}
          alt="Analyseras"
          className="w-full h-full object-cover opacity-60"
        />
      )}
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[15px] font-medium text-white text-center"
          >
            {current.text}
          </motion.p>
        </AnimatePresence>
        <p className={`${sectionMetaClass} text-center mt-2`}>
          {(elapsed / 1000).toFixed(0)} s
        </p>
      </div>
    </div>
  );
}
