import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { formatNumber } from './pulseEngine';

export default function CountdownCard({ nextEvent, currentBalance }) {
  if (!nextEvent) return null;

  const isSafe = currentBalance >= nextEvent.amount;
  const balanceAfter = currentBalance - nextEvent.amount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 border relative overflow-hidden ${
        isSafe
          ? 'bg-emerald-500/8 border-emerald-500/25'
          : 'bg-rose-500/10 border-rose-500/30'
      }`}
      style={{
        boxShadow: isSafe
          ? '0 0 24px rgba(16,185,129,0.15)'
          : '0 0 24px rgba(239,68,68,0.2)',
      }}
    >
      {/* Pulsing bg */}
      <motion.div
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`absolute inset-0 ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Clock className={`w-4 h-4 ${isSafe ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nästa utgift</span>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-white font-bold text-lg leading-none">{nextEvent.icon} {nextEvent.name}</p>
            <p className="text-slate-400 text-sm mt-1">{formatNumber(nextEvent.amount)} kr</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-black ${isSafe ? 'text-emerald-300' : 'text-rose-300'}`}>
              {nextEvent.dayOffset}
            </p>
            <p className="text-xs text-slate-500">dagar kvar</p>
          </div>
        </div>

        {/* Balance status */}
        <div className={`rounded-xl px-3 py-2.5 flex items-center justify-between ${
          isSafe ? 'bg-emerald-500/15' : 'bg-rose-500/15'
        }`}>
          <div>
            <p className="text-xs text-slate-400">Saldo efter betalning</p>
            <p className={`text-base font-bold ${balanceAfter >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {formatNumber(Math.abs(balanceAfter))} kr {balanceAfter < 0 ? '(underskott)' : ''}
            </p>
          </div>
          <span className="text-2xl">
            {isSafe ? '✅' : '🚨'}
          </span>
        </div>

        {/* Verdict text */}
        <p className={`text-sm mt-3 font-medium ${isSafe ? 'text-emerald-300' : 'text-rose-300'}`}>
          {isSafe
            ? `Du är safe! Du har ${formatNumber(currentBalance)} kr och betalar ${formatNumber(nextEvent.amount)} kr om ${nextEvent.dayOffset} dagar.`
            : `Varning! Du behöver ${formatNumber(nextEvent.amount - currentBalance)} kr mer för att täcka ${nextEvent.name}.`}
        </p>
      </div>
    </motion.div>
  );
}