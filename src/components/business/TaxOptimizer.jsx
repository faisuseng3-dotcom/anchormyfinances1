import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, CheckCircle2 } from 'lucide-react';

const SUGGESTIONS = [
  {
    id: 1,
    title: 'Privata inköp → Företaget',
    description: 'Du har gjort inköp av kontorsmaterial privat den senaste månaden. Om du bokför dem på företaget istället sparar du 2 450 kr i skatt.',
    saving: 2450,
    action: 'Flytta över inköpen',
    done: false,
  },
  {
    id: 2,
    title: 'Tjänstepension-fönster öppet',
    description: 'Du är nära brytpunkten för statlig skatt. Genom att sätta in 3 000 kr/mån i tjänstepension sänker du din skattskyldighet med upp till 1 080 kr/mån.',
    saving: 1080,
    action: 'Beräkna optimal insättning',
    done: false,
  },
  {
    id: 3,
    title: 'Hemmakontor-avdrag missat',
    description: 'Baserat på din profil arbetar du troligen hemma. Du kan dra av en del av boendekostnaden — estimerat 4 800 kr/år.',
    saving: 4800,
    action: 'Aktivera hemmakontor-avdrag',
    done: false,
  },
];

export default function TaxOptimizer() {
  const [suggestions, setSuggestions] = useState(SUGGESTIONS);
  const [dismissed, setDismissed] = useState(false);
  const [acted, setActed] = useState([]);

  const handleAct = (id) => {
    setActed(prev => [...prev, id]);
    setTimeout(() => setSuggestions(prev => prev.filter(s => s.id !== id)), 1200);
  };
  const handleDismiss = (id) => setSuggestions(prev => prev.filter(s => s.id !== id));

  if (suggestions.length === 0 || dismissed) return null;

  const totalSaving = suggestions.reduce((sum, s) => sum + s.saving, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-card)', border: '1px solid rgba(139,92,246,0.3)' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)', borderBottom: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.4)' }}>
          <Sparkles className="w-4 h-4" style={{ color: '#A78BFA' }} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold" style={{ color: '#A78BFA' }}>TAX OPTIMIZER AI</p>
          <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.6)' }}>
            Potentiell besparing: <span className="font-bold" style={{ color: '#F0EAD6' }}>{totalSaving.toLocaleString('sv-SE')} kr</span>
          </p>
        </div>
        <button onClick={() => setDismissed(true)} style={{ color: 'rgba(155,173,184,0.4)' }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <AnimatePresence>
          {suggestions.map(s => (
            <motion.div
              key={s.id}
              layout
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.15)' }}
            >
              {acted.includes(s.id) ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 py-1">
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#3DAA7A' }} />
                  <p className="text-xs font-bold" style={{ color: '#3DAA7A' }}>Aktiverat! AI uppdaterar bokföringen…</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-bold" style={{ color: '#F0EAD6' }}>{s.title}</p>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(61,170,122,0.15)', color: '#3DAA7A' }}>
                      +{s.saving.toLocaleString('sv-SE')} kr
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(155,173,184,0.7)' }}>{s.description}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleDismiss(s.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(155,173,184,0.5)' }}>
                      Ignorera
                    </button>
                    <button onClick={() => handleAct(s.id)}
                      className="flex-1 h-8 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                      style={{ background: 'rgba(139,92,246,0.2)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.4)' }}>
                      {s.action} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}