// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCircle, DollarSign, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SCRIPT = `Hej! Jag har varit kund hos er länge men har nyligen sett att konkurrenten Hallon erbjuder samma tjänst för 199 kr/mån – vilket är 300 kr billigare. Jag är nöjd med er service men kan inte ignorera en besparing på 1 200 kr/år. Kan ni matcha detta erbjudande, eller ska jag avsluta mitt abonnemang?`;

export default function NegotiationHubModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            border: '1px solid rgba(34,197,94,0.3)',
            boxShadow: '0 0 60px rgba(34,197,94,0.2), 0 20px 60px rgba(0,0,0,0.6)'
          }}
        >
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-green-600" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Besparingsmöjlighet</h2>
              </div>
              <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-5">Mobilabonnemang · Identifierad av AI</p>

            {/* Comparison table */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-rose-400">T2</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Nuvarande</p>
                  <p className="text-sm font-semibold text-white">Tele2</p>
                </div>
                <span className="text-rose-400 font-bold text-sm">499 kr/mån</span>
              </div>

              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-300 font-semibold">Spara 1 200 kr/år</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-emerald-400">H</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Förslag</p>
                  <p className="text-sm font-semibold text-white">Hallon</p>
                </div>
                <span className="text-emerald-400 font-bold text-sm">199 kr/mån</span>
              </div>
            </div>

            {/* AI Script */}
            <div className="mb-5">
              <p className="text-xs text-slate-500 mb-2 tracking-wide">Förhandlingsmanus</p>
              <div
                className="p-3 rounded-xl text-xs text-slate-300 leading-relaxed"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {SCRIPT}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleCopy} className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm">
                {copied ? <CheckCircle className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                {copied ? 'Kopierat!' : 'Kopiera manus'}
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1 rounded-xl border-white/10 hover:bg-white/5 text-slate-300 text-sm">
                Stäng
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}