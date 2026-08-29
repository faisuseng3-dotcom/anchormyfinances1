import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function ResilienceScore({ profile }) {
  const [score, setScore] = useState(0);
  const [color, setColor] = useState('');
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!profile) return;

    const totalSubs = (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
    const totalLoans = (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
    const monthlyExpenses = profile.housingCost + totalSubs + totalLoans;

    const months = profile.buffer / monthlyExpenses;

    let calculatedScore = 0;
    let calculatedColor = '';
    let calculatedLabel = '';

    if (months < 1) {
      calculatedScore = Math.round(months * 30);
      calculatedColor = 'text-[var(--color-danger)]';
      calculatedLabel = 'Kritiskt låg trygghet';
    } else if (months < 3) {
      calculatedScore = 30 + Math.round((months - 1) * 20);
      calculatedColor = 'text-[var(--color-warning)]';
      calculatedLabel = 'Medelhög trygghet';
    } else {
      calculatedScore = Math.min(100, 70 + Math.round((months - 3) * 10));
      calculatedColor = 'text-[var(--color-success)]';
      calculatedLabel = 'Hög trygghet';
    }

    setScore(calculatedScore);
    setColor(calculatedColor);
    setLabel(calculatedLabel);
  }, [profile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dark-card p-6 rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-[var(--color-success)]" />
        <h3 className="font-semibold text-[var(--color-text-primary)]">Resilience Score</h3>
      </div>

      <div className="text-center mb-6">
        <p className={`text-6xl font-bold ${color}`}>{score}</p>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2">{label}</p>
      </div>

      <Progress value={score} className="h-3 mb-4" />

      <div className="grid grid-cols-3 gap-2 text-xs text-[var(--color-text-secondary)]">
        <div className="text-center">
          <div className="w-3 h-3 rounded-full bg-rose-500 mx-auto mb-1" />
          <p>0-30</p>
          <p className="text-[10px]">0-1 mån</p>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-1" />
          <p>30-70</p>
          <p className="text-[10px]">1-3 mån</p>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-1" />
          <p>70-100</p>
          <p className="text-[10px]">3+ mån</p>
        </div>
      </div>
    </motion.div>
  );
}