import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardSection } from './DashboardChrome';
import { sectionMetaClass } from '@/lib/anchorTheme';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

const CATEGORIES = [
  { key: 'food', label: 'Mat', color: '#34D9BE' },
  { key: 'transport', label: 'Transport', color: '#0D7377' },
  { key: 'entertainment', label: 'Nöje', color: '#5B8CFF' },
  { key: 'other', label: 'Annat', color: '#A78BFA' },
  { key: 'health', label: 'Hälsa', color: '#F6AD55' },
  { key: 'shopping', label: 'Shopping', color: '#FCA5A5' },
];

function DonutChart({ expenses }) {
  const [activeIdx, setActiveIdx] = useState(null);

  const usage = {};
  expenses.forEach((e) => {
    const key = CATEGORIES.find((c) => c.key === e.category) ? e.category : 'other';
    usage[key] = (usage[key] || 0) + (e.amount || 0);
  });

  const total = Object.values(usage).reduce((s, v) => s + v, 0);
  const slices = CATEGORIES.map((c) => ({ ...c, value: usage[c.key] || 0 })).filter((c) => c.value > 0);

  if (total === 0) {
    return (
      <p className="text-[14px] text-white/45 py-6 text-center">
        Inga utgifter registrerade — lägg till köp eller importera från bank.
      </p>
    );
  }

  const cx = 60,
    cy = 60,
    outerR = 52,
    innerR = 34;
  let angle = -90;
  const arcs = slices.map((s) => {
    const deg = (s.value / total) * 360;
    const startAngle = angle;
    angle += deg;
    const toRad = (d) => (d * Math.PI) / 180;
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
    return { ...s, path };
  });

  const active = activeIdx !== null ? slices[activeIdx] : null;

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          {arcs.map((arc, i) => (
            <motion.path
              key={arc.key}
              d={arc.path}
              fill={arc.color}
              opacity={activeIdx === null ? 1 : activeIdx === i ? 1 : 0.35}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              onTouchStart={() => setActiveIdx(i)}
              onTouchEnd={() => setActiveIdx(null)}
            />
          ))}
          <circle cx={cx} cy={cy} r={innerR - 2} fill="transparent" />
          <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="600">
            {active ? fmt(active.value) : fmt(total)}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8">
            {active ? active.label : 'kr'}
          </text>
        </svg>
      </div>
      <div className="flex-1 space-y-2">
        {slices.map((s, i) => (
          <div
            key={s.key}
            className="flex items-center gap-2"
            onMouseEnter={() => setActiveIdx(i)}
            onMouseLeave={() => setActiveIdx(null)}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <p className={`text-[13px] flex-1 ${activeIdx === i ? 'text-white' : 'text-white/50'}`}>
              {s.label}
            </p>
            <p className={`text-[13px] font-medium tabular-nums ${activeIdx === i ? 'text-white' : 'text-white/45'}`}>
              {fmt(s.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SavingsGoalRow({ profile }) {
  if (!profile.savingsGoal) return null;

  const current = profile.savingsCurrentBalance || 0;
  const goal = profile.savingsGoal;
  const pct = Math.min(100, Math.round((current / goal) * 100));
  const emoji = profile.savingsGoalEmoji || '🎯';
  const name = profile.savingsGoalName || 'Sparmål';

  return (
    <Link to="/SavingsGoals" className="block no-underline py-3 active:opacity-70">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-white">{name}</p>
          <p className={sectionMetaClass}>
            {fmt(current)} / {fmt(goal)} kr
          </p>
          <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#E8B86B] to-[#F0D090]"
            />
          </div>
        </div>
        <p className="text-[17px] font-semibold text-white/90 tabular-nums">{pct}%</p>
      </div>
    </Link>
  );
}

export default function SavingsAndBudget({ profile }) {
  if (!profile) return null;

  const expenses = profile.monthlyExpenses || [];

  return (
    <>
      {profile.savingsGoal && (
        <DashboardSection title="Sparmål">
          <SavingsGoalRow profile={profile} />
        </DashboardSection>
      )}

      <DashboardSection title="Utgifter per kategori">
        <DonutChart expenses={expenses} />
      </DashboardSection>
    </>
  );
}
