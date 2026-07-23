// @ts-nocheck
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Trophy } from 'lucide-react';
import { surface } from '@/lib/designTokens';

const CHALLENGES = [
  {
    id: 'no_restaurant_3d',
    title: 'Ingen restaurang 3 dagar',
    description: 'Ät hemma 3 dagar i rad',
    points: 50,
    category: 'entertainment',
    targetDays: 3,
  },
  {
    id: 'save_500_week',
    title: 'Spara 500 kr denna vecka',
    description: 'Registrera en insättning på minst 500 kr',
    points: 80,
    category: 'savings',
    targetAmount: 500,
  },
  {
    id: 'no_shopping_week',
    title: 'Shoppingpaus 1 vecka',
    description: 'Inga köp i kategorin Shopping denna vecka',
    points: 60,
    category: 'shopping',
    targetDays: 7,
  },
];

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000];

function getLevelInfo(xp) {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  const currentThreshold = LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)];
  const nextThreshold = LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)];
  const progress = nextThreshold > currentThreshold
    ? Math.min(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100)
    : 100;
  return { level, progress, xpToNext: Math.max(nextThreshold - xp, 0), nextThreshold };
}

function ChallengeRow({ challenge, transactions }) {
  const progress = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekTxs = transactions.filter((tx) => new Date(tx.created_date) >= weekStart);

    if (challenge.id === 'no_restaurant_3d') {
      let cleanDays = 0;
      for (let i = 0; i < 3; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dayStr = d.toDateString();
        const hasRestaurant = transactions.some(
          (tx) =>
            new Date(tx.created_date).toDateString() === dayStr &&
            tx.category === 'entertainment' &&
            tx.amount < 0,
        );
        if (!hasRestaurant) cleanDays++;
      }
      return { value: cleanDays, max: 3, label: `${cleanDays}/3 dagar` };
    }

    if (challenge.id === 'save_500_week') {
      const saved = weekTxs
        .filter((tx) => tx.type === 'savings_deposit' || tx.category === 'savings')
        .reduce((s, t) => s + Math.abs(t.amount), 0);
      return { value: Math.min(saved, 500), max: 500, label: `${Math.round(saved)}/500 kr` };
    }

    if (challenge.id === 'no_shopping_week') {
      const hasShop = weekTxs.some((tx) => tx.category === 'shopping' && tx.amount < 0);
      const days = hasShop ? 0 : Math.min(7, Math.floor((now - weekStart) / (1000 * 60 * 60 * 24)));
      return { value: days, max: 7, label: `${days}/7 dagar` };
    }

    return { value: 0, max: 1, label: '' };
  }, [challenge, transactions]);

  const pct = (progress.value / progress.max) * 100;
  const done = pct >= 100;

  return (
    <div className="px-4 py-4 border-b border-white/[0.06] last:border-0">
      <div className="flex items-start gap-3">
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${done ? 'bg-emerald-400' : 'bg-[var(--color-accent)]'}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className={`text-sm font-semibold ${done ? 'text-emerald-300' : 'text-white'}`}>
              {challenge.title}
            </p>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                done
                  ? 'bg-[#4fae82]/15 text-emerald-300'
                  : 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
              }`}
            >
              +{challenge.points} XP
            </span>
          </div>
          <p className="anchor-type-body-sm mb-2">{challenge.description}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/[0.08]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className={`h-full rounded-full ${done ? 'bg-emerald-400' : 'bg-[var(--color-accent)]'}`}
              />
            </div>
            <p className="text-xs font-semibold text-white/45 flex-shrink-0 tabular-nums">{progress.label}</p>
          </div>
          {done && <p className="text-xs font-semibold text-emerald-300 mt-1">Bra jobbat — utmaningen klar!</p>}
        </div>
      </div>
    </div>
  );
}

export default function GamificationSection({ profile, transactions = [] }) {
  const xp = profile?.totalXP || 0;
  const { level, progress, xpToNext } = getLevelInfo(xp);
  const badges = profile?.unlockedBadges || [];

  return (
    <div className="space-y-4">
      <div className={`${surface.card} p-5`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-[var(--anchor-radius-lg)] flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[var(--color-accent)] to-emerald-400/80 anchor-elev-2">
            <span className="text-2xl font-light text-[#050d28] tabular-nums">{level}</span>
          </div>
          <div>
            <p className="anchor-type-body-sm text-white/45">Din nivå</p>
            <p className="text-xl font-semibold text-white tracking-tight">Level {level}</p>
            <p className="anchor-type-body-sm mt-0.5">
              {xp.toLocaleString('sv-SE')} XP totalt
              {xpToNext > 0 ? ` · ${xpToNext} XP till nästa nivå` : ' · Max nivå!'}
            </p>
          </div>
        </div>
        <div className="w-full h-2.5 rounded-full overflow-hidden bg-white/[0.08]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-emerald-400"
          />
        </div>
      </div>

      {badges.length > 0 && (
        <div className={`${surface.card} p-5`}>
          <p className="anchor-type-body-sm text-white/45 mb-3">Dina badges</p>
          <div className="flex flex-wrap gap-3">
            {badges.map((b) => (
              <div key={b} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-[var(--anchor-radius-lg)] flex items-center justify-center bg-[#4fae82]/10 ring-1 ring-emerald-400/20 anchor-elev-1">
                  <Star className="w-5 h-5 text-emerald-300" />
                </div>
                <p className="text-xs text-center max-w-12 leading-tight text-white/45">{b.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`${surface.card} overflow-hidden p-0`}>
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[var(--color-warning)]" />
          <p className="anchor-type-body-sm text-white/45">Aktiva utmaningar</p>
        </div>
        {CHALLENGES.map((ch) => (
          <ChallengeRow key={ch.id} challenge={ch} transactions={transactions} />
        ))}
      </div>

      <SelfLeaderboard transactions={transactions} profile={profile} />
    </div>
  );
}

function SelfLeaderboard({ transactions }) {
  const { thisMonth, lastMonth } = useMemo(() => {
    const now = new Date();
    const thisMonthExpenses = transactions
      .filter((tx) => {
        const d = new Date(tx.created_date);
        return tx.amount < 0 && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, t) => s + Math.abs(t.amount), 0);

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthExpenses = transactions
      .filter((tx) => {
        const d = new Date(tx.created_date);
        return tx.amount < 0 && d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
      })
      .reduce((s, t) => s + Math.abs(t.amount), 0);

    return { thisMonth: Math.round(thisMonthExpenses), lastMonth: Math.round(lastMonthExpenses) };
  }, [transactions]);

  const diff = lastMonth - thisMonth;
  const better = diff > 0;

  if (!lastMonth && !thisMonth) return null;

  return (
    <div className={`${surface.card} p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-[var(--color-warning)]" />
        <p className="anchor-type-body-sm text-white/45">Mot dig själv</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-[var(--anchor-radius-md)] p-3 bg-white/[0.04] ring-1 ring-white/[0.06]">
          <p className="anchor-type-body-sm mb-1">Förra månaden</p>
          <p className="text-lg font-semibold text-white tabular-nums">{lastMonth.toLocaleString('sv-SE')} kr</p>
        </div>
        <div
          className={`rounded-[var(--anchor-radius-md)] p-3 ring-1 ${
            better
              ? 'bg-[#4fae82]/10 ring-emerald-400/20'
              : 'bg-rose-500/10 ring-rose-400/20'
          }`}
        >
          <p className="anchor-type-body-sm mb-1">Denna månad</p>
          <p className={`text-lg font-semibold tabular-nums ${better ? 'text-emerald-300' : 'text-rose-300'}`}>
            {thisMonth.toLocaleString('sv-SE')} kr
          </p>
        </div>
      </div>
      <p className={`text-sm font-medium leading-relaxed ${better ? 'text-emerald-300' : 'text-rose-300/90'}`}>
        {better
          ? `Bra jobbat — ${diff.toLocaleString('sv-SE')} kr mindre än förra månaden. Det märks i plånboken.`
          : diff < 0
            ? `${Math.abs(diff).toLocaleString('sv-SE')} kr mer än förra månaden — inget katastrof, men bra att veta.`
            : 'Samma nivå som förra månaden — stabilt och förutsägbart.'}
      </p>
    </div>
  );
}
