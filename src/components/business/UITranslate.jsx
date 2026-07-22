import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, X, ArrowRight } from 'lucide-react';

// Simulated intercepted Fortnox messages
const FORTNOX_ERRORS = [
  {
    id: 1,
    raw: 'Fel: Kostnadskonto 5420 saknar motkonto. Periodisering krävs.',
    humanized: 'Hej! Jag hittade din Adobe-faktura men behöver veta om det är en privat utgift eller för företaget?',
    action: 'Det är för företaget',
    resolved: false,
  },
  {
    id: 2,
    raw: 'Varning: Verifikationsserie A-0042 saknar attestering. Bokslut blockerat.',
    humanized: 'Din revisor behöver godkänna 3 transaktioner innan vi kan stänga månaden. Vill du skicka en påminnelse?',
    action: 'Skicka påminnelse till revisorn',
    resolved: false,
  },
];

export default function UITranslate() {
  const [errors, setErrors] = useState(FORTNOX_ERRORS);
  const resolve = (id) => setErrors(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));
  const dismiss = (id) => setErrors(prev => prev.filter(e => e.id !== id));

  const active = errors.filter(e => !e.resolved);
  if (active.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Languages className="w-3.5 h-3.5" style={{ color: '#4B7CF3' }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4B7CF3' }}>Lago översätter Fortnox</p>
      </div>
      <AnimatePresence>
        {active.map(e => (
          <motion.div
            key={e.id}
            layout
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-4"
            style={{ background: 'rgba(75,124,243,0.08)', boxShadow: 'var(--anchor-shadow-1)' }}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1">
                <p className="text-xs line-through mb-1.5" style={{ color: 'rgba(155,173,184,0.35)' }}>{e.raw}</p>
                <p className="text-sm font-medium leading-relaxed" style={{ color: '#F0EAD6' }}>{e.humanized}</p>
              </div>
              <button onClick={() => dismiss(e.id)} style={{ color: 'rgba(155,173,184,0.35)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => resolve(e.id)}
              className="w-full h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              style={{ background: 'rgba(75,124,243,0.2)', color: '#4B7CF3', boxShadow: 'var(--anchor-shadow-1)' }}>
              {e.action} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}