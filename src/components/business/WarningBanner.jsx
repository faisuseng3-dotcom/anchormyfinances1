import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function WarningBanner({ count, onReview }) {
  if (!count || count === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-5 mt-4 rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
      style={{
        background: 'rgba(220,38,38,0.07)',
        border: '1.5px solid rgba(220,38,38,0.3)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Pulsing red dot */}
        <span className="relative flex h-3 w-3 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
        <div>
          <p className="text-sm font-bold" style={{ color: '#dc2626' }}>
            {count} transaktion{count > 1 ? 'er' : ''} behöver granskning
          </p>
          <p className="text-xs" style={{ color: '#9AA5B4' }}>
            AI är osäker på BAS-konto — kontrollera manuellt
          </p>
        </div>
      </div>
      {onReview && (
        <button
          onClick={onReview}
          className="text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0"
          style={{ background: 'rgba(220,38,38,0.12)', color: '#dc2626' }}
        >
          Granska
        </button>
      )}
    </motion.div>
  );
}