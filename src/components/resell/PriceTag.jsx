import React from 'react';
import { motion } from 'framer-motion';
import { sectionMetaClass } from '@/lib/anchorTheme';

export default function PriceTag({ result }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', delay: 0.15, damping: 24, stiffness: 280 }}
      className="absolute top-3 right-3 z-10 rounded-xl px-3 py-2 bg-black/70 backdrop-blur-sm"
    >
      <p className={sectionMetaClass}>Snittpris</p>
      <p className="text-[20px] font-semibold text-white tabular-nums leading-tight">
        {result.avgPrice}
        <span className="text-[13px] font-medium text-white/45 ml-0.5">kr</span>
      </p>
      <p className={`${sectionMetaClass} mt-0.5`}>
        {result.quickSalePrice}–{result.maxPrice} kr
      </p>
    </motion.div>
  );
}
