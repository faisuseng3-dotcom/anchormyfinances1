import React, { useState } from 'react';
import { Shield, PiggyBank, TrendingUp, Target, Check } from 'lucide-react';
import OnboardingStep from './OnboardingStep';
import { motion, AnimatePresence } from 'framer-motion';
import {
  onboardingChoiceCard,
  onboardingChoiceCheck,
  onboardingPrimaryBtn,
  onboardingBackBtn,
} from './onboardingUi';

const goals = [
  {
    id: 'control',
    title: 'Få kontroll',
    description: 'Bättre koll på var pengarna tar vägen.',
    icon: Shield,
  },
  {
    id: 'save',
    title: 'Börja spara',
    description: 'Bygga buffert och nå sparmål snabbare.',
    icon: PiggyBank,
  },
  {
    id: 'improve',
    title: 'Förbättra ekonomin',
    description: 'Optimera kostnader och öka marginalen.',
    icon: TrendingUp,
  },
  {
    id: 'plan',
    title: 'Planera framåt',
    description: 'Se vad som händer och fatta smarta beslut.',
    icon: Target,
  },
];

export default function QuickGoalStep({ data, onChange, onNext, onBack }) {
  const selectedGoals = data.userGoals || (data.userGoal ? [data.userGoal] : []);
  const [showPriority, setShowPriority] = useState(false);

  const toggleGoal = (goalId) => {
    const next = selectedGoals.includes(goalId)
      ? selectedGoals.filter((g) => g !== goalId)
      : [...selectedGoals, goalId];
    onChange({
      ...data,
      userGoals: next,
      userGoal: next[0] || '',
      primaryGoal:
        next.length === 1
          ? next[0]
          : data.primaryGoal && next.includes(data.primaryGoal)
            ? data.primaryGoal
            : '',
    });
  };

  const handleContinue = () => {
    if (selectedGoals.length > 1 && !data.primaryGoal) {
      setShowPriority(true);
    } else {
      onNext();
    }
  };

  const selectedGoalObjects = goals.filter((g) => selectedGoals.includes(g.id));

  const renderGoalButton = (goal, isPrimaryMode) => {
    const Icon = goal.icon;
    const isSelected = isPrimaryMode
      ? data.primaryGoal === goal.id
      : selectedGoals.includes(goal.id);

    return (
      <button
        key={goal.id}
        type="button"
        onClick={() =>
          isPrimaryMode ? onChange({ ...data, primaryGoal: goal.id }) : toggleGoal(goal.id)
        }
        className={onboardingChoiceCard(isSelected)}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6B9FFF]/12 border border-[#6B9FFF]/20 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-[#9FB5FF]" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[16px] font-semibold text-white">{goal.title}</p>
            <p className="text-[13px] text-white/50 mt-0.5 leading-relaxed">{goal.description}</p>
            {isPrimaryMode && isSelected && (
              <p className="text-[12px] text-[#9FB5FF] mt-1">Huvudfokus för råd på Hem</p>
            )}
          </div>
          <div className={onboardingChoiceCheck(isSelected)}>
            {isSelected && <Check className="w-3.5 h-3.5 text-[#0a1628]" />}
          </div>
        </div>
      </button>
    );
  };

  return (
    <OnboardingStep
      step={1}
      totalSteps={4}
      title={showPriority ? 'Vad är viktigast just nu?' : 'Vad vill du uppnå?'}
      subtitle={
        showPriority
          ? 'Du valde flera mål — välj ett huvudfokus.'
          : 'Du kan välja flera. Vi anpassar Hem och verktyg efter dina val.'
      }
    >
      <AnimatePresence mode="wait">
        {!showPriority ? (
          <motion.div key="multi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
            {goals.map((goal) => renderGoalButton(goal, false))}
            {selectedGoals.length > 0 && (
              <p className="text-center text-[13px] text-white/40 pt-1">
                {selectedGoals.length} mål valda
              </p>
            )}
            <button
              type="button"
              onClick={handleContinue}
              disabled={selectedGoals.length === 0}
              className={`${onboardingPrimaryBtn} mt-4`}
            >
              Fortsätt
            </button>
          </motion.div>
        ) : (
          <motion.div key="priority" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-2.5">
            {selectedGoalObjects.map((goal) => renderGoalButton(goal, true))}
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={() => setShowPriority(false)} className={onboardingBackBtn}>
                Tillbaka
              </button>
              <button type="button" onClick={onNext} disabled={!data.primaryGoal} className={`${onboardingPrimaryBtn} flex-1`}>
                Fortsätt
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OnboardingStep>
  );
}
