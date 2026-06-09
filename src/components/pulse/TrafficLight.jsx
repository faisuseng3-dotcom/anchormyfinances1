import React from 'react';
import { motion } from 'framer-motion';

export default function TrafficLight({ safeToSpend, hasDanger, nextCritical }) {
  const isRed = safeToSpend <= 0 || hasDanger;
  const isYellow = !isRed && safeToSpend <= 2000;
  const isGreen = !isRed && !isYellow;

  const status = isRed ? 'red' : isYellow ? 'yellow' : 'green';
  const colors = { red: '#FF4466', yellow: '#F6AD55', green: '#0FDEBD' };
  const labels = { red: 'STOPP', yellow: 'VARNING', green: 'KÖR' };
  const messages = {
    red: nextCritical
      ? `Dina pengar behövs till ${nextCritical.name} om ${nextCritical.dayOffset} dagar.`
      : 'Köp ingenting just nu. Bufferten är för låg.',
    yellow: `Var försiktig. Köp bara det mest nödvändiga.`,
    green: `Du har råd. Njut av lite spelrum!`,
  };

  const activeColor = colors[status];

  return (
    <div className="rounded-3xl p-5"
      style={{ background: 'rgba(6,8,18,0.95)', border: `1px solid ${activeColor}30` }}>

      <div className="flex items-center gap-5">
        {/* Traffic light housing */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2 px-3 py-4 rounded-2xl"
          style={{ background: 'rgba(0,0,0,0.5)', boxShadow: 'var(--anchor-shadow-1)', minWidth: 52 }}>
          {['red', 'yellow', 'green'].map(c => {
            const active = status === c;
            const col = colors[c];
            return (
              <motion.div key={c}
                animate={active ? { opacity: [0.85, 1, 0.85], scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="w-8 h-8 rounded-full"
                style={{
                  background: active ? col : `${col}18`,
                  border: `2px solid ${active ? col : col + '30'}`,
                  boxShadow: active ? `0 0 16px ${col}90, 0 0 32px ${col}40` : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <motion.p
            key={status}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-black leading-none mb-1"
            style={{ color: activeColor, fontSize: 34, letterSpacing: '-0.02em' }}
          >
            {labels[status]}
          </motion.p>
          <p className="text-sm font-semibold leading-snug" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {messages[status]}
          </p>
          {safeToSpend > 0 && (
            <p className="text-xs mt-2 font-bold" style={{ color: activeColor }}>
              {Math.round(safeToSpend).toLocaleString('sv-SE')} kr säkert att röra
            </p>
          )}
        </div>
      </div>
    </div>
  );
}