// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { recordEconomicControlVisit } from '@/lib/economicControl';

export default function EconomicControlCard() {
  const [weeks, setWeeks] = useState(0);

  useEffect(() => {
    setWeeks(recordEconomicControlVisit());
  }, []);

  if (weeks < 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(107,159,255,0.12)' }}>
        <Shield size={16} className="text-[#6B9FFF]" />
      </div>
      <div>
        <h2 className="anchor-card-title mb-1">Ekonomisk kontroll</h2>
        <p className="text-[14px] text-white/75 mt-0.5">
          Du har haft koll på din ekonomi{' '}
          <span className="text-white font-semibold">{weeks} veck{weeks === 1 ? 'a' : 'or'}</span>
          {' '}i rad.
        </p>
      </div>
    </motion.div>
  );
}
