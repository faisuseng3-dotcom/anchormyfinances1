import React from 'react';
import { motion } from 'framer-motion';

export default function VATShield({ vatReserved, vatDeadlines }) {
  const nearest = vatDeadlines?.[0];
  const daysUntil = nearest
    ? Math.round((new Date(nearest.date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <p className="text-[32px] font-semibold text-[#1A2332] tabular-nums leading-none">
        {vatReserved.toLocaleString('sv-SE')}
        <span className="text-lg font-medium text-[#9AA5B4] ml-1">kr</span>
      </p>

      {nearest && (
        <div className="mt-4 flex items-center justify-between py-3 border-t border-[#E8ECF0]">
          <p className="text-[14px] font-medium text-[#1A2332]">{nearest.label}</p>
          <div className="text-right">
            <p className="text-[15px] font-semibold text-[#1A2332] tabular-nums">
              {nearest.amount.toLocaleString('sv-SE')} kr
            </p>
            <p
              className={`text-[12px] font-medium mt-0.5 ${daysUntil <= 7 ? 'text-[#E53E3E]' : 'text-[#0D7377]'}`}
            >
              {daysUntil <= 0 ? 'Förfallen' : `Om ${daysUntil} dagar`}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
