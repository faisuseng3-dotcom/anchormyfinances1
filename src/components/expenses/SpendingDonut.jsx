import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingCart, Coffee, Car, Film, Heart, Zap, Package } from 'lucide-react';

const categoryConfig = {
  food:          { label: 'Mat & Dryck',  icon: Coffee,       color: '#F97316', bg: 'bg-orange-500/10',  text: 'text-orange-400' },
  shopping:      { label: 'Shopping',     icon: ShoppingCart, color: '#A855F7', bg: 'bg-purple-500/10',  text: 'text-purple-400' },
  transport:     { label: 'Transport',    icon: Car,          color: '#3B82F6', bg: 'bg-blue-500/10',    text: 'text-blue-400' },
  entertainment: { label: 'Nöje',         icon: Film,         color: '#EC4899', bg: 'bg-pink-500/10',    text: 'text-pink-400' },
  health:        { label: 'Hälsa',        icon: Heart,        color: '#10B981', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  utilities:     { label: 'Räkningar',    icon: Zap,          color: '#F59E0B', bg: 'bg-amber-500/10',   text: 'text-amber-400' },
  other:         { label: 'Övrigt',       icon: Package,      color: '#6B7280', bg: 'bg-slate-500/10',   text: 'text-slate-400' },
};

export { categoryConfig };

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0];
    return (
      <div className="px-3 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {d.name}: {d.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} kr
      </div>
    );
  }
  return null;
};

export default function SpendingDonut({ categoryTotals, totalSpent }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (totalSpent === 0) return null;

  const data = Object.entries(categoryTotals)
    .filter(([, v]) => v > 0)
    .map(([id, value]) => ({
      id,
      name: categoryConfig[id]?.label || id,
      value,
      color: categoryConfig[id]?.color || '#6B7280'
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <p className="text-sm font-semibold text-white mb-4">Fördelning per kategori</p>
      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="flex-shrink-0">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={(_, i) => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                animationBegin={0}
                animationDuration={1200}
              >
                {data.map((entry, i) => (
                  <Cell
                    key={entry.id}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === i ? 1 : 0.4}
                    style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 min-w-0">
          {data.slice(0, 5).map((d, i) => {
            const cfg = categoryConfig[d.id];
            const Icon = cfg?.icon || Package;
            const pct = Math.round((d.value / totalSpent) * 100);
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.2 }}
                className="flex items-center gap-2"
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className={`w-7 h-7 rounded-lg ${cfg?.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${cfg?.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{d.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-white">{d.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} kr</p>
                  <p className="text-[10px] text-slate-500">{pct}%</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}