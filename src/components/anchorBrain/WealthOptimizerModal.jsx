// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const formatNumber = (v) => v ? v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';

export default function WealthOptimizerModal({ isOpen, onConfirm, onClose }) {
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#10B981', '#6366F1', '#F59E0B'] });
    setConfirmed(true);
    setTimeout(() => { setConfirmed(false); onConfirm(); }, 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(10,14,26,0.98)',
            boxShadow: 'var(--anchor-shadow-1)',
            boxShadow: '0 0 60px rgba(79, 174, 130, 0.25), 0 20px 60px rgba(0,0,0,0.6)'
          }}
        >
          <div className="h-1 bg-[#4fae82]" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#4fae82]" />
                <h2 className="text-base font-bold text-white">Optimera ditt kapital</h2>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-white/40 mb-6">Ränte-optimering · signalidentifierad</p>

            {/* Transfer animation */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                <p className="text-xs text-white/40 mb-1">Lönekonto</p>
                <p className="text-sm font-bold text-white">30 000 kr</p>
                <p className="text-xs text-rose-400 mt-1">0% ränta</p>
              </div>

              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6 text-[#4fae82]" />
              </motion.div>

              <div className="flex-1 p-3 rounded-xl bg-[#4fae82]/10 border border-[#4fae82]/20 text-center">
                <p className="text-xs text-white/40 mb-1">Fasträntekonto</p>
                <p className="text-sm font-bold text-white">30 000 kr</p>
                <p className="text-xs text-emerald-400 mt-1">4.1% ränta</p>
              </div>
            </div>

            {/* Profit calc */}
            <div className="p-4 rounded-xl bg-[#4fae82]/10 border border-[#4fae82]/20 mb-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/45">Ränteintäkt / mån</span>
                <span className="font-bold text-emerald-400">+110 kr</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/45">Ränteintäkt / år</span>
                <span className="font-bold text-emerald-400">+1 230 kr</span>
              </div>
              <div className="h-px bg-white/5 my-1" />
              <p className="text-xs text-white/40">Helt riskfritt. Inga bindningstider.</p>
            </div>

            {confirmed ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#4fae82]/20 border border-[#4fae82]/30"
              >
                <CheckCircle2 className="w-5 h-5 text-[#4fae82]" />
                <p className="text-sm font-bold text-[#4fae82]">Kapital optimerat! +110 kr/mån</p>
              </motion.div>
            ) : (
              <div className="flex gap-3">
                <Button onClick={handleConfirm} className="flex-1 rounded-xl bg-[#4fae82] hover:opacity-90 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30">
                  <ArrowRight className="w-4 h-4 mr-1.5" />
                  Bekräfta överföring
                </Button>
                <Button onClick={onClose} variant="outline" className="rounded-2xl-white/10 hover:bg-white/5 text-white/70 text-sm px-4">
                  Avbryt
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}