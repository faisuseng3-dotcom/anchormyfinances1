import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { formatNumber } from './pulseEngine';
import { EventCategoryIcon } from '@/lib/anchorIcons';
import { Zap } from 'lucide-react';

const PRIORITY_COLOR = {
  critical: 'bg-rose-500 border-rose-400 shadow-rose-500/40',
  lifestyle: 'bg-indigo-500 border-indigo-400 shadow-indigo-500/30',
  income: 'bg-emerald-500 border-emerald-400 shadow-emerald-500/30',
};

const PRIORITY_DOT = {
  critical: 'bg-rose-400',
  lifestyle: 'bg-indigo-400',
  income: 'bg-emerald-400',
};

export default function PulseTimeline({ events, today, whatIfAmount }) {
  const scrollRef = useRef(null);

  // Build 35-day grid
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const eventsByOffset = {};
  events.forEach(e => {
    const k = e.dayOffset;
    if (!eventsByOffset[k]) eventsByOffset[k] = [];
    eventsByOffset[k].push(e);
  });

  const dayNames = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nästa 35 dagar</h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" />Kritisk</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400" />Livsstil</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Inkomst</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="flex gap-2 min-w-max pr-4">
          {days.map((d, i) => {
            const isToday = i === 0;
            const dayEvs = eventsByOffset[i] || [];
            const hasCritical = dayEvs.some(e => e.priority === 'critical');
            const hasIncome = dayEvs.some(e => e.priority === 'income');
            const dangerDay = dayEvs.some(e => e.balanceAfter < 0);

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.01 }}
                className={`flex-shrink-0 flex flex-col items-center rounded-2xl w-14 pt-2 pb-3 relative transition-all ${
                  isToday
                    ? 'bg-indigo-500/20 border border-indigo-400/50 shadow-lg shadow-indigo-500/20'
                    : dangerDay
                    ? 'bg-rose-500/10 border border-rose-500/30'
                    : hasCritical
                    ? 'bg-rose-500/5 border border-rose-500/15'
                    : hasIncome
                    ? 'bg-emerald-500/5 border border-emerald-500/15'
                    : 'bg-white/4 border border-white/8'
                }`}
              >
                {/* Danger glow */}
                {dangerDay && (
                  <motion.div
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-2xl bg-rose-500/20 pointer-events-none"
                  />
                )}

                <span className="text-[9px] text-slate-500">{dayNames[d.getDay()]}</span>
                <span className={`text-sm font-bold mt-0.5 ${isToday ? 'text-indigo-300' : dangerDay ? 'text-rose-300' : 'text-white'}`}>
                  {d.getDate()}
                </span>
                {i === 0 || d.getDate() === 1 ? (
                  <span className="text-[8px] text-slate-600">{monthNames[d.getMonth()]}</span>
                ) : <span className="text-[8px] opacity-0">.</span>}

                {/* Event bubbles */}
                <div className="mt-2 flex flex-col items-center gap-1">
                  {dayEvs.map((ev, ei) => (
                    <motion.div
                      key={ei}
                      whileHover={{ scale: 1.3 }}
                      title={`${ev.name}: ${formatNumber(ev.amount)} kr`}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm border shadow-md cursor-pointer ${PRIORITY_COLOR[ev.priority] || 'bg-slate-600 border-slate-500'}`}
                    >
                      <EventCategoryIcon event={ev} size={14} className="text-white" />
                    </motion.div>
                  ))}
                </div>

                {/* Today marker */}
                {isToday && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-indigo-400 rounded-full" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* What-if overlay hint */}
      {whatIfAmount > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
          <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" aria-hidden />
          <span>What-if aktiv: -{formatNumber(whatIfAmount)} kr påverkar tidslinjen</span>
        </div>
      )}
    </div>
  );
}