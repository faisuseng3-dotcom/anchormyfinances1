import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield } from 'lucide-react';
import { formatNumber } from './pulseEngine';

export default function DangerZoneList({ events }) {
  const criticalEvts = events.filter(e => e.priority === 'critical');
  const lifestyleEvts = events.filter(e => e.priority === 'lifestyle');

  const Section = ({ title, items, icon: Icon, color, emptyMsg }) => (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-600 pl-5">{emptyMsg}</p>
      ) : (
        <div className="space-y-2">
          {items.map((ev, i) => {
            const danger = ev.balanceAfter < 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
                  danger
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : 'bg-white/4 border-white/8'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{ev.icon}</span>
                  <div>
                    <p className={`text-sm font-semibold ${danger ? 'text-rose-200' : 'text-white'}`}>{ev.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {ev.dayOffset === 0 ? 'Idag' : `Om ${ev.dayOffset} dag${ev.dayOffset !== 1 ? 'ar' : ''}`} · dag {ev.date?.getDate()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${danger ? 'text-rose-300' : 'text-white'}`}>
                    -{formatNumber(ev.amount)} kr
                  </p>
                  <p className={`text-[10px] ${ev.balanceAfter >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    → {formatNumber(ev.balanceAfter)} kr
                  </p>
                  {danger && <span className="text-[9px] text-rose-400 font-bold">⚠ DANGER ZONE</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl p-4 border border-white/8 space-y-4" style={{ background: 'rgba(31,41,55,0.6)' }}>
      <h3 className="text-sm font-bold text-white mb-1">Prioriteringslager</h3>
      <Section
        title="Kritiska utgifter"
        items={criticalEvts}
        icon={AlertTriangle}
        color="text-rose-400"
        emptyMsg="Inga kritiska utgifter"
      />
      <div className="border-t border-white/8" />
      <Section
        title="Livsstil & Abonnemang"
        items={lifestyleEvts}
        icon={Shield}
        color="text-indigo-400"
        emptyMsg="Inga abonnemang registrerade"
      />
    </div>
  );
}