// @ts-nocheck
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Trophy } from 'lucide-react';

const CHALLENGES = [
  {
    id: 'no_restaurant_3d',
    title: 'Ingen restaurang 3 dagar',
    description: 'Ät hemma 3 dagar i rad',
    icon: null,
    points: 50,
    category: 'entertainment',
    targetDays: 3,
  },
  {
    id: 'save_500_week',
    title: 'Spara 500 kr denna vecka',
    description: 'Registrera en insättning på minst 500 kr',
    icon: null,
    points: 80,
    category: 'savings',
    targetAmount: 500,
  },
  {
    id: 'no_shopping_week',
    title: 'Shoppingpaus 1 vecka',
    description: 'Inga köp i kategorin Shopping denna vecka',
    icon: null,
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

    const weekTxs = transactions.filter(tx => new Date(tx.created_date) >= weekStart);

    if (challenge.id === 'no_restaurant_3d') {
      // Count days without entertainment/food restaurant tx in last 3 days
      let cleanDays = 0;
      for (let i = 0; i < 3; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dayStr = d.toDateString();
        const hasRestaurant = transactions.some(tx =>
          new Date(tx.created_date).toDateString() === dayStr &&
          tx.category === 'entertainment' && tx.amount < 0
        );
        if (!hasRestaurant) cleanDays++;
      }
      return { value: cleanDays, max: 3, label: `${cleanDays}/3 dagar` };
    }

    if (challenge.id === 'save_500_week') {
      const saved = weekTxs
        .filter(tx => tx.type === 'savings_deposit' || tx.category === 'savings')
        .reduce((s, t) => s + Math.abs(t.amount), 0);
      return { value: Math.min(saved, 500), max: 500, label: `${Math.round(saved)}/500 kr` };
    }

    if (challenge.id === 'no_shopping_week') {
      const hasShop = weekTxs.some(tx => tx.category === 'shopping' && tx.amount < 0);
      const days = hasShop ? 0 : Math.min(7, Math.floor((now - weekStart) / (1000 * 60 * 60 * 24)));
      return { value: days, max: 7, label: `${days}/7 dagar` };
    }

    return { value: 0, max: 1, label: '' };
  }, [challenge, transactions]);

  const pct = (progress.value / progress.max) * 100;
  const done = pct >= 100;

  return (
    <div className="px-5 py-4 border-b last:border-0" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: done ? '#0D7377' : '#4B7CF3' }} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-bold" style={{ color: done ? '#0D7377' : 'var(--color-text-primary)' }}>{challenge.title}</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: done ? 'rgba(13,115,119,0.12)' : 'rgba(75,124,243,0.1)', color: done ? '#0D7377' : '#4B7CF3' }}>
              +{challenge.points} XP
            </span>
          </div>
          <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>{challenge.description}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full" style={{ background: done ? '#0D7377' : '#4B7CF3' }} />
            </div>
            <p className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>{progress.label}</p>
          </div>
          {done && <p className="text-xs font-bold mt-1" style={{ color: '#0D7377' }}>Bra jobbat — utmaningen klar!</p>}
        </div>
      </div>
    </div>
  );
}

export default function GamificationSection({ profile, transactions = [] }) {
  const xp = profile?.totalXP || 0;
  const { level, progress, xpToNext } = getLevelInfo(xp);
  const badges = profile?.unlockedBadges || [];

  const BADGE_MAP = {};

  return (
    <div className="space-y-4">
      {/* Level card */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0D7377, #4B7CF3)' }}>
            <span className="text-2xl font-black text-white">{level}</span>
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Din nivå</p>
            <p className="text-xl font-black" style={{ color: 'var(--color-text-primary)' }}>Level {level}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{xp.toLocaleString('sv-SE')} XP totalt · {xpToNext > 0 ? `${xpToNext} XP till nästa nivå` : 'Max nivå!'}</p>
          </div>
        </div>
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }}
            className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #0D7377, #4B7CF3)' }} />
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Dina badges</p>
          <div className="flex flex-wrap gap-3">
            {badges.map(b => (
              <div key={b} className="flex flex-col items-center gap-1">
               <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                 style={{ background: 'rgba(13,115,119,0.1)', border: '1px solid rgba(13,115,119,0.2)' }}>
                 <Star className="w-5 h-5" style={{ color: '#0D7377' }} />
               </div>
                <p className="text-xs text-center max-w-12 leading-tight" style={{ color: 'var(--color-text-muted)' }}>{b.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challenges */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
          <Trophy className="w-4 h-4" style={{ color: '#C8923A' }} />
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Aktiva utmaningar</p>
        </div>
        {CHALLENGES.map(ch => (
          <ChallengeRow key={ch.id} challenge={ch} transactions={transactions} />
        ))}
      </div>

      {/* Self-comparison */}
      <SelfLeaderboard transactions={transactions} profile={profile} />
    </div>
  );
}

function SelfLeaderboard({ transactions, profile }) {
  const { thisMonth, lastMonth } = useMemo(() => {
    const now = new Date();
    const thisMonthExpenses = transactions
      .filter(tx => {
        const d = new Date(tx.created_date);
        return tx.amount < 0 && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, t) => s + Math.abs(t.amount), 0);

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthExpenses = transactions
      .filter(tx => {
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
    <div className="rounded-2xl p-5" style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4" style={{ color: '#C8923A' }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Mot dig själv</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.04)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Förra månaden</p>
          <p className="text-lg font-black" style={{ color: 'var(--color-text-primary)' }}>{lastMonth.toLocaleString('sv-SE')} kr</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: better ? 'rgba(13,115,119,0.08)' : 'rgba(229,62,62,0.06)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Denna månad</p>
          <p className="text-lg font-black" style={{ color: better ? '#0D7377' : 'var(--color-danger)' }}>{thisMonth.toLocaleString('sv-SE')} kr</p>
        </div>
      </div>
      <p className="text-sm font-semibold" style={{ color: better ? '#0D7377' : 'var(--color-danger)' }}>
        {better
          ? `Bra jobbat — ${diff.toLocaleString('sv-SE')} kr mindre än förra månaden. Det märks i plånboken.`
          : diff < 0
            ? `${Math.abs(diff).toLocaleString('sv-SE')} kr mer än förra månaden — inget katastrof, men bra att veta.`
            : 'Samma nivå som förra månaden — stabilt och förutsägbart.'}
      </p>
    </div>
  );
}