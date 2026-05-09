import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import OnboardingStep from './OnboardingStep';
import { Check, Lock } from 'lucide-react';

const PERSONAS = [
  {
    id: 'basic',
    badge: 'BUDGET',
    title: 'Budget',
    subtitle: 'Sluta oroa dig. Ha koll.',
    description: 'Perfekt om du vill ha ett enkelt verktyg som håller koll på dina pengar utan krångel.',
    features: [
      'Utgiftskategorisering',
      'Enkel månadsbudget',
      'Bassparande & buffer',
    ],
    locked: [],
    gradient: 'from-slate-500 to-slate-600',
    border: 'rgba(100,116,139,0.5)',
    glow: 'rgba(100,116,139,0.2)',
    color: '#94A3B8',
    bg: 'rgba(100,116,139,0.08)',
  },
  {
    id: 'smart',
    badge: 'SMART',
    title: 'Smart',
    subtitle: 'Optimera. Hitta gratispengar.',
    description: 'För dig som vill förbättra din ekonomi och låta AI:n hitta möjligheter du inte sett.',
    features: [
      'Allt i Budget',
      'Möjlighets-Radarn',
      'Dolda Prislappen',
      'Skatte-Siaren (enkel)',
    ],
    locked: ['CFO-botarna', 'What-If-Simulatorn'],
    gradient: 'from-indigo-500 to-blue-600',
    border: 'rgba(99,102,241,0.5)',
    glow: 'rgba(99,102,241,0.25)',
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.08)',
  },
  {
    id: 'pro',
    badge: 'PRO',
    title: 'Pro',
    subtitle: 'Total kontroll. CFO-nivå.',
    description: 'En hel ledningsgrupp av AI-experter i fickan. För den som vill ha alla verktyg.',
    features: [
      'Allt i Smart',
      'CFO Impact Reports',
      'What-If-Simulatorn',
      'De 4 AI-specialisterna',
    ],
    locked: [],
    gradient: 'from-violet-500 to-purple-700',
    border: 'rgba(139,92,246,0.6)',
    glow: 'rgba(139,92,246,0.3)',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.1)',
  },
];

export default function PersonaStep({ data, onChange, onNext, onBack }) {
  const selected = data.mode || null;

  const select = (id) => onChange({ ...data, mode: id });

  return (
    <OnboardingStep
      step={2}
      totalSteps={3}
      title="Välj din ekonomiska nivå"
      subtitle="Du kan byta läge när som helst i inställningarna."
    >
      <div className="space-y-3">
        {PERSONAS.map((p, i) => {
          const isSelected = selected === p.id;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => select(p.id)}
              className="w-full rounded-2xl p-5 text-left transition-all relative overflow-hidden"
              style={{
                background: isSelected ? p.bg : 'linear-gradient(180deg, rgba(17,24,39,0.74), rgba(15,23,42,0.58))',
                border: `1px solid ${isSelected ? p.border : 'rgba(255,255,255,0.16)'}`,
                boxShadow: isSelected ? `0 0 24px ${p.glow}` : '0 8px 24px rgba(2,6,23,0.2)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl flex-shrink-0 mt-0.5" style={{ background: p.bg, border: `1px solid ${p.border}` }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{ background: `${p.color}22`, color: p.color }}>
                      {p.badge}
                    </span>
                    <h3 className="font-bold text-white text-base">{p.title}</h3>
                    <span className="text-xs text-[#B7C2D9] italic">– {p.subtitle}</span>
                  </div>
                  <p className="text-xs text-[#B7C2D9] mb-3 leading-relaxed">{p.description}</p>

                  <div className="space-y-1">
                    {p.features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2 text-xs text-[#D5E1FF]">
                        <Check className="w-3 h-3 flex-shrink-0" style={{ color: p.color }} />
                        {f}
                      </div>
                    ))}
                    {p.locked.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2 text-xs text-[#7F8FB0]">
                        <Lock className="w-3 h-3 flex-shrink-0" />
                        {f} (låst)
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selection indicator */}
                <div className="flex-shrink-0 mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{ borderColor: isSelected ? p.color : 'rgba(255,255,255,0.2)', background: isSelected ? p.color : 'transparent' }}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
            </motion.button>
          );
        })}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onBack} className="flex-1 h-13 rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10">
            Tillbaka
          </Button>
          <Button
            onClick={onNext}
            disabled={!selected}
            className="flex-1 h-13 rounded-2xl font-bold text-white"
            style={{ background: selected ? 'linear-gradient(135deg, #7FA0FF 0%, #5B7CFA 100%)' : 'rgba(255,255,255,0.12)' }}
          >
            Starta med {selected ? PERSONAS.find(p => p.id === selected)?.title : '…'}
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
}