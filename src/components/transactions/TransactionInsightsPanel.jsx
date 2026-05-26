import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { GlassSection } from '@/components/layout/PageShell';
import SavingsBudgetConflictAlert from '@/components/insights/SavingsBudgetConflictAlert';

const CATEGORY_LABELS = {
  food: 'Mat', transport: 'Transport', entertainment: 'Nöje',
  travel: 'Resa', health: 'Hälsa', home: 'Bostad',
  shopping: 'Shopping', other: 'Övrigt', income: 'Inkomst', savings: 'Sparande'
};

const CATEGORY_COLORS = [
  '#0D7377', '#4B7CF3', '#C8923A', '#7C6CF3',
  '#3DAABB', '#E05B7A', '#5CB85C', '#8B97A8'
];

function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key) {
  const [year, month] = key.split('-');
  const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return d.toLocaleDateString('sv-SE', { month: 'short', year: '2-digit' });
}

function isExpense(tx) {
  return ['expense', 'shopping'].includes(tx.type) || (tx.amount < 0 && tx.type !== 'income');
}

function isIncome(tx) {
  return tx.type === 'income' || (tx.amount > 0 && tx.category === 'income');
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-sm shadow-xl anchor-glass-card-sm text-white">
      <p className="font-bold">{payload[0].name}</p>
      <p>{payload[0].value?.toLocaleString('sv-SE')} kr</p>
    </div>
  );
}

export default function TransactionInsightsPanel({ transactions = [], isLoading, profile }) {
  const pieData = useMemo(() => {
    const now = new Date();
    const monthTxs = transactions.filter(tx => {
      const d = new Date(tx.created_date);
      return isExpense(tx) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const map = {};
    monthTxs.forEach(tx => {
      const cat = tx.category || 'other';
      map[cat] = (map[cat] || 0) + Math.abs(tx.amount);
    });
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: CATEGORY_LABELS[k] || k, value: Math.round(v), key: k }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const barData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return months.map(key => {
      const monthTxs = transactions.filter(tx => getMonthKey(tx.created_date) === key);
      const income = monthTxs.filter(isIncome).reduce((s, t) => s + t.amount, 0);
      const expenses = monthTxs.filter(isExpense).reduce((s, t) => s + Math.abs(t.amount), 0);
      return { month: getMonthLabel(key), Inkomst: Math.round(income), Utgifter: Math.round(expenses) };
    });
  }, [transactions]);

  const topCategory = pieData[0];
  const totalExpenses = pieData.reduce((s, d) => s + d.value, 0);

  if (isLoading) {
    return (
      <div className="space-y-3 mt-2">
        {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl skeleton" />)}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="anchor-glass-card flex flex-col items-center text-center py-12 px-6 mt-2">
        <TrendingUp className="w-12 h-12 mb-4 text-white/40" />
        <p className="font-bold text-lg mb-1 text-white">Ingen data än</p>
        <p className="text-sm text-white/45 mb-6">Importera transaktioner för att se kategorier och trender.</p>
        <Link to="/Import">
          <button type="button" className="anchor-btn-primary px-6 py-3 text-sm font-bold">
            Importera bank-data
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-2">
      <SavingsBudgetConflictAlert profile={profile} />

      <GlassSection title="Denna månad" subtitle="Utgiftsfördelning">
        {pieData.length === 0 ? (
          <p className="text-center text-sm py-8 text-white/45">Inga utgifter registrerade denna månad.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="text-center -mt-2 mb-4">
              <p className="text-2xl font-black text-white">{totalExpenses.toLocaleString('sv-SE')} kr</p>
              <p className="text-xs text-white/45">totalt ut denna månad</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {pieData.slice(0, 6).map((d, i) => (
                <div key={d.key} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                  <p className="text-xs truncate text-white/70">{d.name}</p>
                  <p className="text-xs font-bold ml-auto flex-shrink-0 text-white">{d.value.toLocaleString('sv-SE')}</p>
                </div>
              ))}
            </div>

            {topCategory && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20"
              >
                <p className="text-xs font-semibold text-emerald-200">
                  Din största utgiftskategori är <strong>{topCategory.name}</strong> — {topCategory.value.toLocaleString('sv-SE')} kr ({Math.round((topCategory.value / totalExpenses) * 100)}% av totalt)
                </p>
              </motion.div>
            )}
          </>
        )}
      </GlassSection>

      <GlassSection title="Senaste 6 månaderna" subtitle="Inkomst vs utgifter">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} barSize={14} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.45)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.45)' }} axisLine={false} tickLine={false}
              tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', paddingTop: 8 }} />
            <Bar dataKey="Inkomst" fill="#0D7377" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Utgifter" fill="#E05B7A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {barData.slice(-1)[0] && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-400/20"
          >
            <p className="text-xs font-semibold text-blue-200">
              {barData.slice(-1)[0].Inkomst > barData.slice(-1)[0].Utgifter
                ? `Denna månad sparar du ${(barData.slice(-1)[0].Inkomst - barData.slice(-1)[0].Utgifter).toLocaleString('sv-SE')} kr netto.`
                : `Denna månad spenderar du ${(barData.slice(-1)[0].Utgifter - barData.slice(-1)[0].Inkomst).toLocaleString('sv-SE')} kr mer än du tjänar.`}
            </p>
          </motion.div>
        )}
      </GlassSection>
    </div>
  );
}
