import React from 'react';
import { Button } from "@/components/ui/button";
import { Shield, PiggyBank, TrendingUp, Target, Check } from 'lucide-react';
import OnboardingStep from './OnboardingStep';

const goals = [
  {
    id: 'control',
    title: 'Få kontroll',
    description: 'Jag vill ha bättre koll på mina pengar och vart de tar vägen.',
    icon: Shield,
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'save',
    title: 'Börja spara',
    description: 'Jag vill bygga upp sparande och nå mina sparmål snabbare.',
    icon: PiggyBank,
    color: 'from-emerald-500 to-green-600'
  },
  {
    id: 'improve',
    title: 'Förbättra min ekonomi',
    description: 'Jag vill optimera mina kostnader och få bättre marginal.',
    icon: TrendingUp,
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'plan',
    title: 'Planera min framtid',
    description: 'Jag vill se långsiktigt och fatta smarta ekonomiska beslut.',
    icon: Target,
    color: 'from-purple-500 to-pink-600'
  }
];

export default function QuickGoalStep({ data, onChange, onNext, onBack }) {
  const selectGoal = (goalId) => {
    onChange({ ...data, userGoal: goalId });
  };

  return (
    <OnboardingStep
      step={0}
      totalSteps={2}
      title="Vad vill du uppnå?"
      subtitle="Välj det som känns viktigast för dig just nu. Vi anpassar upplevelsen efter ditt mål."
    >
      <div className="space-y-3">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const isSelected = data.userGoal === goal.id;
          
          return (
            <button
              key={goal.id}
              onClick={() => selectGoal(goal.id)}
              className={`w-full p-5 rounded-xl text-left transition-all border-2 relative overflow-hidden ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-white/10 dark-card hover:border-indigo-500/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white text-lg">{goal.title}</h3>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{goal.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Button
        onClick={onNext}
        disabled={!data.userGoal}
        className="w-full h-14 mt-8 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
      >
        Fortsätt
      </Button>
    </OnboardingStep>
  );
}