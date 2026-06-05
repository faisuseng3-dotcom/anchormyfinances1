import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Swedish tax calc: ~30% below state-tax threshold, ~52% above (ca 51 000 kr/mån gross)
function calcNetIncome(grossMonthly) {
  const STATE_TAX_THRESHOLD = 51000;
  if (grossMonthly <= STATE_TAX_THRESHOLD) {
    return Math.round(grossMonthly * 0.70);
  }
  const base = STATE_TAX_THRESHOLD * 0.70;
  const extra = (grossMonthly - STATE_TAX_THRESHOLD) * 0.48;
  return Math.round(base + extra);
}

// Estimate gross from net (inverse, approximate)
function estimateGross(net) {
  // simple approximation
  if (net <= STATE_TAX_THRESHOLD * 0.70) return Math.round(net / 0.70);
  return Math.round(net / 0.68);
}
const STATE_TAX_THRESHOLD = 51000;

export default function WhatIfEngine({ profile, incomeChange, sickDays, onChange }) {
  const baseNet = profile?.income || 30000;

  const calc = useMemo(() => {
    const gross = estimateGross(baseNet);
    const newGross = gross * (1 + incomeChange / 100);
    let newNet = calcNetIncome(newGross);

    // Sick days: first day = 0 (karensdag), then 80% sjuklön
    if (sickDays > 0) {
      const dailyNet = baseNet / 30;
      const sickDeduction = dailyNet * 1 + dailyNet * Math.max(0, sickDays - 1) * 0.2;
      newNet = Math.round(newNet - sickDeduction);
    }

    const fixedCosts = (profile?.housingCost || 10000) +
      (profile?.subscriptions || []).reduce((s, x) => s + x.amount, 0) +
      (profile?.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);

    const currentMargin = baseNet - fixedCosts;
    const newMargin = newNet - fixedCosts;
    const marginDiff = newMargin - currentMargin;

    // Ripple: days to savings goal
    const savingsGoal = profile?.savingsGoal || 50000;
    const currentBuffer = profile?.buffer || 0;
    const remaining = Math.max(0, savingsGoal - currentBuffer);
    const currentMonthsToGoal = currentMargin > 0 ? remaining / currentMargin : Infinity;
    const newMonthsToGoal = newMargin > 0 ? remaining / newMargin : Infinity;
    const daysDiff = isFinite(currentMonthsToGoal) && isFinite(newMonthsToGoal)
      ? Math.round((newMonthsToGoal - currentMonthsToGoal) * 30)
      : null;

    return { newNet, newMargin, marginDiff, currentMargin, daysDiff, fixedCosts };
  }, [baseNet, incomeChange, sickDays, profile]);

  // Report upward for TaxOracle integration
  React.useEffect(() => {
    if (onChange) onChange({ simulatedNet: calc.newNet });
  }, [calc.newNet]);

  const diff = calc.marginDiff;
  const diffColor = diff >= 0 ? '#10B981' : '#EF4444';

  return (
    <div className="rounded-2xl p-4 space-y-5"
      style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider">
        ⚡ What-If Motorn
      </h3>

      {/* Income change slider */}
      <div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-400">Löneförändring</span>
          <span className={`font-bold ${incomeChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {incomeChange > 0 ? '+' : ''}{incomeChange}%
          </span>
        </div>
        <input type="range" min="-50" max="100" step="5"
          value={incomeChange}
          onChange={e => onChange?.({ incomeChange: parseInt(e.target.value) })}
          className="w-full cursor-pointer accent-indigo-500" style={{ height: '4px' }} />
        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
          <span>-50%</span><span>0%</span><span>+100%</span>
        </div>
      </div>

      {/* Sick days slider */}
      <div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-400">Sjukdagar / VAB</span>
          <span className="font-bold text-amber-400">{sickDays} dagar</span>
        </div>
        <input type="range" min="0" max="30" step="1"
          value={sickDays}
          onChange={e => onChange?.({ sickDays: parseInt(e.target.value) })}
          className="w-full cursor-pointer accent-amber-500" style={{ height: '4px' }} />
        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
          <span>0 d</span><span>15 d</span><span>30 d</span>
        </div>
        {sickDays > 0 && (
          <p className="text-[10px] text-amber-400 mt-1">⚠️ Karensdag dag 1, 80% sjuklön resterande dagar</p>
        )}
      </div>

      {/* Before / After comparison */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Nuvarande netto', value: baseNet, color: '#6366F1', sub: `Marginal: ${fmt(calc.currentMargin)} kr` },
          { label: 'Simulerad netto', value: calc.newNet, color: calc.newNet >= baseNet ? '#10B981' : '#EF4444', sub: `Marginal: ${fmt(calc.newMargin)} kr` },
        ].map(card => (
          <div key={card.label} className="rounded-xl p-3 text-center"
            style={{ background: `${card.color}10`, border: `1px solid ${card.color}30` }}>
            <p className="text-[10px] text-slate-500 mb-0.5">{card.label}</p>
            <p className="text-lg font-black text-white">{fmt(card.value)}</p>
            <p className="text-[10px] mt-0.5" style={{ color: card.color }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Margin delta */}
      <div className="rounded-xl p-3 flex items-center justify-between"
        style={{ background: `${diffColor}08`, border: `1px solid ${diffColor}25` }}>
        {diff >= 0
          ? <TrendingUp className="w-5 h-5 flex-shrink-0" style={{ color: diffColor }} />
          : <TrendingDown className="w-5 h-5 flex-shrink-0" style={{ color: diffColor }} />}
        <div className="flex-1 px-3">
          <p className="text-xs text-slate-400">Marginalförändring</p>
          <p className="text-sm font-bold" style={{ color: diffColor }}>
            {diff >= 0 ? '+' : ''}{fmt(diff)} kr/mån
          </p>
        </div>
        {/* Ripple effect */}
        {calc.daysDiff !== null && (
          <div className="text-right flex-shrink-0">
            <Target className="w-4 h-4 text-indigo-400 ml-auto mb-0.5" />
            <p className="text-[10px] text-slate-500">Sparmål</p>
            <p className="text-xs font-bold" style={{ color: calc.daysDiff <= 0 ? '#10B981' : '#EF4444' }}>
              {calc.daysDiff <= 0 ? `${Math.abs(calc.daysDiff)}d tidigare` : `${calc.daysDiff}d senare`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}