import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isToday, isYesterday, subDays } from 'date-fns';
import { sv } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { ArrowUpCircle, ArrowDownCircle, CalendarDays } from 'lucide-react';

export default function HistoryFeed() {
  const today = new Date();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  const { data: incomeEvents = [] } = useQuery({
    queryKey: ['incomeEvents'],
    queryFn: () => base44.entities.IncomeEvents.list('-date', 50),
    enabled: !!profile,
  });

  const events = useMemo(() => {
    if (!profile) return [];
    const thirtyDaysAgo = subDays(today, 30);
    const list = [];

    // Expenses from profile
    (profile.monthlyExpenses || []).forEach((e, i) => {
      const d = new Date(e.date);
      if (d >= thirtyDaysAgo) {
        list.push({ id: `exp-${i}`, type: 'expense', date: d, label: e.name, amount: -e.amount });
      }
    });

    // Real income events
    incomeEvents.forEach(inc => {
      const d = new Date(inc.date);
      if (d >= thirtyDaysAgo) {
        list.push({ id: `inc-${inc.id}`, type: 'income', date: d, label: inc.description || 'Lön insatt', amount: inc.amount });
      }
    });

    // Simulate salary on 25th if no income event exists for current month
    const hasCurrentMonthIncome = incomeEvents.some(inc => {
      const d = new Date(inc.date);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });

    if (!hasCurrentMonthIncome && profile.income > 0) {
      let salaryDate = new Date(today.getFullYear(), today.getMonth(), 25);
      if (today.getDate() < 25) {
        salaryDate = new Date(today.getFullYear(), today.getMonth() - 1, 25);
      }
      if (salaryDate >= thirtyDaysAgo) {
        list.push({ id: 'simulated-salary', type: 'income', date: salaryDate, label: 'Lön insatt 🎉', amount: profile.income, simulated: true });
      }
    }

    // Sort newest first
    return list.sort((a, b) => b.date - a.date);
  }, [profile, incomeEvents]);

  // Group by date label
  const grouped = useMemo(() => {
    const groups = {};
    events.forEach(e => {
      let key;
      if (isToday(e.date)) key = 'Idag';
      else if (isYesterday(e.date)) key = 'Igår';
      else key = format(e.date, 'EEEE d MMMM', { locale: sv });

      if (!groups[key]) groups[key] = { key, items: [] };
      groups[key].items.push(e);
    });
    return Object.values(groups);
  }, [events]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-slate-400">Laddar...</div>;
  }

  return (
    <div className="min-h-screen px-5 pt-10 pb-24">
      <motion.h1
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-8"
      >
        Historik
      </motion.h1>

      {grouped.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-24 text-slate-500 gap-4">
          <CalendarDays size={48} />
          <p className="text-center">Inga händelser de senaste 30 dagarna.</p>
        </div>
      )}

      <div className="space-y-6">
        {grouped.map(group => (
          <div key={group.key}>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
              {group.key}
            </h2>
            <div className="space-y-2">
              {group.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === 'income' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                    {item.type === 'income'
                      ? <ArrowUpCircle size={18} className="text-emerald-400" />
                      : <ArrowDownCircle size={18} className="text-rose-400" />
                    }
                  </div>
                  <p className="flex-1 text-sm text-white font-medium">{item.label}</p>
                  <p className={`text-sm font-bold ${item.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString('sv-SE')} kr
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}