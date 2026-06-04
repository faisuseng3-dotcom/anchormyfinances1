import React from 'react';
import { motion } from 'framer-motion';

export default function WarningBanner({ count, onReview }) {
  if (!count || count === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-5 mt-4 py-3 flex items-center justify-between gap-3 border-b border-[#FECACA]"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
        </span>
        <div>
          <p className="text-[14px] font-medium text-[#DC2626]">
            {count} transaktion{count > 1 ? 'er' : ''} behöver granskning
          </p>
          <p className="text-[12px] text-[#9AA5B4]">Osäker BAS-matchning — granska kontot</p>
        </div>
      </div>
      {onReview && (
        <button
          type="button"
          onClick={onReview}
          className="text-[13px] font-semibold text-[#DC2626] flex-shrink-0"
        >
          Granska
        </button>
      )}
    </motion.div>
  );
}
