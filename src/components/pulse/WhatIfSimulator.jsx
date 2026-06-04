import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, X } from 'lucide-react';
import { formatNumber, getGuiltFreeAmount } from './pulseEngine';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function WhatIfSimulator({ events, currentBalance, onWhatIfChange }) {
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);

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

  const safe = result ? result.canAffordCritical : null;

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{
        background: 'rgba(6,8,18,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(167,139,250,0.2)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>

      {/* Prismatic top line */}
      <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), rgba(15,222,189,0.4), transparent)' }} />

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <motion.div animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}>
            <GitBranch className="w-4 h-4" style={{ color: '#0FDEBD' }} />
          </motion.div>
          <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(167,139,250,0.7)' }}>
            WHAT-IF PROJEKTION
          </p>
        </div>

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Vad händer på tidslinjen om du köper något nu?
        </p>

        {/* Input row */}
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && simulate()}
            placeholder="Belopp i kr..."
            className="flex-1 rounded-2xl px-3 py-2.5 text-sm font-bold outline-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(167,139,250,0.25)',
              color: '#fff',
            }}
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={simulate}
            disabled={!amount}
            className="px-4 py-2 rounded-2xl text-sm font-black disabled:opacity-30"
            style={{ background: 'rgba(167,139,250,0.2)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.35)' }}
          >
            Simulera
          </motion.button>
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2 flex-wrap">
          {[500, 1000, 2500, 5000].map(v => (
            <motion.button key={v} whileTap={{ scale: 0.9 }}
              onClick={() => setAmount(String(v))}
              className="px-3 py-1 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {fmt(v)} kr
            </motion.button>
          ))}
        </div>

        {/* Result projection */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative rounded-2xl p-4"
              style={{
                background: safe ? 'rgba(15,222,189,0.07)' : 'rgba(255,68,102,0.07)',
                border: `1px solid ${safe ? 'rgba(15,222,189,0.25)' : 'rgba(255,68,102,0.3)'}`,
              }}
            >
              <button onClick={reset} className="absolute top-3 right-3"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Verdict */}
              <p className="text-sm font-black mb-3" style={{ color: safe ? '#0FDEBD' : '#FF4466' }}>
                {safe ? '✅ Du klarar det' : '🚨 Danger Zone'}
              </p>

              <div className="space-y-2 text-xs">
                {[
                  { label: 'Nuvarande saldo',  value: `${fmt(currentBalance)} kr`,        color: 'rgba(255,255,255,0.6)' },
                  { label: `− Köp`,             value: `−\u00A0${fmt(result.spend)} kr`,   color: '#FF4466' },
                  { label: 'Nytt saldo',        value: `${fmt(result.newBalance)} kr`,      color: result.newBalance >= 0 ? '#0FDEBD' : '#FF4466' },
                  ...(result.firstCritical ? [{
                    label: `Efter ${result.firstCritical.name}`,
                    value: `${fmt(result.balanceAfterCritical)} kr`,
                    color: result.balanceAfterCritical >= 0 ? '#A78BFA' : '#FF4466',
                  }] : []),
                ].map(row => (
                  <div key={row.label} className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>{row.label}</span>
                    <span className="font-black" style={{ color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Human verdict */}
              <p className="text-[11px] mt-3 font-semibold"
                style={{ color: safe ? 'rgba(15,222,189,0.8)' : 'rgba(255,68,102,0.9)' }}>
                {safe
                  ? result.firstCritical
                    ? `Du är safe. ${fmt(result.balanceAfterCritical)} kr kvar efter ${result.firstCritical.name}.`
                    : 'Inga kritiska händelser på horisonten. Kör!'
                  : result.firstCritical
                    ? `Du saknar ${fmt(Math.abs(result.balanceAfterCritical))} kr för att klara ${result.firstCritical.name}.`
                    : 'Saldot går negativt. Vänta med köpet.'}
              </p>

              {/* Ghost line indicator */}
              <div className="flex items-center gap-2 mt-3 pt-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-8 h-0.5 rounded" style={{ background: '#F6AD55', opacity: 0.7, border: '1px dashed #F6AD55' }} />
                <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Ghost-linjen på tidslinjen visar den nya verkligheten
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}