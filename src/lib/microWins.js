/**
 * Dagliga micro-wins — något att fira varje dag det finns anledning.
 */
import { calculatePengometer } from '@/lib/anchorBrain';

const SAVINGS_TYPES = new Set(['savings_deposit', 'transfer_to_savings']);

function dayKey(dateStr) {
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 10);
}

/** Räkna på varandra följande dagar med sparande (slutar idag). */
export function calcSavingsStreak(transactions) {
  const savedDays = new Set();
  (transactions || []).forEach((tx) => {
    if (!SAVINGS_TYPES.has(tx.type) && tx.category !== 'savings') return;
    if ((tx.amount || 0) <= 0) return;
    const key = dayKey(tx.created_date);
    if (key) savedDays.add(key);
  });

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (savedDays.has(key)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

/**
 * Returnerar 1–3 korta firar-rader för dashboarden (prioriterad).
 */
export function getDailyMicroWins(profile, transactions = []) {
  if (!profile) return [];

  const wins = [];
  const peng = calculatePengometer(profile, transactions);
  const savingsStreak = calcSavingsStreak(transactions);
  const loginStreak = profile.dailyLoginStreak || 0;

  if (savingsStreak >= 2) {
    wins.push({
      id: 'savings_streak',
      text: `Du har sparat ${savingsStreak} dagar i rad.`,
      priority: 90,
    });
  }

  const goal = profile.savingsGoal || 0;
  const current = profile.savingsCurrentBalance || 0;
  const goalName = profile.savingsGoalName || 'sparmålet';
  if (goal > 0 && current > 0) {
    const pct = Math.min(100, Math.round((current / goal) * 100));
    if (pct >= 10) {
      wins.push({
        id: 'goal_progress',
        text: `Du är ${pct}% klar med ${goalName}.`,
        priority: 80 + Math.min(15, pct / 10),
      });
    }
  }

  if (peng.fill_percent >= 55 && peng.weekly_budget_kr > 0) {
    wins.push({
      id: 'week_budget',
      text:
        peng.fill_percent >= 80
          ? 'Bra jobbat — du klarade veckobudgeten med marginal.'
          : 'Du ligger bra till den här veckan.',
      priority: 70,
    });
  }

  if (loginStreak >= 3 && savingsStreak < 2) {
    wins.push({
      id: 'login_streak',
      text: `Du har hållit koll ${loginStreak} dagar i rad.`,
      priority: 60,
    });
  }

  if (peng.remaining_week_kr > 0 && peng.spent_week_kr < peng.weekly_budget_kr * 0.5) {
    wins.push({
      id: 'week_headroom',
      text: `${peng.remaining_week_kr.toLocaleString('sv-SE')} kr kvar den här veckan — du har luft.`,
      priority: 55,
    });
  }

  if (wins.length === 0) {
    wins.push({
      id: 'show_up',
      text: 'Bra att du tittade in — små checkar varje dag gör skillnad.',
      priority: 10,
    });
  }

  return wins.sort((a, b) => b.priority - a.priority).slice(0, 2);
}
