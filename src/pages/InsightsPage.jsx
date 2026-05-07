import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SavingsBudgetConflictAlert from '@/components/insights/SavingsBudgetConflictAlert';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { motion } from 'framer-motion';

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
  const d = new Date(parseInt(year), parseInt(month) - 1, 1);
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
    <div className="rounded-xl px-3 py-2 text-sm shadow-xl" style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.08)', color: 'var(--color-text-primary)' }}>
      <p className="font-bold">{payload[0].name}</p>
      <p>{payload[0].value?.toLocaleString('sv-SE')} kr</p>
    </div>
  );
}

export default function InsightsPage() {
  const navigate = useNavigate();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', 'PERSONAL', 'insights'],
    queryFn: async () => {
      const all = await base44.entities.Transaction.list('-created_date', 1000);
      return (all || []).filter(t => t.context !== 'BUSINESS');
    }
  });

  // Pie: current month expenses by category
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
      .map(([k, v]) => ({ name: CATEGORY_LABELS[k] || k, value: Math.round(v) }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Bar: income vs expenses last 6 months
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

  // Top category this month
  const topCategory = pieData[0];
  const totalExpenses = pieData.reduce((s, d) => s + d.value, 0);

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--color-background-primary)' }}>
      <div className="px-5 pt-8 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Tillbaka</span>
        </button>
        <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>Analys</p>
        <h1 className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>Ekonomiska insikter</h1>
      </div>

      <SavingsBudgetConflictAlert profile={profile} />

      {isLoading ? (
        <div className="space-y-3 px-5 mt-2">
          {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl skeleton" />)}
        </div>
      ) : transactions.length === 0 ? (
        <div className="mx-5 mt-8 rounded-2xl p-10 flex flex-col items-center text-center"
          style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <TrendingUp className="w-12 h-12 mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <p className="font-bold text-lg mb-1" style={{ color: 'var(--color-text-primary)' }}>Ingen data än</p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Importera transaktioner via CSV för att se dina utgiftsinsikter.</p>
        </div>
      ) : (
        <div className="px-5 space-y-4">

          {/* Pie chart — this month spending */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-2xl p-5" style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Denna månad</p>
            <p className="text-xl font-black mb-4" style={{ color: 'var(--color-text-primary)' }}>Utgiftsfördelning</p>

            {pieData.length === 0 ? (
              <p className="text-center text-sm py-8" style={{ color: 'var(--color-text-muted)' }}>Inga utgifter registrerade denna månad.</p>
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

                {/* Center label */}
                <div className="text-center -mt-2 mb-4">
                  <p className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>{totalExpenses.toLocaleString('sv-SE')} kr</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>totalt ut denna månad</p>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-2">
                  {pieData.slice(0, 6).map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{d.name}</p>
                      <p className="text-xs font-bold ml-auto flex-shrink-0" style={{ color: 'var(--color-text-primary)' }}>{d.value.toLocaleString('sv-SE')}</p>
                    </div>
                  ))}
                </div>

                {topCategory && (
                  <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(13,115,119,0.08)', border: '1px solid rgba(13,115,119,0.15)' }}>
                    <p className="text-xs font-semibold" style={{ color: '#0D7377' }}>
                      📊 Din största utgiftskategori är <strong>{topCategory.name}</strong> — {topCategory.value.toLocaleString('sv-SE')} kr ({Math.round((topCategory.value / totalExpenses) * 100)}% av totalt)
                    </p>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Bar chart — income vs expenses 6 months */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="rounded-2xl p-5" style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Senaste 6 månaderna</p>
            <p className="text-xl font-black mb-5" style={{ color: 'var(--color-text-primary)' }}>Inkomst vs Utgifter</p>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={14} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-secondary)', paddingTop: 8 }} />
                <Bar dataKey="Inkomst" fill="#0D7377" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Utgifter" fill="#E05B7A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Net per month insight */}
            {barData.slice(-1)[0] && (
              <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(75,124,243,0.08)', border: '1px solid rgba(75,124,243,0.15)' }}>
                <p className="text-xs font-semibold" style={{ color: '#4B7CF3' }}>
                  {barData.slice(-1)[0].Inkomst > barData.slice(-1)[0].Utgifter
                    ? `✅ Denna månad sparar du ${(barData.slice(-1)[0].Inkomst - barData.slice(-1)[0].Utgifter).toLocaleString('sv-SE')} kr netto.`
                    : `⚠️ Denna månad spenderar du ${(barData.slice(-1)[0].Utgifter - barData.slice(-1)[0].Inkomst).toLocaleString('sv-SE')} kr mer än du tjänar.`}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}