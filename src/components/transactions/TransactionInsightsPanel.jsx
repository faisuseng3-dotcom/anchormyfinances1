// @ts-nocheck
import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { GlassSection } from '@/components/layout/PageShell';
import { copilotPrimaryBtnClass } from '@/lib/copilotTheme';
import SavingsBudgetConflictAlert from '@/components/insights/SavingsBudgetConflictAlert';
import LeakageDetector from '@/components/dashboard/LeakageDetector';

const CATEGORY_LABELS = {
  food: 'Mat', transport: 'Transport', entertainment: 'Nöje',
  travel: 'Resa', health: 'Hälsa', home: 'Bostad',
  shopping: 'Shopping', other: 'Övrigt', income: 'Inkomst', savings: 'Sparande'
};

const CATEGORY_COLORS = [
  '#4fae82', '#4fae82', 'rgba(255,255,255,0.75)', '#4fae82',
  '#4fae82', 'rgba(255,255,255,0.75)', '#34d9be', 'rgba(255,255,255,0.55)'
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
    <div className="rounded-xl px-3 py-2 text-sm bg-[var(--copilot-bg-deep)] text-white shadow-xl organic-surface">
      <p className="font-semibold">{payload[0].name}</p>
      <p className="tabular-nums">{payload[0].value?.toLocaleString('sv-SE')} kr</p>
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
  const lastMonth = barData.slice(-1)[0];
  const netPositive = lastMonth && lastMonth.Inkomst >= lastMonth.Utgifter;

  if (isLoading) {
    return (
      <div className="space-y-6 mt-2">
        {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-2xl skeleton" />)}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-16 text-center">
        <TrendingUp className="w-10 h-10 mx-auto mb-4 text-[var(--copilot-text-muted)]" />
        <p className="text-[17px] font-semibold text-white mb-1">Din ekonomi väntar på data</p>
        <p className="text-[14px] text-[var(--copilot-text-secondary)]">Importera transaktioner för kategorier och trender.</p>
        <Link to="/Import" className={`inline-flex mt-6 px-6 no-underline ${copilotPrimaryBtnClass}`}>
          Importera bank-data
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-2">
      <LeakageDetector profile={profile} transactions={transactions} variant="full" nested className="!px-0" />
      <SavingsBudgetConflictAlert profile={profile} />

      <GlassSection title="Denna månad" subtitle="Vart pengarna tar vägen">
        {pieData.length === 0 ? (
          <p className="text-[14px] text-[var(--copilot-text-secondary)] py-6 text-center">Inga utgifter registrerade än denna månad.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={82}
                  paddingAngle={2} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <p className="text-center text-[28px] font-semibold text-white tabular-nums -mt-1">
              {totalExpenses.toLocaleString('sv-SE')} kr
            </p>
            <p className="text-center text-[13px] text-[var(--copilot-text-muted)] mb-4">investerat i din vardag</p>

            <div className="space-y-2">
              {pieData.slice(0, 6).map((d, i) => (
                <div key={d.key} className="flex items-center gap-2 py-1">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                  <p className="text-[14px] text-[var(--copilot-text-secondary)] flex-1 truncate">{d.name}</p>
                  <p className="text-[14px] font-medium tabular-nums text-white">{d.value.toLocaleString('sv-SE')}</p>
                </div>
              ))}
            </div>

            {topCategory && (
              <p className="text-[14px] text-[var(--copilot-accent-green)] mt-4 leading-relaxed">
                Störst fokus: <strong className="text-white">{topCategory.name}</strong> — {topCategory.value.toLocaleString('sv-SE')} kr ({Math.round((topCategory.value / totalExpenses) * 100)}%)
              </p>
            )}
          </>
        )}
      </GlassSection>

      <GlassSection title="Senaste 6 månaderna" subtitle="Inkomst och utgifter i balans">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} barSize={12} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--copilot-text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--copilot-text-muted)' }} axisLine={false} tickLine={false}
              tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--copilot-text-secondary)', paddingTop: 8 }} />
            <Bar dataKey="Inkomst" fill="#4fae82" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Utgifter" fill="#4fae82" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {lastMonth && (
          <p className="text-[14px] text-[var(--copilot-text-secondary)] mt-4 leading-relaxed">
            {netPositive
              ? `Denna månad: ${(lastMonth.Inkomst - lastMonth.Utgifter).toLocaleString('sv-SE')} kr kvar att planera med.`
              : `Denna månad: ${(lastMonth.Utgifter - lastMonth.Inkomst).toLocaleString('sv-SE')} kr över inkomst — justera nästa steg.`}
          </p>
        )}
      </GlassSection>
    </div>
  );
}
