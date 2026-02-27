import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingCart, Coffee, Car, Film, Heart, Zap, Wifi, Package } from 'lucide-react';

export const categoryConfig = {
  food:          { label: 'Mat & Dryck',   icon: Coffee,       color: '#F97316', bg: 'bg-orange-500/10',  text: 'text-orange-400' },
  shopping:      { label: 'Shopping',      icon: ShoppingCart, color: '#A855F7', bg: 'bg-purple-500/10',  text: 'text-purple-400' },
  transport:     { label: 'Fordon',        icon: Car,          color: '#3B82F6', bg: 'bg-blue-500/10',    text: 'text-blue-400' },
  entertainment: { label: 'Streaming',     icon: Film,         color: '#EC4899', bg: 'bg-pink-500/10',    text: 'text-pink-400' },
  health:        { label: 'Hälsa/Fritid',  icon: Heart,        color: '#10B981', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  utilities:     { label: 'Boende & El',   icon: Zap,          color: '#F59E0B', bg: 'bg-amber-500/10',   text: 'text-amber-400' },
  other:         { label: 'Telekom',       icon: Wifi,         color: '#6366F1', bg: 'bg-indigo-500/10',  text: 'text-indigo-400' },
};

const fmt = (v) => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0];
    return (
      <div className="px-3 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'rgba(10,14,26,0.95)', border: '1px solid rgba(255,255,255,0.12)' }}>
        {d.name}: {fmt(d.value)} kr
      </div>
    );
  }
  return null;
};

export default function SpendingDonut({ categoryTotals, totalSpent, onCategoryClick }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!totalSpent || totalSpent === 0) return null;

  const data = Object.entries(categoryTotals)
    .filter(([, v]) => v > 0)
    .map(([id, value]) => ({
      id,
      name: categoryConfig[id]?.label || id,
      value,
      color: categoryConfig[id]?.color || '#6B7280'
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <p className="text-sm font-semibold text-white mb-4">Fördelning per kategori <span className="text-xs text-slate-500 font-normal ml-1">(fasta + rörliga)</span></p>
      <div className="flex items-center gap-4">
        {/* Donut with center text */}
        <div className="flex-shrink-0 relative" style={{ width: 150, height: 150 }}>
          <ResponsiveContainer width={150} height={150}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={68}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={(_, i) => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(entry) => onCategoryClick && onCategoryClick(entry.id)}
                animationBegin={0}
                animationDuration={1000}
                style={{ cursor: 'pointer' }}
              >
                {data.map((entry, i) => (
                  <Cell
                    key={entry.id}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === i ? 1 : 0.35}
                    style={{ transition: 'opacity 0.2s', filter: activeIndex === i ? `drop-shadow(0 0 6px ${entry.color}80)` : 'none' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] text-slate-500 leading-tight">Totalt</span>
            <span className="text-sm font-bold text-white leading-tight">{fmt(totalSpent)}</span>
            <span className="text-[10px] text-slate-500">kr</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 min-w-0">
          {data.map((d, i) => {
            const cfg = categoryConfig[d.id];
            const Icon = cfg?.icon || Package;
            const pct = Math.round((d.value / totalSpent) * 100);
            const isActive = activeIndex === i;
            return (
              <motion.button
                key={d.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.2 }}
                className="w-full flex items-center gap-2 rounded-lg px-1 py-0.5 hover:bg-white/5 transition-colors text-left"
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => onCategoryClick && onCategoryClick(d.id)}
              >
                <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full" style={{ background: d.color, opacity: isActive ? 1 : 0.8 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{d.name}</p>
                </div>
                <div className="text-right flex-shrink-0 flex items-baseline gap-1">
                  <p className="text-xs font-bold text-white">{fmt(d.value)}</p>
                  <p className="text-[10px] text-slate-500">{pct}%</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
      <p className="text-[10px] text-slate-600 mt-3 text-center">Klicka på en sektor eller rad för att öppna optimeringsanalys</p>
    </motion.div>
  );
}