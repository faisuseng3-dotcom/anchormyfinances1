import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flame, PiggyBank, Shield, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SavingsDepositModal from './SavingsDepositModal';
import { DashboardDivider, DashboardListRow } from '@/components/dashboard/DashboardChrome';
import {
  anchorPrimaryButtonClass,
  sectionMetaClass,
  sectionSubtitleClass,
} from '@/lib/anchorTheme';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function formatDeadline(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return null;
  }
}

function estimateMonthsToGoal(profile, remaining) {
  const totalExpenses = (profile?.monthlyExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const subs = (profile?.subscriptions || []).reduce((s, x) => s + (x.amount || 0), 0);
  const loans = (profile?.loans || []).reduce((s, x) => s + (x.monthlyPayment || 0), 0);
  const fixed = (profile?.housingCost || 0) + subs + loans;
  const margin = (profile?.income || 0) - totalExpenses - fixed;
  if (margin <= 0 || remaining <= 0) return null;
  return Math.max(1, Math.ceil(remaining / margin));
}

export default function GoalCard({ profile, onUpdated, onDeposit }) {
  const [showDeposit, setShowDeposit] = useState(false);

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
  const deadlineLabel = formatDeadline(profile?.savingsGoalDeadline);
  const monthsLeft = useMemo(() => estimateMonthsToGoal(profile, remaining), [profile, remaining]);

  const handleDeposit = async (_amount, newBalance) => {
    if (onDeposit) {
      await onDeposit(newBalance);
      return;
    }
    if (!profile?.id) return;
    await base44.entities.FinancialProfile.update(profile.id, { savingsCurrentBalance: newBalance });
    onUpdated?.();
  };

  if (!goal) return null;

  const pctRounded = Math.round(pct);
  const almostThere = pctRounded >= 75 && pctRounded < 100;
  const isDone = pctRounded >= 100;

  const headline = isDone
    ? 'Grattis — du nådde målet!'
    : almostThere
      ? 'Nästan i mål'
      : pctRounded >= 40
        ? 'Du är på god väg'
        : 'Varje krona räknas';

  return (
    <>
      <div className="mx-4 sm:mx-5 rounded-2xl overflow-hidden border border-white/[0.1] bg-white/[0.04]">
        {/* Hero */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-[72px] h-[72px] rounded-2xl flex flex-col items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, rgba(232,184,107,0.25) 0%, rgba(232,184,107,0.06) 100%)',
                border: '1px solid rgba(232,184,107,0.35)',
              }}
            >
              <span className="text-[26px] leading-none">{emoji}</span>
              <span className="text-[20px] font-bold text-white tabular-nums mt-1">{pctRounded}%</span>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-[13px] font-medium text-[#E8B86B]">{headline}</p>
              <h2 className="text-[20px] font-semibold text-white leading-tight mt-0.5 truncate">
                {goalName}
              </h2>
              <p className={`${sectionSubtitleClass} mt-1`}>
                {fmt(current)} av {fmt(goal)} kr
              </p>
              {deadlineLabel && !isDone && (
                <p className={`${sectionMetaClass} mt-1`}>Mål senast {deadlineLabel}</p>
              )}
            </div>
          </div>

          <div className="mt-5 h-2 rounded-full overflow-hidden bg-white/[0.08]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#E8B86B] to-[#F0D090]"
            />
          </div>

          {!isDone && remaining > 0 && (
            <div className="mt-4 rounded-xl px-4 py-3 bg-white/[0.05] border border-white/[0.08]">
              <p className="text-[13px] text-white/55 mb-0.5">Kvar att spara</p>
              <p className="text-[28px] font-semibold text-white tabular-nums leading-none">
                {fmt(remaining)} <span className="text-[17px] font-medium text-white/70">kr</span>
              </p>
              {dailyTarget && (
                <p className={`${sectionSubtitleClass} mt-2`}>
                  Ungefär <strong className="text-white/80">{fmt(dailyTarget)} kr per dag</strong> räcker
                  {deadlineLabel ? ' om du håller tempot' : ''}.
                </p>
              )}
            </div>
          )}

          {isDone && (
            <p className="text-[15px] font-medium text-emerald-300/95 mt-4">
              Du har sparat ihop hela beloppet. Bra jobbat.
            </p>
          )}
        </div>

        {/* Tips & skydd */}
        {(microGoal || streak > 0 || (cooldown > 0 && threshold > 0)) && !isDone && (
          <>
            <DashboardDivider className="mx-5" />
            <div className="px-1 pb-1">
              {microGoal > 0 && (
                <DashboardListRow
                  leading={<Calendar className="w-5 h-5 text-[#E8B86B]" />}
                  title="Idag"
                  subtitle={`Lägg undan ${fmt(microGoal)} kr — det räcker för att hålla igång`}
                  trailing={null}
                  className="px-4"
                />
              )}
              {streak > 0 && (
                <DashboardListRow
                  leading={<Flame className="w-5 h-5 text-orange-400" />}
                  title={`${streak} ${streak === 1 ? 'dag' : 'dagar'} i rad`}
                  subtitle="Du har hållit igång sparandet"
                  trailing={null}
                  className="px-4"
                />
              )}
              {cooldown > 0 && threshold > 0 && profile?.impulseShieldEnabled !== false && (
                <DashboardListRow
                  leading={<Shield className="w-5 h-5 text-sky-400" />}
                  title="Skydd mot impulsköp"
                  subtitle={`Vänta ${cooldown} timmar innan köp över ${fmt(threshold)} kr`}
                  trailing={null}
                  className="px-4"
                />
              )}
            </div>
          </>
        )}

        {monthsLeft && !isDone && (
          <>
            <DashboardDivider className="mx-5" />
            <div className="mx-5 mb-4 flex gap-3 rounded-xl px-4 py-3 bg-white/[0.03] border border-white/[0.06]">
              <TrendingUp className="w-5 h-5 flex-shrink-0 text-white/40 mt-0.5" />
              <p className="text-[14px] text-white/75 leading-relaxed">
                Med pengar du har kvar varje månad kan du vara klar om cirka{' '}
                <strong className="text-white/90">
                  {monthsLeft} {monthsLeft === 1 ? 'månad' : 'månader'}
                </strong>
                — om du sparar i samma takt som nu.
              </p>
            </div>
          </>
        )}

        <DashboardDivider className="mx-5" />

        <div className="px-4 pb-5 pt-1">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowDeposit(true)}
            className={`w-full mt-3 ${anchorPrimaryButtonClass}`}
          >
            <PiggyBank className="w-5 h-5" />
            Lägg till sparande
          </motion.button>
          <p className={`${sectionMetaClass} text-center mt-3`}>
            Uppdatera hur mycket du har sparat — vi räknar om resten.
          </p>
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
