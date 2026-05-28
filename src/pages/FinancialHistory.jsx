import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import PageShell from '@/components/layout/PageShell';
import { DashboardSection, DashboardStatStrip } from '@/components/dashboard/DashboardChrome';
import { sectionSubtitleClass } from '@/lib/anchorTheme';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';

const fmt = (v) => Math.round(v || 0).toLocaleString('sv-SE');

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

function getLast6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: MONTH_NAMES[d.getMonth()],
      year: d.getFullYear(),
      month: d.getMonth(),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    });
  }
  return months;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a2235] px-4 py-3 shadow-xl text-sm">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
          {p.name}: {fmt(p.value)} kr
        </p>
      ))}
    </div>
  );
};

export default function FinancialHistory() {
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  const { data: allTransactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ['transactions_all'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 500),
  });

  const months = getLast6Months();

  // Build per-month data points
  const chartData = useMemo(() => {
    if (!profile) return [];

    const totalFixedMonthly =
      (profile.housingCost || 0) +
      (profile.subscriptions || []).reduce((s, x) => s + x.amount, 0) +
      (profile.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);

    // Group transactions by month key
    const txByMonth = {};
    allTransactions.forEach(tx => {
      const d = new Date(tx.created_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!txByMonth[key]) txByMonth[key] = [];
      txByMonth[key].push(tx);
    });

    // Running simulation: start from estimated buffer 6 months ago
    // We use current buffer as anchor and work backwards via transactions
    let runningBuffer = profile.buffer || 0;

    // Collect monthly deltas going back in time
    const monthlyDeltas = {};
    months.forEach(m => {
      const txs = txByMonth[m.key] || [];
      let delta = 0;
      txs.forEach(tx => {
        if (tx.type === 'income') delta += tx.amount;
        else if (tx.type === 'expense') delta -= Math.abs(tx.amount);
        else if (tx.type === 'transfer_to_savings') delta -= tx.amount;
        else if (tx.type === 'transfer_to_spending') delta += tx.amount;
      });
      monthlyDeltas[m.key] = delta;
    });

    // Build forward from estimated start
    // Estimate starting buffer by subtracting all known deltas
    let estimatedStart = runningBuffer;
    months.forEach(m => {
      estimatedStart -= (monthlyDeltas[m.key] || 0);
    });

    // Total debt per month — assume current debt + monthly payments accumulate backwards
    const totalDebtNow = (profile.loans || []).reduce((s, l) => s + l.totalAmount, 0);
    const totalMonthlyPayments = (profile.loans || []).reduce((s, l) => s + l.monthlyPayment, 0);

    let bufferSim = estimatedStart;
    let debtSim = totalDebtNow + (totalMonthlyPayments * months.length); // rough estimate going back

    return months.map((m, i) => {
      bufferSim += monthlyDeltas[m.key] || 0;
      debtSim = Math.max(0, debtSim - totalMonthlyPayments);

      return {
        label: m.label,
        Buffert: Math.max(0, Math.round(bufferSim)),
        Skuld: Math.round(debtSim),
      };
    });
  }, [profile, allTransactions, months]);

  const latestBuffer = chartData[chartData.length - 1]?.Buffert || 0;
  const earliestBuffer = chartData[0]?.Buffert || 0;
  const latestDebt = chartData[chartData.length - 1]?.Skuld || 0;
  const earliestDebt = chartData[0]?.Skuld || 0;
  const bufferGrowth = latestBuffer - earliestBuffer;
  const debtReduction = earliestDebt - latestDebt;

  const isLoading = loadingProfile || loadingTx;

  return (
    <PageShell
      title="Hur har det gått?"
      subtitle="Senaste 6 månader"
      backHref={createPageUrl('Dashboard')}
    >
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              className="h-24 bg-white/[0.04] rounded-xl"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <DashboardStatStrip
            items={[
              {
                label: 'Buffert 6 mån',
                value: `${bufferGrowth >= 0 ? '+' : ''}${fmt(bufferGrowth)} kr`,
                sub: `Nu ${fmt(latestBuffer)} kr`,
              },
              {
                label: 'Skuld 6 mån',
                value: `${debtReduction >= 0 ? '−' : '+'}${fmt(Math.abs(debtReduction))} kr`,
                sub: `Kvar ${fmt(latestDebt)} kr`,
              },
            ]}
          />

          <DashboardSection nested title="Buffert och skuld">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#9ca3af', paddingTop: '12px' }}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Line
                  type="monotone"
                  dataKey="Buffert"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#10b981' }}
                />
                <Line
                  type="monotone"
                  dataKey="Skuld"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#f59e0b' }}
                  strokeDasharray="5 3"
                />
              </LineChart>
            </ResponsiveContainer>
            </motion.div>
          </DashboardSection>

          <DashboardSection nested title="Buffert över tid" subtitle="Hur din likviditet har förändrats">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="Buffert"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            </motion.div>
          </DashboardSection>

          {latestDebt > 0 && (
            <DashboardSection nested title="Skuld över tid" subtitle="Amortering månad för månad">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="Skuld"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {debtReduction > 0 && (
                <p className={`${sectionSubtitleClass} mt-4`}>
                  Du har minskat skulden med {fmt(debtReduction)} kr på sex månader.
                </p>
              )}
              </motion.div>
            </DashboardSection>
          )}
        </div>
      )}
    </PageShell>
  );
}