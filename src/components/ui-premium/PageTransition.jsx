// @ts-nocheck
import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { pageEnter } from '@/lib/motionPresets';

/** Mjuk vyövergång — tonar in, ingen hård pop. */
export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="anchor-page-transition min-h-0 flex-1 flex flex-col"
        {...pageEnter}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
