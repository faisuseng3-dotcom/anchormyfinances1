// @ts-nocheck
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, Bell } from 'lucide-react';
import { getNextWeekFixedExpenses } from '@/lib/proactiveAlerts';
import { TRACKED_BUDGET_CATEGORIES, BUDGET_CATEGORY_META } from '@/lib/budgetCategories';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function buildAlerts(profile, transactions) {
  const alerts = [];
  if (!profile?.income) return alerts;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMo = (transactions || []).filter((t) => {
    const d = new Date(t.created_date || t.date || 0);
    return d >= monthStart && t.amount < 0;
  });
  const prevMo = (transactions || []).filter((t) => {
    const d = new Date(t.created_date || t.date || 0);
    return d >= prevMonthStart && d <= prevMonthEnd && t.amount < 0;
  });

  const limits = profile.budgetLimits || {};
  TRACKED_BUDGET_CATEGORIES.forEach((cat) => {
    const limit = limits[cat] || 0;
    if (limit <= 0) return;
    const spent = thisMo
      .filter((t) => (t.category || 'other') === cat)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    if (spent >= limit * 0.85 && spent < limit) {
      alerts.push({
        id: `budget-${cat}`,
        icon: AlertTriangle,
        tone: 'amber',
        text: `Du är på väg att överskrida ${BUDGET_CATEGORY_META[cat]?.label?.toLowerCase() || cat}budgeten.`,
      });
    }
  });

  const thisTotal = thisMo.reduce((s, t) => s + Math.abs(t.amount), 0);
  const prevTotal = prevMo.reduce((s, t) => s + Math.abs(t.amount), 0);
  if (prevTotal > 500 && thisTotal < prevTotal * 0.9) {
    const saved = prevTotal - thisTotal;
    alerts.push({
      id: 'savings-month',
      icon: TrendingUp,
      tone: 'green',
      text: `Du har sparat ${fmt(saved)} kr mer än förra månaden.`,
    });
  }

  const day = now.getDate();
  const upcoming = (profile.subscriptions || []).filter((s) => {
    const due = s.billingDay || s.dueDay || s.day;
    if (!due) return false;
    const diff = due - day;
    return diff >= 0 && diff <= 3;
  });
  if (upcoming.length > 0) {
    const sub = upcoming[0];
    const diff = (sub.billingDay || sub.dueDay || sub.day) - day;
    alerts.push({
      id: `sub-${sub.name}`,
      icon: Bell,
      tone: 'blue',
      text: `${sub.name} förnyas om ${diff === 0 ? 'idag' : `${diff} dag${diff === 1 ? '' : 'ar'}`}.`,
    });
  }

  const weekAlert = getNextWeekFixedExpenses(profile, 7);
  if (weekAlert?.urgency === 'high' && alerts.length < 3) {
    alerts.push({
      id: 'week-ahead',
      icon: AlertTriangle,
      tone: 'amber',
      text: weekAlert.inAppLine,
    });
  }

  return alerts.slice(0, 2);
}

const TONE_STYLES = {
  amber: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', color: '#fbbf24' },
  green: { bg: 'rgba(79, 174, 130, 0.1)', border: 'rgba(79, 174, 130, 0.2)', color: '#4fae82' },
  blue: { bg: 'rgba(79, 174, 130, 0.1)', border: 'rgba(79, 174, 130, 0.2)', color: '#4fae82' },
};

export default function RetentionAlerts({ profile, transactions }) {
  const alerts = useMemo(() => buildAlerts(profile, transactions), [profile, transactions]);

  if (!alerts.length) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {alerts.map((alert, i) => {
          const Icon = alert.icon;
          const style = TONE_STYLES[alert.tone] || TONE_STYLES.blue;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: style.bg, border: `1px solid ${style.border}` }}
            >
              <Icon size={16} style={{ color: style.color }} className="shrink-0" />
              <p className="text-[13px] text-white/80 leading-snug">{alert.text}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
