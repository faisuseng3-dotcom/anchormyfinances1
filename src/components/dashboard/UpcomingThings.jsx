// @ts-nocheck
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Bell, AlertTriangle } from 'lucide-react';
import { getNextWeekFixedExpenses } from '@/lib/proactiveAlerts';
import { buildUpcomingExpenses } from '@/components/pulse/pulseEngine';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function buildUpcoming(profile) {
  if (!profile?.income) return [];

  const items = [];
  const today = new Date();
  const day = today.getDate();

  (profile.subscriptions || []).forEach((sub) => {
    const due = sub.billingDay || sub.dueDay || sub.day;
    if (!due) return;
    let diff = due - day;
    if (diff < 0) diff += 30;
    if (diff <= 7) {
      items.push({
        id: `sub-${sub.name}`,
        icon: Bell,
        text: `${sub.name} · ${fmt(sub.amount)} kr`,
        sub: diff === 0 ? 'Idag' : diff === 1 ? 'Imorgon' : `Om ${diff} dagar`,
      });
    }
  });

  const week = getNextWeekFixedExpenses(profile, 7);
  if (week?.items?.length) {
    week.items.slice(0, 2).forEach((exp) => {
      items.push({
        id: `exp-${exp.name}-${exp.dayOffset}`,
        icon: Calendar,
        text: `${exp.name} · ${fmt(exp.amount)} kr`,
        sub: exp.dayLabel,
      });
    });
  }

  const expenses = buildUpcomingExpenses(profile);
  const housingDue = profile.housingCost > 0 && expenses.find((e) => /boende|hyra/i.test(e.name || ''));
  if (housingDue && items.length < 4) {
    const due = housingDue.dueDay;
    const diff = due - day;
    if (diff >= 0 && diff <= 10) {
      items.push({
        id: 'housing',
        icon: AlertTriangle,
        text: `Boende · ${fmt(profile.housingCost)} kr`,
        sub: diff === 0 ? 'Idag' : `Den ${due}:e`,
      });
    }
  }

  return items.slice(0, 4);
}

export default function UpcomingThings({ profile }) {
  const items = useMemo(() => buildUpcoming(profile), [profile]);

  if (!items.length) return null;

  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="px-4 pt-4 pb-2">
        <h2 className="anchor-card-title">Kommande betalningar</h2>
      </div>
      <div className="divide-y divide-white/[0.05]">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-4 py-3"
            >
              <Icon size={15} className="text-white/35 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-white/80">{item.text}</p>
              </div>
              <span className="text-[12px] text-white/35 shrink-0">{item.sub}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
