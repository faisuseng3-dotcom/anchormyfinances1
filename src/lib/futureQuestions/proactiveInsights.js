// @ts-nocheck
/**
 * De tre sakerna som påverkar användarens framtid mest — beräknat lokalt från
 * riktiga transaktioner, visas innan någon fråga ställts.
 */
import { buildGrowthSeries } from '@/lib/futureQuestions/scenarioMath';

const EXPENSE_TYPES = ['expense', 'savings_deposit', 'transfer_to_savings'];
const DISCRETIONARY = ['food', 'entertainment', 'shopping', 'travel', 'transport'];
const CATEGORY_LABELS = {
  food: 'Restauranger & mat',
  entertainment: 'Nöje',
  shopping: 'Shopping',
  travel: 'Resor',
  transport: 'Transport',
};

function monthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

/** Topp 3 kategorier efter snittspend senaste 3 månaderna — det som faktiskt flyttar framtiden mest. */
export function buildProactiveInsights(profile, transactions) {
  if (!profile || !transactions?.length) return [];

  const cutoff = monthsAgo(3);
  const sums = {};
  transactions.forEach((t) => {
    const isExpense = EXPENSE_TYPES.includes(t.type) || (t.type !== 'income' && (t.amount || 0) < 0);
    if (!isExpense) return;
    const d = new Date(t.created_date || t.date);
    if (d < cutoff) return;
    const cat = t.category || 'other';
    if (!DISCRETIONARY.includes(cat)) return;
    sums[cat] = (sums[cat] || 0) + Math.abs(t.amount);
  });

  return Object.entries(sums)
    .map(([cat, total]) => {
      const monthly = Math.round(total / 3);
      const growth = buildGrowthSeries({ monthlyContribution: monthly, months: 60 });
      const fiveYearInvested = growth[growth.length - 1].invested;
      return {
        id: cat,
        category: cat,
        label: CATEGORY_LABELS[cat] || cat,
        monthly,
        fiveYearInvested,
        question: `Vad händer om jag minskar ${(CATEGORY_LABELS[cat] || cat).toLowerCase()}?`,
      };
    })
    .filter((i) => i.monthly > 100)
    .sort((a, b) => b.monthly - a.monthly)
    .slice(0, 3);
}
