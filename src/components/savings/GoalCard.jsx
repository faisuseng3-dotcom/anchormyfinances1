import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SavingsDepositModal from './SavingsDepositModal';
import { DashboardDivider } from '@/components/dashboard/DashboardChrome';
import {
  anchorPrimaryButtonClass,
  sectionMetaClass,
  sectionSubtitleClass,
} from '@/lib/anchorTheme';

export default function GoalCard({ profile, onUpdated, onDeposit }) {
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
    if (onDeposit) {
      await onDeposit(newBalance);
      onUpdated?.();
      return;
    }
    if (!profile?.id) return;
    await base44.entities.FinancialProfile.update(profile.id, { savingsCurrentBalance: newBalance });
    onUpdated?.();
  };

  if (!goal) return null;

  return (
    <>
      <div className="mx-5 border border-white/[0.08] rounded-2xl overflow-hidden bg-white/[0.03]">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between mb-2 gap-3">
            <div className="min-w-0">
              <p className={`${sectionMetaClass} mb-0.5`}>Sparmål</p>
              <p className="text-[18px] font-semibold text-white truncate">
                {emoji} {goalName}
              </p>
            </div>
            <p className="text-[15px] font-semibold text-white/65 tabular-nums">
              {Math.round(pct)}%
            </p>
          </div>

          <div className="w-full h-1.5 rounded-full overflow-hidden mt-3 mb-2 bg-white/[0.08]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'rgba(255,255,255,0.6)' }}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className={sectionMetaClass}>
              {current.toLocaleString('sv-SE')} kr sparade
            </p>
            <p className={sectionMetaClass}>
              Mål: {goal.toLocaleString('sv-SE')} kr
            </p>
          </div>

          {remaining > 0 && (
            <p className="text-[14px] mt-2 text-white/75">
              Du behöver spara <strong>{remaining.toLocaleString('sv-SE')} kr</strong> till.
            </p>
          )}

          {(dailyTarget || microGoal) && (
            <p className={`${sectionMetaClass} mt-2`}>
              {dailyTarget ? `Tempo: ${dailyTarget.toLocaleString('sv-SE')} kr/dag` : ''}
              {dailyTarget && microGoal ? ' · ' : ''}
              {microGoal ? `Dagens mini-mål: ${Number(microGoal).toLocaleString('sv-SE')} kr` : ''}
            </p>
          )}

          {(cooldown > 0 || threshold > 0 || streak > 0) && (
            <p className={`${sectionMetaClass} mt-1`}>
              {streak > 0 ? `Streak: ${streak} dagar` : 'Streak: 0 dagar'}
              {cooldown > 0 ? ` · Cooldown ${cooldown}h` : ''}
              {threshold > 0 ? ` över ${Number(threshold).toLocaleString('sv-SE')} kr` : ''}
            </p>
          )}

          {pct >= 100 && (
            <p className="text-[14px] mt-2 font-medium text-emerald-300/90">Mål uppnått.</p>
          )}
        </div>

        <div
          className="mx-4 mb-4 p-3 rounded-xl cursor-pointer border border-white/[0.08] bg-white/[0.02]"
          onClick={fetchAIMessage}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 flex-shrink-0 text-white/45" />
            {loadingAI ? (
              <p className={sectionMetaClass}>Beräknar prognos...</p>
            ) : aiMessage ? (
              <p className="text-[13px] text-white/70">{aiMessage}</p>
            ) : (
              <p className={sectionMetaClass}>Tryck för prognos</p>
            )}
          </div>
        </div>

        <DashboardDivider />

        <div className="px-4 pb-5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowDeposit(true)}
            className={`w-full mt-4 ${anchorPrimaryButtonClass}`}
          >
            Spara nu
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