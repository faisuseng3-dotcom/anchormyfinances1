// @ts-nocheck
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function generateInsights(profile, transactions) {
  const insights = [];
  if (!profile?.income) return insights;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const isExpense = (tx) => (tx.type === 'expense' || tx.type === 'shopping') || tx.amount < 0;

  const thisMo = (transactions || []).filter((t) => {
    const d = new Date(t.created_date || t.date || 0);
    return d >= monthStart && isExpense(t);
  });

  const prevMo = (transactions || []).filter((t) => {
    const d = new Date(t.created_date || t.date || 0);
    return d >= prevMonthStart && d <= prevMonthEnd && isExpense(t);
  });

  // Spend per category this month vs last
  const catThis = {};
  const catPrev = {};
  thisMo.forEach((t) => { const c = t.category || 'other'; catThis[c] = (catThis[c]||0) + Math.abs(t.amount||0); });
  prevMo.forEach((t) => { const c = t.category || 'other'; catPrev[c] = (catPrev[c]||0) + Math.abs(t.amount||0); });

  // Insight 1 — restaurant spending or biggest category increase
  const CAT_LABELS = {
    food: 'restauranger',
    entertainment: 'nöje',
    transport: 'transport',
    shopping: 'shopping',
    health: 'hälsa',
    travel: 'resor',
    other: 'övrigt',
  };
  const RESTAURANT_CATS = new Set(['food', 'entertainment']);
  let restaurantThis = 0;
  let restaurantPrev = 0;
  Object.keys(catThis).forEach((c) => {
    if (RESTAURANT_CATS.has(c)) {
      restaurantThis += catThis[c] || 0;
      restaurantPrev += catPrev[c] || 0;
    }
  });
  if (restaurantPrev > 200) {
    const pct = Math.round(((restaurantThis - restaurantPrev) / restaurantPrev) * 100);
    if (pct >= 15) {
      insights.push(`Du spenderade ${pct}% mer på restauranger denna månad.`);
    }
  }
  if (!insights.length) {
    let biggestIncrease = null;
    let biggestIncreasePct = 0;
    Object.keys(catThis).forEach((c) => {
      if ((catPrev[c] || 0) > 100) {
        const pct = ((catThis[c] - catPrev[c]) / catPrev[c]) * 100;
        if (pct > 20 && pct > biggestIncreasePct) { biggestIncrease = c; biggestIncreasePct = pct; }
      }
    });
    if (biggestIncrease) {
      insights.push(`Du spenderade ${Math.round(biggestIncreasePct)}% mer på ${CAT_LABELS[biggestIncrease] || biggestIncrease} denna månad.`);
    }
  }

  // Insight 2 — subscription savings
  const subs = profile?.subscriptions || [];
  const unusedSub = subs.find((s) => s.amount > 99) || subs[0];
  if (unusedSub) {
    insights.push(`Om du avslutar ${unusedSub.name} sparar du ${fmt(unusedSub.amount * 12)} kr per år.`);
  }

  // Insight 3 — savings goal progress
  if (profile?.savingsGoal > 0 && profile?.savingsCurrentBalance > 0) {
    const pct = Math.round((profile.savingsCurrentBalance / profile.savingsGoal) * 100);
    const monthlyTarget = profile.savingsGoal / 12;
    const aheadPct = monthlyTarget > 0
      ? Math.round(((profile.savingsCurrentBalance - monthlyTarget) / monthlyTarget) * 100)
      : pct;
    if (aheadPct >= 10) {
      insights.push(`Du ligger före ditt sparmål med ${aheadPct}%.`);
    } else if (pct >= 10) {
      insights.push(`Du har sparat ${pct}% av ditt mål "${profile.savingsGoalName || 'Sparmål'}".`);
    }
  }

  // Insight 4 — upcoming subscription
  const daysLeft = Math.max(1, 30 - now.getDate());
  const upcoming = subs.filter((s) => s.billingDay && (s.billingDay - now.getDate()) >= 0 && (s.billingDay - now.getDate()) <= 5);
  if (upcoming.length > 0) {
    insights.push(`${upcoming[0].name} dras om ${upcoming[0].billingDay - now.getDate()} dagar (${fmt(upcoming[0].amount)} kr).`);
  }

  // Insight 5 — total spent this month vs margin
  const totalSpentMonth = thisMo.reduce((s, t) => s + Math.abs(t.amount||0), 0);
  const margin = (profile.income||0) - (profile.housingCost||0)
    - subs.reduce((s,x) => s+(x.amount||0), 0)
    - (profile.loans||[]).reduce((s,l) => s+(l.monthlyPayment||0), 0);
  if (margin > 0 && totalSpentMonth < margin * 0.5 && now.getDate() > 10) {
    insights.push(`Du har använt bara ${Math.round((totalSpentMonth/margin)*100)}% av din månadsbudget. Du är på rätt spår!`);
  }

  return insights.slice(0, 3);
}

export default function ProactiveInsights({ profile, transactions }) {
  const insights = useMemo(() => generateInsights(profile, transactions), [profile, transactions]);

  if (!insights.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-[20px] overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="px-4 pt-4 pb-1 flex items-center gap-2">
        <h2 className="anchor-card-title">Insikter</h2>
      </div>
      <div className="divide-y divide-white/[0.05]">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2.5 px-4 py-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4fae82]/60 shrink-0 mt-2" />
            <p className="text-[13px] text-white/70 leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
