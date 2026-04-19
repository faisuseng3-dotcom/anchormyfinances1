import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

const MAX_SLIDER = 10000;

export default function ImpactSlider({ events, currentBalance, onWhatIfChange }) {
  const [amount, setAmount] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const criticalEvents = (events || []).filter(e => e.priority === 'critical');
  const firstCritical = criticalEvents[0];
  const newBalance = currentBalance - amount;
  const balanceAfterCritical = firstCritical ? newBalance - (firstCritical.amount || 0) : newBalance;
  const safe = firstCritical ? balanceAfterCritical >= 0 : newBalance >= 0;
  const inDanger = amount > 0 && !safe;

  const handleSlider = useCallback((e) => {
    const val = parseInt(e.target.value, 10);
    setAmount(val);
    setConfirmed(false);
    onWhatIfChange(val);
  }, [onWhatIfChange]);

  const reset = () => {
    setAmount(0);
    setConfirmed(false);
    onWhatIfChange(0);
  };

  const statusColor = amount === 0 ? '#A78BFA' : safe ? '#0FDEBD' : '#FF4466';
  const statusLabel = amount === 0 ? 'KLAR' : safe ? 'FRITT FRAM' : 'STOPP';

  // Fill pct for custom slider track
  const fillPct = (amount / MAX_SLIDER) * 100;

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{
        background: 'rgba(6,8,18,0.9)',
        border: `1px solid ${statusColor}30`,
        boxShadow: inDanger ? `0 0 20px rgba(255,68,102,0.15)` : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}>

      {/* Top prismatic line */}
      <div className="h-px" style={{
        background: `linear-gradient(90deg, transparent, ${statusColor}60, transparent)`,
        transition: 'background 0.3s',
      }} />

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 20h20L12 2z" stroke={statusColor} strokeWidth="1.5"
                style={{ filter: `drop-shadow(0 0 4px ${statusColor})` }} />
              <path d="M12 9v4" stroke={statusColor} strokeWidth="1.8" />
              <circle cx="12" cy="16.5" r="1" fill={statusColor} />
            </svg>
            <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
              TESTA ETT KÖP — IMPACT SLIDER
            </p>
          </div>
          {amount > 0 && (
            <button onClick={reset}>
              <X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
            </button>
          )}
        </div>

        {/* Amount display */}
        <div className="flex items-end justify-between">
          <div>
            <motion.p key={amount}
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-black leading-none"
              style={{ color: statusColor, fontSize: 36, letterSpacing: '-0.03em' }}>
              {fmt(amount)}
            </motion.p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>kr att spendera</p>
          </div>

          {/* Status badge */}
          <motion.div
            animate={inDanger ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="px-3 py-1.5 rounded-full"
            style={{
              background: `${statusColor}15`,
              border: `1px solid ${statusColor}40`,
            }}>
            <span className="text-xs font-black" style={{ color: statusColor }}>{statusLabel}</span>
          </motion.div>
        </div>

        {/* Custom slider */}
        <div className="relative">
          <div className="relative h-3 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${fillPct}%`,
                background: `linear-gradient(90deg, #0FDEBD, ${inDanger ? '#FF4466' : statusColor})`,
                boxShadow: `0 0 10px ${statusColor}60`,
                transition: 'background 0.3s, box-shadow 0.3s',
              }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={MAX_SLIDER}
            step={100}
            value={amount}
            onChange={handleSlider}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            style={{ height: '100%' }}
          />
          {/* Thumb indicator */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 pointer-events-none"
            style={{
              left: `calc(${fillPct}% - 10px)`,
              background: statusColor,
              borderColor: 'rgba(6,8,18,0.9)',
              boxShadow: `0 0 10px ${statusColor}`,
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
          />
        </div>

        {/* Range labels */}
        <div className="flex justify-between text-[8px] font-black" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <span>0 kr</span>
          <span>{fmt(MAX_SLIDER / 2)} kr</span>
          <span>{fmt(MAX_SLIDER)} kr</span>
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2 flex-wrap">
          {[500, 1000, 2500, 5000].map(v => (
            <motion.button key={v} whileTap={{ scale: 0.88 }}
              onClick={() => { setAmount(v); onWhatIfChange(v); setConfirmed(false); }}
              className="px-3 py-1 rounded-full text-[10px] font-bold"
              style={{
                background: amount === v ? `${statusColor}20` : 'rgba(255,255,255,0.04)',
                color: amount === v ? statusColor : 'rgba(255,255,255,0.3)',
                border: `1px solid ${amount === v ? statusColor + '40' : 'rgba(255,255,255,0.07)'}`,
              }}>
              {fmt(v)} kr
            </motion.button>
          ))}
        </div>

        {/* AI Warning */}
        <AnimatePresence>
          {amount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-3 space-y-1.5"
              style={{
                background: safe ? 'rgba(15,222,189,0.07)' : 'rgba(255,68,102,0.08)',
                border: `1px solid ${safe ? 'rgba(15,222,189,0.25)' : 'rgba(255,68,102,0.3)'}`,
              }}>

              {/* Balance chain */}
              <div className="flex items-center gap-2 text-[10px] font-black flex-wrap">
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{fmt(currentBalance)} kr</span>
                <span style={{ color: '#FF4466' }}>− {fmt(amount)} kr</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>=</span>
                <span style={{ color: newBalance >= 0 ? '#0FDEBD' : '#FF4466' }}>{fmt(newBalance)} kr</span>
                {firstCritical && (
                  <>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>→ efter {firstCritical.name}:</span>
                    <span style={{ color: balanceAfterCritical >= 0 ? '#A78BFA' : '#FF4466', fontWeight: 900 }}>
                      {fmt(balanceAfterCritical)} kr
                    </span>
                  </>
                )}
              </div>

              {/* AI verdict line */}
              <p className="text-[11px] font-semibold" style={{ color: safe ? 'rgba(15,222,189,0.9)' : 'rgba(255,68,102,0.9)' }}>
                {safe
                  ? firstCritical
                    ? `Du klarar ${firstCritical.name}. ${fmt(balanceAfterCritical)} kr kvar.`
                    : 'Inga hinder på vägen. Kör!'
                  : firstCritical
                    ? `⚡ Du krockar med ${firstCritical.name} — ${fmt(Math.abs(balanceAfterCritical))} kr saknas.`
                    : '⚡ Saldot går negativt. Vänta med köpet.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}