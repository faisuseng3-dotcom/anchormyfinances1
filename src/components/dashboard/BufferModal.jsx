import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const fmt = (v) => v ? Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';

function SurvivalClock({ days }) {
  const maxDays = 90;
  const pct = Math.min(100, (days / maxDays) * 100);
  const color = days < 14 ? '#EF4444' : days < 30 ? '#F59E0B' : '#10B981';
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center py-4">
      <svg width="180" height="180" className="rotate-[-90deg]">
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        <motion.circle
          cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ marginTop: -110 }}>
        <motion.span
          key={days}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-black"
          style={{ color }}
        >
          {days}
        </motion.span>
        <span className="text-sm text-slate-400 mt-1">dagar</span>
      </div>
    </div>
  );
}

export default function BufferModal({ isOpen, onClose, profile }) {
  const totalFixed = (profile?.housingCost || 0) +
    (profile?.subscriptions || []).reduce((s, x) => s + x.amount, 0) +
    (profile?.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);
  const dailyCost = totalFixed / 30;

  const [costReduction, setCostReduction] = useState(0);

  if (!isOpen || !profile) return null;

  const adjustedDaily = Math.max(1, dailyCost - costReduction / 30);
  const survivalDays = Math.round((profile.buffer || 0) / adjustedDaily);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded-t-3xl overflow-hidden"
          style={{
            background: 'rgba(10,14,26,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderBottom: 'none',
            maxHeight: '85vh',
            overflowY: 'auto',
          }}
        >
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-4 mb-2" />
          <div className="p-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">Survival Clock</p>
                  <p className="text-xs text-slate-500">Buffert {fmt(profile.buffer)} kr · {fmt(dailyCost)} kr/dag</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clock */}
            <div className="relative flex items-center justify-center my-2">
              <SurvivalClock days={survivalDays} />
            </div>

            <p className="text-center text-sm text-slate-400 mb-6">
              Du klarar dig i <span className="text-white font-bold">{survivalDays} dagar</span> om inkomsten försvinner idag.
            </p>

            {/* Simulator */}
            <div className="p-4 rounded-2xl space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Simulera sänkta kostnader</p>
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-2">
                  <span>Sänk månadsutgifter</span>
                  <span className="text-emerald-400 font-bold">−{fmt(costReduction)} kr/mån</span>
                </div>
                <Slider
                  min={0}
                  max={totalFixed * 0.5}
                  step={100}
                  value={[costReduction]}
                  onValueChange={([v]) => setCostReduction(v)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>0 kr</span>
                  <span>{fmt(totalFixed * 0.5)} kr</span>
                </div>
              </div>
            </div>

            <Button className="w-full mt-5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold py-6 shadow-lg shadow-blue-500/20">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Fyll på buffert
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}