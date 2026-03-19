import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { formatNumber, getGuiltFreeAmount } from './pulseEngine';

export default function WhatIfSimulator({ events, currentBalance, onWhatIfChange }) {
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [open, setOpen] = useState(false);

  const simulate = () => {
    const spend = parseFloat(amount);
    if (!spend || spend <= 0) return;

    const newBalance = currentBalance - spend;
    const criticalEvents = events.filter(e => e.priority === 'critical');
    const firstCritical = criticalEvents[0];

    const canAffordCritical = firstCritical ? newBalance >= firstCritical.amount : true;
    const balanceAfterCritical = firstCritical ? newBalance - firstCritical.amount : newBalance;

    setResult({ spend, newBalance, canAffordCritical, balanceAfterCritical, firstCritical });
    onWhatIfChange(spend);
  };

  const reset = () => {
    setResult(null);
    setAmount('');
    onWhatIfChange(0);
  };

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(31,41,55,0.6)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">What-If Simulator</span>
          <span className="text-xs text-slate-500">Testa ett köp</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/8">
              <p className="text-xs text-slate-400 pt-3">Vad händer om du köper något nu?</p>

              <div className="flex gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Belopp i kr..."
                  className="flex-1 bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                />
                <button
                  onClick={simulate}
                  disabled={!amount}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold disabled:opacity-40 hover:from-amber-400 hover:to-orange-500 transition-all"
                >
                  Simulera
                </button>
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap">
                {[500, 1200, 2500, 5000].map(v => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className="px-2.5 py-1 rounded-lg bg-white/8 hover:bg-white/12 text-xs text-slate-300 border border-white/10 transition-colors"
                  >
                    {formatNumber(v)} kr
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`rounded-xl p-4 border relative ${
                      result.canAffordCritical
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-rose-500/10 border-rose-500/30'
                    }`}
                  >
                    <button onClick={reset} className="absolute top-2 right-2 text-slate-500 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-sm font-bold text-white mb-2">
                      {result.canAffordCritical ? '✅ Du klarar det!' : '🚨 Danger Zone!'}
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nuvarande saldo</span>
                        <span className="text-white font-medium">{formatNumber(currentBalance)} kr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">- Köp</span>
                        <span className="text-rose-300 font-medium">-{formatNumber(result.spend)} kr</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1">
                        <span className="text-slate-400">Nytt saldo</span>
                        <span className={`font-bold ${result.newBalance >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {formatNumber(result.newBalance)} kr
                        </span>
                      </div>
                      {result.firstCritical && (
                        <div className="flex justify-between mt-1">
                          <span className="text-slate-400">Efter {result.firstCritical.name}</span>
                          <span className={`font-bold ${result.balanceAfterCritical >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {formatNumber(result.balanceAfterCritical)} kr
                          </span>
                        </div>
                      )}
                    </div>
                    <p className={`text-xs mt-3 font-medium ${result.canAffordCritical ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {result.canAffordCritical
                        ? `Hyran/lånet klaras fortfarande med ${formatNumber(result.balanceAfterCritical)} kr kvar.`
                        : `Du saknar ${formatNumber(Math.abs(result.balanceAfterCritical))} kr för att klara ${result.firstCritical?.name}.`}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}