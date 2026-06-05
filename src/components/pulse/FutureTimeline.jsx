import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle } from 'lucide-react';
import { buildUpcomingExpenses, getUpcomingDates, calculateRunningBalance } from '@/components/pulse/pulseEngine';

export default function FutureTimeline({ profile }) {
  if (!profile) return null;

  const expenses = buildUpcomingExpenses(profile);
  const rawEvents = getUpcomingDates(expenses, profile.buffer || 0, 25, profile.income || 0);
  const eventsWithBalance = calculateRunningBalance(rawEvents, profile.buffer || 0);

  // Map to FutureTimeline format and filter to future events
  const today = new Date();
  const futureEvents = eventsWithBalance
    .filter(e => new Date(e.date) >= today)
    .map(e => ({
      date: e.date instanceof Date ? e.date.toISOString().split('T')[0] : e.date,
      description: e.name,
      amount: e.priority === 'income' ? e.amount : -e.amount,
      balance: e.balanceAfter,
      icon: e.icon,
    }))
    .slice(0, 8);

  if (futureEvents.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        Ingen kommande händelser. Du är i kontroll! 🎉
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {futureEvents.map((event, idx) => {
        const daysUntil = Math.ceil((new Date(event.date) - today) / (1000 * 60 * 60 * 24));
        const isImmediate = daysUntil <= 3;
        const isCritical = event.balance < 0;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-xl p-4 border transition-all ${
              isCritical
                ? 'bg-red-500/10 border-red-500/30'
                : isImmediate
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isCritical ? 'bg-red-500/20' : isImmediate ? 'bg-amber-500/20' : 'bg-white/10'
                }`}>
                  {event.icon ? (
                    <span className="text-lg">{event.icon}</span>
                  ) : (
                    <Calendar className={`w-5 h-5 ${isCritical ? 'text-red-400' : isImmediate ? 'text-amber-400' : 'text-slate-400'}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white">{event.description}</p>
                    {isImmediate && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="text-amber-400 text-lg"
                      >
                        ⚡
                      </motion.span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {daysUntil === 0 ? 'Idag' : daysUntil === 1 ? 'Imorgon' : `Om ${daysUntil} dagar`} · {event.date}
                  </p>
                </div>
              </div>

              {/* Amount & Balance */}
              <div className="text-right">
                <p className={`font-bold ${event.amount < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  {event.amount < 0 ? '-' : '+'}{Math.abs(event.amount).toLocaleString('sv-SE')} kr
                </p>
                <p className={`text-xs ${isCritical ? 'text-red-300' : 'text-slate-400'}`}>
                  Saldo: {event.balance.toLocaleString('sv-SE')} kr
                </p>
              </div>
            </div>

            {/* Critical warning */}
            {isCritical && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 text-xs text-red-300"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Saldo går negativt. Kontrollera din budget!</span>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}