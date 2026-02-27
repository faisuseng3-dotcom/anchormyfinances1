import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Package } from 'lucide-react';
import { categoryConfig } from './SpendingDonut';

const formatNumber = (v) => v ? v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';

function getGroup(dateStr) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const d = new Date(dateStr);
  d.setHours(0,0,0,0);
  const diff = Math.round((today - d) / (1000*60*60*24));
  if (diff === 0) return 'Idag';
  if (diff === 1) return 'Igår';
  if (diff < 7) return 'Denna vecka';
  return 'Äldre';
}

const GROUP_ORDER = ['Idag', 'Igår', 'Denna vecka', 'Äldre'];

export default function TransactionList({ expenses }) {
  if (expenses.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Inga utgifter registrerade</p>
      </div>
    );
  }

  // Sort newest first, then group
  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  const groups = {};
  sorted.forEach(exp => {
    const g = getGroup(exp.date);
    if (!groups[g]) groups[g] = [];
    groups[g].push(exp);
  });

  let rowIndex = 0;

  return (
    <div className="space-y-6">
      {GROUP_ORDER.filter(g => groups[g]).map((group) => (
        <div key={group}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{group}</p>
          <div className="space-y-2">
            {groups[group].map((expense, i) => {
              const cfg = categoryConfig[expense.category];
              const Icon = cfg?.icon || Package;
              const idx = rowIndex++;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-4 p-4 rounded-2xl group cursor-pointer hover:bg-white/5 transition-colors"
                  style={{ background: 'rgba(17,24,39,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg?.bg || 'bg-slate-500/10'}`}
                    style={{ boxShadow: `0 0 20px ${cfg?.color || '#6B7280'}20` }}
                  >
                    <Icon className={`w-5 h-5 ${cfg?.text || 'text-slate-400'}`} />
                  </div>

                  {/* Name + date */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{expense.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{cfg?.label || 'Övrigt'} · {expense.date}</p>
                  </div>

                  {/* Amount + arrow */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-rose-400 text-sm">-{formatNumber(expense.amount)} kr</span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}