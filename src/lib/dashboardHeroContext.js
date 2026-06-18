import { getMonthlyMargin } from '@/lib/financialUtils';
import { computeFreeMoney } from '@/lib/copilotTheme';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function daysUntilPayday(incomeDay = 25) {
  const today = new Date();
  const currentDay = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth();
  let payday = new Date(year, month, incomeDay);
  if (currentDay >= incomeDay) {
    payday = new Date(year, month + 1, incomeDay);
  }
  return Math.max(1, Math.ceil((payday - today) / 86400000));
}

function monthSpent(transactions, monthOffset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0);
  return (transactions || [])
    .filter((tx) => {
      const d = new Date(tx.created_date || tx.date || 0);
      return d >= start && d <= end && tx.amount < 0 && tx.type !== 'transfer_to_savings';
    })
    .reduce((s, tx) => s + Math.abs(tx.amount), 0);
}

/** Kontextrader under "Säkert att spendera"-heron. */
export function buildHeroContext(profile, transactions) {
  if (!profile?.income) {
    return {
      budgetLine: 'Sätt upp din inkomst för att se marginalen',
      paydayLine: null,
      trendLine: null,
    };
  }

  const margin = getMonthlyMargin(profile);
  const freeMoney = computeFreeMoney(profile, transactions);
  const spent = monthSpent(transactions, 0);
  const prevSpent = monthSpent(transactions, -1);
  const incomeDay = profile.incomeDay || 25;
  const paydayDays = daysUntilPayday(incomeDay);

  let budgetLine = 'Du ligger inom budget';
  if (margin > 0) {
    const usedPct = spent / margin;
    if (usedPct >= 1) budgetLine = 'Du har passerat månadens budget';
    else if (usedPct >= 0.85) budgetLine = 'Du närmar dig budgetgränsen';
    else if (freeMoney > margin * 0.35) budgetLine = 'Du ligger inom budget';
    else budgetLine = 'Håll koll på utgifterna denna månad';
  }

  const paydayLine = `${paydayDays} dag${paydayDays === 1 ? '' : 'ar'} till lön`;

  let trendLine = null;
  if (prevSpent > 500) {
    const diffPct = Math.round(((prevSpent - spent) / prevSpent) * 100);
    if (diffPct >= 5) trendLine = `${diffPct}% bättre än förra månaden`;
    else if (diffPct <= -5) trendLine = `${Math.abs(diffPct)}% mer än förra månaden`;
  }

  return { budgetLine, paydayLine, trendLine, trendPositive: trendLine?.includes('bättre') ?? null, freeMoney, margin, fmt };
}
