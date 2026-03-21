import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

const YEAR_OPTIONS = [1, 2, 3, 4, 5];

function generateData(startValue, monthlySavings, months) {
  const data = [];
  let current = startValue;
  const totalPoints = Math.min(months + 1, 61);
  const step = Math.max(1, Math.floor(months / 12));

  for (let m = 0; m <= months; m += step) {
    if (m > 0) current += monthlySavings * step;
    const date = new Date();
    date.setMonth(date.getMonth() + m);
    const label = m === 0 ? 'Nu' : `${date.toLocaleString('sv-SE', { month: 'short' })} ${date.getFullYear()}`;
    data.push({ label, value: Math.max(0, Math.round(current)), months: m });
  }
  // Ensure last point is exactly the end
  const lastDate = new Date();
  lastDate.setMonth(lastDate.getMonth() + months);
  const lastLabel = `${lastDate.toLocaleString('sv-SE', { month: 'short' })} ${lastDate.getFullYear()}`;
  if (data[data.length - 1].months !== months) {
    current = startValue + monthlySavings * months;
    data.push({ label: lastLabel, value: Math.max(0, Math.round(current)), months });
  }
  return data;
}

export default function ForecastChart({ profile }) {
  const [selectedYears, setSelectedYears] = useState(5);
  const [customDate, setCustomDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateAwarded, setCustomDateAwarded] = useState(false);

  const totalSubscriptions = (profile?.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
  const totalLoanPayments = (profile?.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
  const totalFixedCosts = (profile?.housingCost || 0) + totalSubscriptions + totalLoanPayments;
  const income = profile?.income || 0;
  const margin = income - totalFixedCosts;
  const monthlySavings = income > 0 && margin > 0 ? margin * 0.3 : 0;
  const startValue = profile?.buffer || 0;
  const noData = income === 0;

  // Determine months to show
  const customMonths = useMemo(() => {
    if (!customDate) return null;
    const target = new Date(customDate);
    const now = new Date();
    const months = Math.round((target - now) / (1000 * 60 * 60 * 24 * 30.44));
    return months > 0 ? months : null;
  }, [customDate]);

  const activeMonths = customMonths ?? selectedYears * 12;

  const data = useMemo(
    () => generateData(startValue, monthlySavings, activeMonths),
    [startValue, monthlySavings, activeMonths]
  );

  const finalValue = data[data.length - 1]?.value || 0;
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const yMax = maxValue < 100 ? Math.max(maxValue * 2, 200) : Math.ceil(maxValue * 1.2);
  const yTick = (v) => v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`;

  const isFlat = monthlySavings === 0;
  const isStable = monthlySavings > 0 && startValue > totalFixedCosts;

  const customLabel = useMemo(() => {
    if (!customDate) return null;
    const d = new Date(customDate);
    return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [customDate]);

  const handleCustomDate = async (dateStr) => {
    setCustomDate(dateStr);
    setShowDatePicker(false);
    // Award points first time
    if (!customDateAwarded && dateStr) {
      setCustomDateAwarded(true);
      try {
        const res = await base44.functions.invoke('awardPoints', { event_type: 'whatif_simulation' });
        if (res?.data?.points > 0) {
          toast.success(`+${res.data.points} poäng! 🎯 Eget datum satt`, {
            description: 'Bra att planera framåt!',
            duration: 3000,
            style: { background: 'linear-gradient(135deg, #1e1b4b, #1a2233)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)' }
          });
        }
      } catch {}
    }
  };

  const clearCustomDate = () => {
    setCustomDate('');
    setShowDatePicker(false);
  };

  // Min date for picker = today + 1 month
  const minDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  })();

  // Max date = today + 30 years
  const maxDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 30);
    return d.toISOString().split('T')[0];
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: 'rgba(17, 24, 39, 0.4)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {isStable && !customDate && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-4 right-4 z-10"
        >
          <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-300">Stark stabilitet</span>
          </div>
        </motion.div>
      )}

      {/* Title row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">
            {customDate ? `Prognos till ${customLabel}` : `${selectedYears}-års prognos`}
          </h3>
        </div>

        {/* Calendar picker toggle */}
        <button
          onClick={() => setShowDatePicker(v => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
          style={{
            background: showDatePicker || customDate ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${showDatePicker || customDate ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
            color: customDate ? '#a5b4fc' : '#94a3b8'
          }}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{customDate ? customLabel : 'Välj datum'}</span>
          {customDate && (
            <span
              onClick={(e) => { e.stopPropagation(); clearCustomDate(); }}
              className="ml-1 hover:text-white"
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </button>
      </div>

      {/* Date picker dropdown */}
      <AnimatePresence>
        {showDatePicker && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 p-3 rounded-xl"
            style={{ background: 'rgba(30,27,75,0.8)', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            <p className="text-xs text-indigo-300 mb-2 font-medium">Välj ett framtida datum</p>
            <input
              type="date"
              min={minDate}
              max={maxDate}
              value={customDate}
              onChange={(e) => handleCustomDate(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(99,102,241,0.4)', colorScheme: 'dark' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Year tabs – only show when no custom date */}
      {!customDate && (
        <div className="flex gap-1.5 mb-4">
          {YEAR_OPTIONS.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYears(y)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: selectedYears === y ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${selectedYears === y ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`,
                color: selectedYears === y ? '#a5b4fc' : '#64748b',
              }}
            >
              {y}Y
            </button>
          ))}
        </div>
      )}

      {noData ? (
        <div className="flex flex-col items-center justify-center h-[140px] text-center gap-2">
          <p className="text-slate-400 text-sm">Lägg till din inkomst för att se din framtida potential.</p>
        </div>
      ) : (
        <>
          {/* Hero value */}
          {!isFlat && (
            <motion.div
              key={finalValue}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 text-center"
            >
              <p className="text-xs text-slate-400 mb-0.5">
                {customDate ? `På ${customLabel}` : `Om ${selectedYears} år`}
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {formatNumber(finalValue)} kr
              </p>
            </motion.div>
          )}

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} key={activeMonths}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={isFlat ? 0.15 : 0.4}/>
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="label"
                stroke="rgba(148,163,184,0.5)"
                style={{ fontSize: '10px' }}
                tick={{ fill: 'rgba(148,163,184,0.7)' }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="rgba(148,163,184,0.5)"
                style={{ fontSize: '10px' }}
                tick={{ fill: 'rgba(148,163,184,0.7)' }}
                domain={[0, yMax]}
                tickFormatter={yTick}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17,24,39,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(20px)',
                  padding: '12px'
                }}
                labelStyle={{ color: '#F3F4F6', fontWeight: 600 }}
                itemStyle={{ color: '#A78BFA' }}
                formatter={(value) => [`${formatNumber(value)} kr`, 'Förmögenhet']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isFlat ? '#475569' : '#6366F1'}
                strokeWidth={2}
                fill="url(#colorValue)"
                animationDuration={800}
                animationEasing="ease-out"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>

          {isFlat && (
            <p className="text-xs text-slate-500 text-center mt-3">
              Registrera ett sparande för att se hur dina pengar kan växa.
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}