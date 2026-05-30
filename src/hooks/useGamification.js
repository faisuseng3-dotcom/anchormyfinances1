import { useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export function useGamification(profile) {
  const updateStreak = useCallback(async () => {
    if (!profile?.id) return;

    const today = new Date().toISOString().split('T')[0];
    const lastLogin = profile.lastLoginDate?.split('T')[0];

    // Redan loggad in idag
    if (lastLogin === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = profile.dailyLoginStreak || 0;
    if (lastLogin === yesterdayStr) {
      newStreak++;
    } else {
      newStreak = 1;
    }

    await base44.entities.FinancialProfile.update(profile.id, {
      dailyLoginStreak: newStreak,
      lastLoginDate: new Date().toISOString()
    });
  }, [profile]);

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  return { updateStreak };
}

export function calculateLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

export function addXP(currentXP, points) {
  return currentXP + points;
}

export const BADGES = {
  first_thousand: {
    id: 'first_thousand',
    label: 'Första tusenlappen 💰',
    description: 'Sparade första 1000 kr',
    icon: '💰',
    condition: (profile) => profile.savingsCurrentBalance >= 1000
  },
  debt_destroyer: {
    id: 'debt_destroyer',
    label: 'Skuld-Slayer 🔥',
    description: 'Betalade av ett helt lån',
    icon: '🔥',
    condition: (profile) => (profile.loans || []).length === 0 && profile.unlockedBadges?.includes('debt_destroyer')
  },
  streak_master: {
    id: 'streak_master',
    label: 'Streak Master 🔥',
    description: '7 dagars inloggningsstreak',
    icon: '🔥',
    condition: (profile) => profile.dailyLoginStreak >= 7
  },
  expense_tracker: {
    id: 'expense_tracker',
    label: 'Spenderbjörn 🎯',
    description: 'Registrerade 20 utgifter',
    icon: '🎯',
    condition: (profile) => (profile.monthlyExpenses || []).length >= 20
  },
  buffer_builder: {
    id: 'buffer_builder',
    label: 'Buffer Builders 🏰',
    description: 'Buffert är 3+ månaders lön',
    icon: '🏰',
    condition: (profile) => profile.buffer >= profile.income * 3
  }
};

export async function checkAndUnlockBadges(profile) {
  if (!profile) return [];

  const newBadges = [];
  const currentBadges = profile.unlockedBadges || [];

  for (const [key, badge] of Object.entries(BADGES)) {
    if (!currentBadges.includes(badge.id) && badge.condition(profile)) {
      newBadges.push(badge.id);
    }
  }

  if (newBadges.length > 0 && profile.id) {
    await base44.entities.FinancialProfile.update(profile.id, {
      unlockedBadges: [...currentBadges, ...newBadges]
    });
  }

  return newBadges;
}