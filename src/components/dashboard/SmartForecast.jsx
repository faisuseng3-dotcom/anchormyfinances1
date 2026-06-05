import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import { TrendingUp, Target, Calendar } from 'lucide-react';

const YEAR_OPTIONS = [1, 3, 5, 10];

/** Månadsfaktor för säsongsvariation (historiskt: dec & jul +25%, feb -10%) */
const SEASONAL_FACTORS = {
  0: 1.0, 1: 0.9, 2: 1.0, 3: 1.0,
  4: 1.0, 5: 1.0, 6: 1.25, 7: 1.1,
  8: 0.95, 9: 1.0, 10: 1.0, 11: 1.3
};

function generateSmartData(startValue, baseSavings, months, startMonth) {
  const data = [];
  let current = startValue;
  for (let m = 0; m <= months; m++) {
    const monthIndex = (startMonth + m) % 12;
    const factor = SEASONAL_FACTORS[monthIndex];
    const adjustedSavings = baseSavings * (2 - factor); // spendera mer = spara mindre
    if (m > 0) current += Math.max(0, adjustedSavings);
    const year = Math.floor(m / 12);
    const label = m % 12 === 0 && m > 0 ? `År ${year}` : '';
    data.push({ month: m, value: Math.round(current), label });
  }
  return data;
}

function calcDaysToGoal(goal, currentBalance, monthlySavings) {
  if (!goal || monthlySavings <= 0) return null;
  const remaining = goal - currentBalance;
  if (remaining <= 0) return 0;
  return Math.ceil((remaining / monthlySavings) * 30);
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl shadow-lg text-xs font-semibold"
      style={{ background: 'var(--color-surface)', border: '1px solid rgba(0,0,0,0.08)', color: 'var(--color-text-primary)' }}>
      {payload[0].value.toLocaleString('sv-SE')} kr
    </div>
  );
};

export default function SmartForecast({ profile, transactions = [] }) {
  const [selectedYears, setSelectedYears] = useState(5);
  const startMonth = new Date().getMonth();

  const totalFixedCosts = getTotalFixedCosts(profile || {});
  const income = profile?.income || 0;
  const margin = income - totalFixedCosts;

  // Beräkna faktisk genomsnittlig månadsutgift från transaktioner
  const avgActualSpend = useMemo(() => {
    if (!transactions.length) return null;
    const byMonth = {};
    transactions.forEach(t => {
      if (!['expense', 'savings_deposit', 'transfer_to_savings'].includes(t.type)) return;
      const d = new Date(t.created_date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      byMonth[key] = (byMonth[key] || 0) + Math.abs(t.amount);
    });
    const vals = Object.values(byMonth);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  }, [transactions]);

  const monthlySavings = avgActualSpend != null
    ? Math.max(0, income - avgActualSpend)
    : (margin > 0 ? margin * 0.3 : 0);

  const startValue = profile?.buffer || 0;
  const activeMonths = selectedYears * 12;

  const data = useMemo(
    () => generateSmartData(startValue, monthlySavings, activeMonths, startMonth),
    [startValue, monthlySavings, activeMonths, startMonth]
  );

  const finalValue = data[data.length - 1]?.value || 0;
  const goalValue = profile?.savingsGoal || 0;
  const goalBalance = profile?.savingsCurrentBalance || 0;
  const daysToGoal = calcDaysToGoal(goalValue, goalBalance, monthlySavings);

  const isFlat = monthlySavings < 100;
  const goalReachedMonth = goalValue > 0
    ? data.findIndex(d => d.value >= goalValue + startValue)
    : -1;

  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3" style={{ borderBottom: '1px solid #F0F2F5' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(13,115,119,0.1)' }}>
              <TrendingUp className="w-4 h-4" style={{ color: '#0D7377' }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Framtidsblicken</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {avgActualSpend ? 'Baserad på faktisk historik' : 'Baserad på estimerad sparkvot'}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {YEAR_OPTIONS.map(y => (
              <button key={y} onClick={() => setSelectedYears(y)}
                className="w-9 h-9 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: selectedYears === y ? 'var(--color-accent)' : 'rgba(0,0,0,0.05)',
                  color: selectedYears === y ? '#fff' : 'var(--color-text-muted)',
                }}>
                {y}å
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl" style={{ background: '#F4F6F8' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Om {selectedYears} år</p>
            <p className="text-xl font-black" style={{ color: 'var(--color-text-primary)' }}>
              {finalValue.toLocaleString('sv-SE')} <span className="text-sm font-semibold">kr</span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#0D7377' }}>
              +{(finalValue - startValue).toLocaleString('sv-SE')} kr ökning
            </p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: '#F4F6F8' }}>
            {goalValue > 0 && daysToGoal !== null ? (
              <>
                <div className="flex items-center gap-1 mb-1">
                  <Target className="w-3 h-3" style={{ color: '#0D7377' }} />
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {profile.savingsGoalName || 'Sparmål'}
                  </p>
                </div>
                <p className="text-xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                  {daysToGoal === 0 ? 'Klart!' : `${Math.round(daysToGoal / 30)} mån`}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {goalBalance.toLocaleString('sv-SE')} / {goalValue.toLocaleString('sv-SE')} kr
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3" style={{ color: '#0D7377' }} />
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Månatligt sparande</p>
                </div>
                <p className="text-xl font-black" style={{ color: '#0D7377' }}>
                  {monthlySavings.toLocaleString('sv-SE')} <span className="text-sm font-semibold">kr</span>
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>per månad</p>
              </>
            )}
          </div>
        </div>

        {/* Seasonal note */}
        <p className="text-xs mb-3 italic" style={{ color: 'var(--color-text-muted)' }}>
          Prognosen justerar för säsongsvariationer (jul & dec = högre utgifter).
        </p>

        {/* Chart */}
        {!isFlat ? (
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sfFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D7377" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0D7377" stopOpacity={0} />
                </linearGradient>
              </defs>
              {goalValue > 0 && goalReachedMonth >= 0 && (
                <ReferenceLine
                  x={goalReachedMonth}
                  stroke="#0D7377"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: 'Mål', position: 'top', fill: '#0D7377', fontSize: 10 }}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0D7377"
                strokeWidth={2}
                fill="url(#sfFill)"
                dot={false}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
            Fyll i dina uppgifter för att se din ekonomiska bana.
          </p>
        )}
      </div>
    </motion.div>
  );
}