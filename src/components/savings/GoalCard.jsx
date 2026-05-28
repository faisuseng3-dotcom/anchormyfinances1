import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SavingsDepositModal from './SavingsDepositModal';

export default function GoalCard({ profile, onUpdated }) {
  const [showDeposit, setShowDeposit] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const goal = profile?.savingsGoal || 0;
  const current = profile?.savingsCurrentBalance || 0;
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const remaining = Math.max(goal - current, 0);
  const emoji = profile?.savingsGoalEmoji || '🎯';
  const goalName = profile?.savingsGoalName || 'Mitt sparmål';
  const dailyTarget = profile?.savingsGoalDailyTarget || null;
  const microGoal = profile?.savingsDailyMicroAmount || null;
  const streak = profile?.savingsMotivationStreak || 0;
  const cooldown = profile?.impulseCooldownHours || 0;
  const threshold = profile?.impulseThreshold || 0;

  const fetchAIMessage = async () => {
    if (aiMessage || loadingAI) return;
    setLoadingAI(true);
    const totalExpenses = (profile?.monthlyExpenses || []).reduce((s, e) => s + e.amount, 0);
    const margin = (profile?.income || 0) - totalExpenses - (profile?.housingCost || 0);
    const monthsLeft = margin > 0 ? Math.ceil(remaining / margin) : null;
    setAiMessage(monthsLeft
      ? `Baserat på din nuvarande marginal på ${margin.toLocaleString('sv-SE')} kr/mån når du ditt mål om ungefär ${monthsLeft} ${monthsLeft === 1 ? 'månad' : 'månader'}.`
      : 'Lägg till fler utgifter för att få en prognos.');
    setLoadingAI(false);
  };

  const handleDeposit = async (amount, newBalance) => {
    await base44.entities.FinancialProfile.update(profile.id, { savingsCurrentBalance: newBalance });
    onUpdated();
  };

  if (!goal) return null;

  return (
    <>
      <div className="mx-5 rounded-2xl overflow-hidden"
        style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{emoji}</span>
              <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{goalName}</p>
            </div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              {Math.round(pct)}%
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 rounded-full overflow-hidden mt-3 mb-2" style={{ background: 'rgba(0,0,0,0.08)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: pct >= 100 ? '#0D7377' : 'linear-gradient(90deg, #0D7377, #4B7CF3)' }}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {current.toLocaleString('sv-SE')} kr sparade
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Mål: {goal.toLocaleString('sv-SE')} kr
            </p>
          </div>

          {remaining > 0 && (
            <p className="text-sm mt-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Du behöver spara <strong>{remaining.toLocaleString('sv-SE')} kr</strong> till.
            </p>
          )}

          {(dailyTarget || microGoal) && (
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {dailyTarget ? `Tempo: ${dailyTarget.toLocaleString('sv-SE')} kr/dag` : ''}
              {dailyTarget && microGoal ? ' · ' : ''}
              {microGoal ? `Dagens mini-mål: ${Number(microGoal).toLocaleString('sv-SE')} kr` : ''}
            </p>
          )}

          {(cooldown > 0 || threshold > 0 || streak > 0) && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {streak > 0 ? `🔥 Streak: ${streak} dagar` : '🔥 Streak: 0 dagar'}
              {cooldown > 0 ? ` · Cooldown ${cooldown}h` : ''}
              {threshold > 0 ? ` över ${Number(threshold).toLocaleString('sv-SE')} kr` : ''}
            </p>
          )}

          {pct >= 100 && (
            <p className="text-sm mt-2 font-bold" style={{ color: '#0D7377' }}>🎉 Mål uppnått! Grattis!</p>
          )}
        </div>

        {/* AI prognos */}
        <div
          className="mx-4 mb-4 p-3 rounded-xl cursor-pointer"
          style={{ background: 'rgba(75,124,243,0.08)', border: '1px solid rgba(75,124,243,0.15)' }}
          onClick={fetchAIMessage}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: '#4B7CF3' }} />
            {loadingAI ? (
              <p className="text-xs" style={{ color: '#4B7CF3' }}>Beräknar prognos...</p>
            ) : aiMessage ? (
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{aiMessage}</p>
            ) : (
              <p className="text-xs" style={{ color: '#4B7CF3' }}>Tryck för AI-prognos 🔮</p>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="px-4 pb-5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowDeposit(true)}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white"
            style={{ background: 'var(--color-accent)' }}
          >
            💰 Spara nu
          </motion.button>
        </div>
      </div>

      {showDeposit && (
        <SavingsDepositModal
          profile={profile}
          onSave={handleDeposit}
          onClose={() => setShowDeposit(false)}
        />
      )}
    </>
  );
}