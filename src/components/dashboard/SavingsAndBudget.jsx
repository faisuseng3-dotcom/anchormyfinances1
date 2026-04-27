import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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
      <div className="flex flex-col items-center justify-center py-6">
        <div className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ border: '2px dashed rgba(255,255,255,0.10)' }}>
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-xs mt-3 font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Inga utgifter registrerade än
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
              style={{ filter: activeIdx === i ? `drop-shadow(0 0 6px ${arc.color})` : 'none', cursor: 'pointer' }}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              onTouchStart={() => setActiveIdx(i)}
              onTouchEnd={() => setActiveIdx(null)}
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.15 }}
            />
          ))}
          {/* Inner circle */}
          <circle cx={cx} cy={cy} r={innerR - 2} fill="#080c18" />
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
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
            <p className="text-[10px] flex-1" style={{ color: activeIdx === i ? '#fff' : 'rgba(255,255,255,0.45)' }}>{s.label}</p>
            <p className="text-[10px] font-black" style={{ color: activeIdx === i ? s.color : 'rgba(255,255,255,0.35)' }}>
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
      <div className="rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: 'rgba(246,173,85,0.12)', border: '1px solid rgba(246,173,85,0.25)' }}>
            {emoji}
          </div>
          <div className="flex-1">
            <p className="text-xs font-black" style={{ color: '#fff' }}>{name}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {fmt(current)} / {fmt(goal)} kr
            </p>
          </div>
          <p className="text-lg font-black" style={{ color: '#F6AD55' }}>{pct}%</p>
        </div>

        {/* Progress bar */}
        <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #D69E2E, #F6AD55, #ECC94B)',
              boxShadow: '0 0 10px rgba(246,173,85,0.5)',
            }}
          />
          {/* Gold sparkle at tip */}
          {pct > 5 && (
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute top-0 bottom-0 w-3 rounded-full"
              style={{ left: `calc(${pct}% - 6px)`, background: 'rgba(255,255,255,0.6)', filter: 'blur(2px)' }}
            />
          )}
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
    <div className="mx-4 rounded-3xl p-5 space-y-5"
      style={{
        background: 'rgba(8,12,22,0.95)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}>

      {/* Savings goal */}
      {profile.savingsGoal && (
        <>
          <div>
            <p className="text-[9px] font-black tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
              MINA MÅL
            </p>
            <SavingsGoalCard profile={profile} />
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
        </>
      )}

      {/* Spending donut */}
      <div>
        <p className="text-[9px] font-black tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
          VART PENGARNA GÅR
        </p>
        <DonutChart expenses={expenses} />
      </div>
    </div>
  );
}