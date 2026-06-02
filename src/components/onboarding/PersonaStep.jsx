import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import OnboardingStep from './OnboardingStep';
import { Check, Lock } from 'lucide-react';
import { getRecommendedMode } from '@/lib/toolCatalog';
import {
  onboardingChoiceCard,
  onboardingChoiceCheck,
  onboardingPrimaryBtn,
  onboardingBackBtn,
} from './onboardingUi';
import { cn } from '@/lib/utils';

const PERSONAS = [
  {
    id: 'basic',
    badge: 'Budget',
    title: 'Budget',
    subtitle: 'Enkel koll utan krångel',
    features: ['Utgifter & kategorier', 'Månadsbudget', 'Buffert'],
    locked: [],
  },
  {
    id: 'smart',
    badge: 'Smart',
    title: 'Smart',
    subtitle: 'Optimering och AI-råd',
    features: ['Allt i Budget', 'Möjlighetsradar', 'Personlig rådgivare på Hem'],
    locked: [],
  },
  {
    id: 'pro',
    badge: 'Pro',
    title: 'Pro',
    subtitle: 'Alla simulatorer och verktyg',
    features: ['Allt i Smart', 'What-if & köpsimulator', 'Fler verktyg & rapporter'],
    locked: [],
  },
];

export default function PersonaStep({ data, onChange, onNext, onBack }) {
  const selected = data.mode || null;
  const recommended = getRecommendedMode(data.topConcern);

  useEffect(() => {
    if (!data.mode && recommended) {
      onChange({ ...data, mode: recommended });
    }
    // Förval vid första visning av steget
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <OnboardingStep
      step={3}
      totalSteps={4}
      title="Välj din nivå"
      subtitle="Du kan byta när som helst under Inställningar. Smart passar de flesta."
    >
      <div className="space-y-2.5">
        {PERSONAS.map((p, i) => {
          const isSelected = selected === p.id;
          const isRecommended = p.id === recommended;
          return (
            <motion.button
              key={p.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onChange({ ...data, mode: p.id })}
              className={cn(onboardingChoiceCard(isSelected), 'p-4')}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-[#9FB5FF]">
                      {p.badge}
                    </span>
                    {isRecommended && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-200/90 border border-emerald-500/25">
                        Passar dig
                      </span>
                    )}
                  </div>
                  <p className="text-[16px] font-semibold text-white">{p.title}</p>
                  <p className="text-[13px] text-white/50 mt-0.5">{p.subtitle}</p>
                  <ul className="mt-3 space-y-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[12px] text-white/60">
                        <Check className="w-3 h-3 text-[#9FB5FF] flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                    {p.locked.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[12px] text-white/35">
                        <Lock className="w-3 h-3 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={onboardingChoiceCheck(isSelected)}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#0a1628]" />}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onBack} className={onboardingBackBtn}>
          Tillbaka
        </button>
        <button type="button" onClick={onNext} disabled={!selected} className={`${onboardingPrimaryBtn} flex-1`}>
          {selected ? `Starta med ${PERSONAS.find((p) => p.id === selected)?.title}` : 'Välj nivå'}
        </button>
      </div>
    </OnboardingStep>
  );
}
