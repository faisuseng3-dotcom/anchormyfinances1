import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { anchorZoneClass, sectionSubtitleClass } from '@/lib/anchorTheme';

export default function MLIBanner({ mli, greeting }) {
  if (!greeting) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={mli > 70 ? 'supportive' : 'detailed'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`${anchorZoneClass} ${sectionSubtitleClass} -mt-1 pb-1`}
      >
        {greeting}
      </motion.p>
    </AnimatePresence>
  );
}
