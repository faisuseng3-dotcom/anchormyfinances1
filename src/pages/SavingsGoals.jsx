import React, { useState } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { PiggyBank, Pencil, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GoalCard from '@/components/savings/GoalCard';
import PageShell from '@/components/layout/PageShell';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { sectionSubtitleClass } from '@/lib/anchorTheme';
import {
  anchorPrimaryButtonClass,
  anchorSecondaryButtonClass,
  anchorInputClass,
  anchorIconButtonClass,
  sectionMetaClass,
  elevatedSheet,
} from '@/lib/anchorTheme';
import { createPageUrl } from '@/utils';

function getDaysTo(deadline) {
  if (!deadline) return null;
  const end = new Date(deadline);
  const now = new Date();
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

function EditGoalModal({ profile, onSave, onClose }) {
  const [name, setName] = useState(profile?.savingsGoalName || '');
  const [target, setTarget] = useState(profile?.savingsGoal ? String(profile.savingsGoal) : '');
  const [deadline, setDeadline] = useState(profile?.savingsGoalDeadline || '');
  const [cooldownHours, setCooldownHours] = useState(profile?.impulseCooldownHours || 48);
  const [cooldownThreshold, setCooldownThreshold] = useState(profile?.impulseThreshold || 700);
  const [dailyMicroAmount, setDailyMicroAmount] = useState(profile?.savingsDailyMicroAmount || 25);

  const handleSave = () => {
    const t = parseFloat(target.replace(',', '.'));
    if (!name || isNaN(t)) return;
    const current = profile?.savingsCurrentBalance || 0;
    const days = getDaysTo(deadline);
    const remaining = Math.max(0, t - current);
    const dailyTarget = days ? Math.max(1, Math.ceil(remaining / days)) : null;
    const monthlyTarget = dailyTarget ? Math.ceil((dailyTarget * 365) / 12) : null;

    onSave({
      savingsGoalName: name,
      savingsGoal: t,
      savingsGoalEmoji: profile?.savingsGoalEmoji || '🎯',
      savingsGoalDeadline: deadline || null,
      savingsGoalDailyTarget: dailyTarget,
      savingsGoalMonthlyTarget: monthlyTarget,
      savingsDailyMicroAmount: Math.max(1, Number(dailyMicroAmount) || 25),
      savingsMotivationStreak: profile?.savingsMotivationStreak || 0,
      impulseShieldEnabled: true,
      impulseCooldownHours: Math.max(0, Number(cooldownHours) || 0),
      impulseThreshold: Math.max(100, Number(cooldownThreshold) || 100),
    });
  };

  const targetNum = parseFloat(target.replace(',', '.'));
  const current = profile?.savingsCurrentBalance || 0;
  const days = getDaysTo(deadline);
  const remaining = Number.isFinite(targetNum) ? Math.max(0, targetNum - current) : 0;
  const dailyNeeded = days && Number.isFinite(targetNum) ? Math.ceil(remaining / days) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          className="w-full max-w-md rounded-t-[24px] p-6 pb-10"
          style={elevatedSheet()}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-[20px] font-semibold text-white">
                {profile?.savingsGoal ? 'Redigera sparmål' : 'Skapa sparmål'}
              </h2>
              <p className={`${sectionMetaClass} mt-1`}>Tydligt mål, tydligt tempo.</p>
            </div>
            <button type="button" onClick={onClose} className={anchorIconButtonClass} aria-label="Stäng">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className={`${sectionMetaClass} mb-1`}>Namn på målet</p>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="t.ex. Resa till Japan"
            className={`${anchorInputClass} w-full mb-4`} />

          <p className={`${sectionMetaClass} mb-1`}>Målbelopp (kr)</p>
          <input value={target} onChange={e => setTarget(e.target.value)} type="number" placeholder="0"
            className={`${anchorInputClass} w-full mb-4`} />

          <p className={`${sectionMetaClass} mb-1`}>Deadline</p>
          <input
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            type="date"
            className={`${anchorInputClass} w-full mb-4`}
          />

          {dailyNeeded && (
            <div className="rounded-xl px-3 py-2.5 mb-4 border border-white/[0.08] bg-white/[0.04]">
              <p className="text-[13px] text-white/75">
                För att nå målet i tid behöver du cirka <strong>{dailyNeeded.toLocaleString('sv-SE')} kr/dag</strong>.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div>
              <p className={`${sectionMetaClass} mb-1`}>Dagens mini-mål (kr)</p>
              <input
                value={dailyMicroAmount}
                onChange={e => setDailyMicroAmount(e.target.value)}
                type="number"
                min="1"
                className={`${anchorInputClass} w-full`}
              />
            </div>
            <div>
              <p className={`${sectionMetaClass} mb-1`}>Väntetid vid impulsköp (timmar)</p>
              <input
                value={cooldownHours}
                onChange={e => setCooldownHours(e.target.value)}
                type="number"
                min="0"
                className={`${anchorInputClass} w-full`}
              />
            </div>
            <div className="sm:col-span-2">
              <p className={`${sectionMetaClass} mb-1`}>Skydd aktiveras över (kr)</p>
              <input
                value={cooldownThreshold}
                onChange={e => setCooldownThreshold(e.target.value)}
                type="number"
                min="100"
                className={`${anchorInputClass} w-full`}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className={`flex-1 ${anchorSecondaryButtonClass}`}>Avbryt</button>
            <button type="button" onClick={handleSave} className={`flex-1 ${anchorPrimaryButtonClass}`}>Spara</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function SavingsGoals() {
  const [showEdit, setShowEdit] = useState(false);
  const { profile, updateProfile, invalidate } = useFinancialProfile();

  const handleSaveGoal = async (data) => {
    await updateProfile(data);
    setShowEdit(false);
  };

  const handleDeposit = async (newBalance) => {
    await updateProfile({ savingsCurrentBalance: newBalance });
    invalidate();
  };

  return (
    <PageShell
      title="Mina mål"
      subtitle="Sparande"
      backHref={createPageUrl('Dashboard')}
      action={
        profile?.savingsGoal ? (
          <button type="button" onClick={() => setShowEdit(true)} className="anchor-icon-btn" aria-label="Redigera mål">
            <Pencil className="w-4 h-4" />
          </button>
        ) : null
      }
    >
      {profile?.savingsGoal ? (
        <GoalCard profile={profile} onUpdated={invalidate} onDeposit={handleDeposit} />
      ) : (
        <div className="flex flex-col items-center text-center py-12">
          <PiggyBank className="w-10 h-10 mb-4 text-white/35" />
          <p className="text-[17px] font-semibold text-white mb-1">Inget sparmål ännu</p>
          <p className={`${sectionSubtitleClass} mb-6`}>Sätt ett mål så hjälper Anchor dig nå dit.</p>
          <button type="button" onClick={() => setShowEdit(true)} className={anchorPrimaryButtonClass}>
            Skapa sparmål
          </button>
        </div>
      )}

      {showEdit && (
        <EditGoalModal profile={profile} onSave={handleSaveGoal} onClose={() => setShowEdit(false)} />
      )}
    </PageShell>
  );
}

export const pageSeo = pageSeoFor('SavingsGoals');
