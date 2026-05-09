import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { dashboardGlassSurface, dashboardSectionLabelClass } from '@/components/dashboard/dashboardGlass';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

// ─── Donut Chart ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'food',          label: 'Mat',       color: '#0FDEBD' },
  { key: 'transport',     label: 'Transport',  color: '#0D7377' },
  { key: 'entertainment', label: 'Nöje',      color: '#4B7CF3' },
  { key: 'other',         label: 'Annat',     color: '#A78BFA' },
  { key: 'health',        label: 'Hälsa',     color: '#F6AD55' },
  { key: 'shopping',      label: 'Shopping',  color: '#FC8181' },
];

function DonutChart({ expenses }) {
  const [activeIdx, setActiveIdx] = useState(null);

  const usage = {};
  expenses.forEach(e => {
    const key = CATEGORIES.find(c => c.key === e.category) ? e.category : 'other';
    usage[key] = (usage[key] || 0) + (e.amount || 0);
  });

  const total = Object.values(usage).reduce((s, v) => s + v, 0);
  const slices = CATEGORIES.map(c => ({ ...c, value: usage[c.key] || 0 }))
    .filter(c => c.value > 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}
        >
          <span className="text-2xl opacity-90">📊</span>
        </div>
        <p className="text-[13px] mt-4 font-medium text-center text-white/45 max-w-[220px]">
          Inga utgifter registrerade än — lägg till köp eller importera från bank.
        </p>
      </div>
    );
  }

  // Build SVG arcs
  const cx = 60, cy = 60, outerR = 52, innerR = 34;
  let angle = -90;
  const arcs = slices.map((s, i) => {
    const deg = (s.value / total) * 360;
    const startAngle = angle;
    angle += deg;
    const toRad = d => (d * Math.PI) / 180;
    const x1 = cx + outerR * Math.cos(toRad(startAngle));
    const y1 = cy + outerR * Math.sin(toRad(startAngle));
    const x2 = cx + outerR * Math.cos(toRad(angle - 0.5));
    const y2 = cy + outerR * Math.sin(toRad(angle - 0.5));
    const ix1 = cx + innerR * Math.cos(toRad(startAngle));
    const iy1 = cy + innerR * Math.sin(toRad(startAngle));
    const ix2 = cx + innerR * Math.cos(toRad(angle - 0.5));
    const iy2 = cy + innerR * Math.sin(toRad(angle - 0.5));
    const large = deg > 180 ? 1 : 0;
    const path = `M${x1} ${y1} A${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L${ix2} ${iy2} A${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1}Z`;
    return { ...s, path, deg };
  });

  const active = activeIdx !== null ? slices[activeIdx] : null;

  return (
    <div className="flex items-center gap-5">
      <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          {arcs.map((arc, i) => (
            <motion.path
              key={arc.key}
              d={arc.path}
              fill={arc.color}
              opacity={activeIdx === null ? 1 : activeIdx === i ? 1 : 0.3}
              style={{ filter: activeIdx === i ? 'brightness(1.08)' : 'none', cursor: 'pointer' }}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              onTouchStart={() => setActiveIdx(i)}
              onTouchEnd={() => setActiveIdx(null)}
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.15 }}
            />
          ))}
          {/* Inner circle */}
          <circle cx={cx} cy={cy} r={innerR - 2} fill="rgba(8,14,28,0.85)" />
          {/* Center text */}
          <text x={cx} y={cy - 5} textAnchor="middle" fill="white" fontSize="10" fontWeight="900">
            {active ? fmt(active.value) : fmt(total)}
          </text>
          <text x={cx} y={cy + 9} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontWeight="700">
            {active ? active.label : 'TOTALT'}
          </text>
          <text x={cx} y={cy + 20} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="6">
            kr
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-1.5">
        {slices.map((s, i) => (
          <div key={s.key}
            className="flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setActiveIdx(i)}
            onMouseLeave={() => setActiveIdx(null)}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <p className="text-[10px] flex-1" style={{ color: activeIdx === i ? '#fff' : 'rgba(255,255,255,0.5)' }}>{s.label}</p>
            <p className="text-[10px] font-semibold tabular-nums" style={{ color: activeIdx === i ? s.color : 'rgba(255,255,255,0.4)' }}>
              {fmt(s.value)} kr
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Savings Goal ─────────────────────────────────────────────────────────────
function SavingsGoalCard({ profile }) {
  if (!profile.savingsGoal) return null;

  const current = profile.savingsCurrentBalance || 0;
  const goal = profile.savingsGoal;
  const pct = Math.min(100, Math.round((current / goal) * 100));
  const emoji = profile.savingsGoalEmoji || '🎯';
  const name = profile.savingsGoalName || 'Sparmål';

  return (
    <Link to="/SavingsGoals">
      <div
        className="rounded-[22px] p-4"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{name}</p>
            <p className="text-[11px] text-white/45">
              {fmt(current)} / {fmt(goal)} kr
            </p>
          </div>
          <p className="text-lg font-semibold tabular-nums text-white/90">{pct}%</p>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 rounded-full overflow-hidden bg-white/[0.08]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #E8B86B, #F0D090)',
            }}
          />
        </div>
      </div>
    </Link>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function SavingsAndBudget({ profile }) {
  if (!profile) return null;

  const expenses = profile.monthlyExpenses || [];

  return (
    <div className="mx-4 rounded-[26px] p-5 sm:p-6 space-y-6" style={dashboardGlassSurface()}>

      {/* Savings goal */}
      {profile.savingsGoal && (
        <>
          <div>
            <p className={`${dashboardSectionLabelClass} mb-3`}>
              Mina mål
            </p>
            <SavingsGoalCard profile={profile} />
          </div>
          <div className="h-px bg-white/[0.08]" />
        </>
      )}

      {/* Spending donut */}
      <div>
        <p className={`${dashboardSectionLabelClass} mb-3`}>
          Vart pengarna går
        </p>
        <DonutChart expenses={expenses} />
      </div>
    </div>
  );
}