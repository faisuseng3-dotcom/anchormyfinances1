import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const personas = [
  {
    id: 'saver',
    emoji: '🏦',
    title: 'Spararen',
    desc: 'Fokus på mål och buffert. Du vill bygga trygghet steg för steg.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.3)',
  },
  {
    id: 'optimizer',
    emoji: '⚡',
    title: 'Optimeraren',
    desc: 'Fokus på What-If och skatt. Du vill pressa varje krona till max.',
    color: 'from-indigo-500 to-purple-600',
    glow: 'rgba(99,102,241,0.3)',
  },
  {
    id: 'planner',
    emoji: '🛡️',
    title: 'Trygghetssökaren',
    desc: 'Fokus på påminnelser och kontroll. Du vill ha ordning och koll.',
    color: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.3)',
  },
];

export default function SignupPersonaStep({ onSelect }) {
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (selected) onSelect(selected);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
    >
      <div className="w-full max-w-md">
        <motion.div className="text-center mb-8">
          <p className="text-slate-500 text-sm mb-2">Steg 2 av 2</p>
          <h2 className="text-2xl font-bold text-white">Vilken är du?</h2>
          <p className="text-slate-400 text-sm mt-2">Vi anpassar din upplevelse efter din personlighet</p>
        </motion.div>

        <div className="space-y-4 mb-8">
          {personas.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              onClick={() => setSelected(p.id)}
              className="w-full text-left p-5 rounded-2xl transition-all"
              style={{
                background: selected === p.id ? `rgba(255,255,255,0.07)` : 'rgba(255,255,255,0.03)',
                border: selected === p.id ? `1.5px solid rgba(255,255,255,0.2)` : '1.5px solid rgba(255,255,255,0.07)',
                boxShadow: selected === p.id ? `0 0 24px ${p.glow}` : 'none',
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                  {p.emoji}
                </div>
                <div>
                  <p className="font-bold text-white">{p.title}</p>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{p.desc}</p>
                </div>
                {selected === p.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"
                  >
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          animate={{ opacity: selected ? 1 : 0.4 }}
          onClick={handleContinue}
          disabled={!selected}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 transition-all disabled:cursor-not-allowed"
        >
          Fortsätt
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}