import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Wallet } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const fmt = (v) => v ? Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';

function BufferCircle({ pct, months }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(1, pct / 100) * circ;
  const color = pct < 33 ? '#EF4444' : pct < 66 ? '#F59E0B' : '#10B981';

  return (
    <div className="flex flex-col items-center py-4 relative">
      <svg width="180" height="180" className="rotate-[-90deg]">
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
        <motion.circle
          cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="14"
          strokeLinecap="round" strokeDasharray={circ}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span key={Math.round(pct)} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-black" style={{ color }}>
          {Math.round(pct)}%
        </motion.span>
        <span className="text-xs text-slate-400 mt-1">{months.toFixed(1)} månader</span>
      </div>
    </div>
  );
}

export default function BufferModal({ isOpen, onClose, profile, onDeposit }) {
  const [extraSaving, setExtraSaving] = useState(0);

  if (!isOpen || !profile) return null;

  const totalFixed = (profile?.housingCost || 0) +
    (profile?.subscriptions || []).reduce((s, x) => s + x.amount, 0) +
    (profile?.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);

  const currentBuffer = profile.buffer || 0;
  const targetBuffer = totalFixed * 3;
  const projectedBuffer = currentBuffer + extraSaving;

  const currentMonths = totalFixed > 0 ? currentBuffer / totalFixed : 0;
  const projectedMonths = totalFixed > 0 ? projectedBuffer / totalFixed : 0;
  const currentPct = targetBuffer > 0 ? (currentBuffer / targetBuffer) * 100 : 0;
  const projectedPct = targetBuffer > 0 ? (projectedBuffer / targetBuffer) * 100 : 0;

  const maxSlider = Math.max(500, Math.round(totalFixed * 0.5));
  const monthsToGoal = extraSaving > 0 ? Math.ceil((targetBuffer - currentBuffer) / extraSaving) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded-t-3xl overflow-hidden"
          style={{ background: 'rgba(10,14,26,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none', maxHeight: '90vh', overflowY: 'auto' }}
        >
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-4 mb-2" />
          <div className="p-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">Buffer Studio</p>
                  <p className="text-xs text-slate-500">Mål: {fmt(targetBuffer)} kr (3 månaders trygghet)</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Circular gauge */}
            <div className="relative flex items-center justify-center">
              <BufferCircle pct={extraSaving > 0 ? projectedPct : currentPct} months={extraSaving > 0 ? projectedMonths : currentMonths} />
            </div>

            {/* Safety description */}
            <motion.p key={projectedMonths.toFixed(1)}
              className="text-center text-sm text-slate-300 mb-6 -mt-2">
              {extraSaving > 0 ? (
                <>Din trygghet ökar från <span className="text-white font-bold">{currentMonths.toFixed(1)}</span> till <span className="text-blue-400 font-bold">{projectedMonths.toFixed(1)} månader</span></>
              ) : (
                <>Du har trygghet i <span className="text-white font-bold">{currentMonths.toFixed(1)} månader</span></>
              )}
            </motion.p>

            {/* Extra savings slider */}
            <div className="p-4 rounded-2xl space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-white">Extra sparande denna månad</p>
                <motion.span key={extraSaving} initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                  className="text-lg font-black text-blue-400">
                  +{fmt(extraSaving)} kr
                </motion.span>
              </div>
              <Slider
                min={0} max={maxSlider} step={100}
                value={[extraSaving]}
                onValueChange={([v]) => setExtraSaving(v)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-600">
                <span>0 kr</span><span>{fmt(maxSlider)} kr</span>
              </div>
            </div>

            {/* Time to goal */}
            {monthsToGoal && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-2xl p-4 text-center"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <p className="text-xs text-slate-400">Med {fmt(extraSaving)} kr/mån extra når du buffertmålet om</p>
                <p className="text-2xl font-black text-blue-400 mt-1">{monthsToGoal} månader</p>
              </motion.div>
            )}

            {/* Deposit button */}
            {onDeposit && (
              <button onClick={onDeposit}
                className="mt-4 w-full py-3 rounded-xl text-sm font-semibold text-emerald-300 flex items-center justify-center gap-2"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <Wallet className="w-4 h-4" /> Gör en insättning i bufferten
              </button>
            )}

            {/* Breakdown */}
            <div className="mt-4 space-y-2">
              {[
                { label: 'Nuvarande buffert', value: currentBuffer, color: 'text-blue-400' },
                { label: '+ Extra sparande', value: extraSaving, color: 'text-emerald-400' },
                { label: '= Ny buffert', value: projectedBuffer, color: 'text-white', bold: true },
                { label: 'Buffertmål (3 mån)', value: targetBuffer, color: 'text-slate-500' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-sm text-slate-400">{row.label}</span>
                  <span className={`text-sm ${row.color} ${row.bold ? 'font-bold' : 'font-semibold'}`}>{fmt(row.value)} kr</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}