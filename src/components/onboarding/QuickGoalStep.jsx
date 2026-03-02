import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Shield, PiggyBank, TrendingUp, Target, Check } from 'lucide-react';
import OnboardingStep from './OnboardingStep';
import { motion, AnimatePresence } from 'framer-motion';

const goals = [
  {
    id: 'control',
    title: 'Få kontroll',
    description: 'Jag vill ha bättre koll på mina pengar och vart de tar vägen.',
    icon: Shield,
    color: 'from-blue-500 to-cyan-600',
    borderColor: 'border-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'save',
    title: 'Börja spara',
    description: 'Jag vill bygga upp sparande och nå mina sparmål snabbare.',
    icon: PiggyBank,
    color: 'from-emerald-500 to-green-600',
    borderColor: 'border-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 'improve',
    title: 'Förbättra min ekonomi',
    description: 'Jag vill optimera mina kostnader och få bättre marginal.',
    icon: TrendingUp,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    id: 'plan',
    title: 'Planera min framtid',
    description: 'Jag vill se långsiktigt och fatta smarta ekonomiska beslut.',
    icon: Target,
    color: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-500',
    bg: 'bg-purple-500/10',
  }
];

export default function QuickGoalStep({ data, onChange, onNext, onBack }) {
  const selectedGoals = data.userGoals || (data.userGoal ? [data.userGoal] : []);
  const [showPriority, setShowPriority] = useState(false);

  const toggleGoal = (goalId) => {
    const next = selectedGoals.includes(goalId)
      ? selectedGoals.filter(g => g !== goalId)
      : [...selectedGoals, goalId];
    onChange({ ...data, userGoals: next, userGoal: next[0] || '', primaryGoal: next.length === 1 ? next[0] : (data.primaryGoal && next.includes(data.primaryGoal) ? data.primaryGoal : '') });
  };

  const handleContinue = () => {
    if (selectedGoals.length > 1 && !data.primaryGoal) {
      setShowPriority(true);
    } else {
      onNext();
    }
  };

  const selectPrimary = (goalId) => {
    onChange({ ...data, primaryGoal: goalId });
  };

  const selectedGoalObjects = goals.filter(g => selectedGoals.includes(g.id));

  return (
    <OnboardingStep
      step={0}
      totalSteps={2}
      title={showPriority ? "Vad är din högsta prioritet?" : "Vad vill du uppnå?"}
      subtitle={showPriority
        ? "Du valde flera mål. Vilket är viktigast just nu? AI:n fokuserar extra på detta."
        : "Du kan välja flera mål. Vi anpassar upplevelsen efter dina val."}
    >
      <AnimatePresence mode="wait">
        {!showPriority ? (
          <motion.div key="multi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {goals.map((goal) => {
              const Icon = goal.icon;
              const isSelected = selectedGoals.includes(goal.id);

              return (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`w-full p-5 rounded-xl text-left transition-all border-2 relative overflow-hidden ${
                    isSelected ? `${goal.borderColor} ${goal.bg}` : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-white text-lg">{goal.title}</h3>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected ? `${goal.borderColor} bg-gradient-to-br ${goal.color}` : 'border-white/20'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{goal.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}

            {selectedGoals.length > 0 && (
              <p className="text-center text-xs text-slate-500">
                {selectedGoals.length} mål valda
              </p>
            )}

            <Button
              onClick={handleContinue}
              disabled={selectedGoals.length === 0}
              className="w-full h-14 mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              Fortsätt
            </Button>
          </motion.div>
        ) : (
          <motion.div key="priority" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {selectedGoalObjects.map((goal) => {
              const Icon = goal.icon;
              const isPrimary = data.primaryGoal === goal.id;

              return (
                <button
                  key={goal.id}
                  onClick={() => selectPrimary(goal.id)}
                  className={`w-full p-5 rounded-xl text-left transition-all border-2 relative overflow-hidden ${
                    isPrimary ? `${goal.borderColor} ${goal.bg}` : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{goal.title}</h3>
                      {isPrimary && <p className="text-xs text-indigo-300 mt-0.5">★ Huvudfokus – AI:n prioriterar detta</p>}
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isPrimary ? `${goal.borderColor} bg-gradient-to-br ${goal.color}` : 'border-white/20'
                    }`}>
                      {isPrimary && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowPriority(false)} className="flex-1 h-14 rounded-xl">
                Tillbaka
              </Button>
              <Button
                onClick={onNext}
                disabled={!data.primaryGoal}
                className="flex-1 h-14 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                Fortsätt
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OnboardingStep>
  );
}