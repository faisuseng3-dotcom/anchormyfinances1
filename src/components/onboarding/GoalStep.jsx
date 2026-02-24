import React from 'react';
import { Button } from "@/components/ui/button";
import { PiggyBank, TrendingDown, Brain, Shield, Check } from 'lucide-react';
import OnboardingStep from './OnboardingStep';

const goals = [
  {
    id: 'save',
    title: 'Spara mer',
    description: 'Jag vill bygga upp mitt sparande och nå mina mål snabbare.',
    icon: PiggyBank,
    color: 'bg-emerald-100 text-emerald-600 border-emerald-200'
  },
  {
    id: 'reduce_debt',
    title: 'Minska skulder',
    description: 'Jag vill bli av med mina lån och krediter snabbare.',
    icon: TrendingDown,
    color: 'bg-amber-100 text-amber-600 border-amber-200'
  },
  {
    id: 'reduce_stress',
    title: 'Minska stress',
    description: 'Jag vill ha bättre koll och känna mig tryggare ekonomiskt.',
    icon: Brain,
    color: 'bg-purple-100 text-purple-600 border-purple-200'
  },
  {
    id: 'build_buffer',
    title: 'Bygga buffert',
    description: 'Jag vill ha en trygghetsmarginal för oväntade utgifter.',
    icon: Shield,
    color: 'bg-blue-100 text-blue-600 border-blue-200'
  }
];

export default function GoalStep({ data, onChange, onNext, onBack }) {
  const selectGoal = (goalId) => {
    onChange({ ...data, financialGoal: goalId });
  };

  return (
    <OnboardingStep
      step={4}
      totalSteps={5}
      title="Ditt fokus just nu"
      subtitle="Vad är viktigast för dig? Vi anpassar coachningen efter ditt mål."
    >
      <div className="space-y-3">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const isSelected = data.financialGoal === goal.id;
          
          return (
            <button
              key={goal.id}
              onClick={() => selectGoal(goal.id)}
              className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-white/10 dark-card hover:border-emerald-500/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${goal.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{goal.title}</h3>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{goal.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-14 rounded-xl"
        >
          Tillbaka
        </Button>
        <Button
          onClick={onNext}
          disabled={!data.financialGoal}
          className="flex-1 h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600"
        >
          Slutför
        </Button>
      </div>
    </OnboardingStep>
  );
}