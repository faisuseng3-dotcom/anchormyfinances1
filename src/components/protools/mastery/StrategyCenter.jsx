import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getTotalFixedCosts } from '@/lib/financialUtils';

export default function StrategyCenter({ profile }) {
  const income = profile?.income || 0;
  const fixed = useMemo(() => getTotalFixedCosts(profile || {}), [profile]);
  const margin = Math.max(0, income - fixed);
  const marginPct = income > 0 ? Math.round((margin / income) * 100) : 0;
  const fixedPct = income > 0 ? Math.round((fixed / income) * 100) : 0;

  const segments = [
    { label: 'Fasta kostnader', value: fixed, pct: fixedPct, color: '#ef4444', desc: 'Hyra, lån, abonnemang' },
    { label: 'Din Frihet', value: margin, pct: marginPct, color: '#10b981', desc: 'Marginalen du kontrollerar' },
  ];

  const radius = 70;
  const stroke = 18;
  const circ = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = segments.map(seg => {
    const dash = (seg.pct / 100) * circ;
    const gap = circ - dash;
    const arc = { ...seg, dash, gap, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="space-y-6">
      {/* Donut chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="flex flex-col items-center"
      >
        <div className="relative">
          <svg width={180} height={180} viewBox="0 0 180 180">
            <circle cx={90} cy={90} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
            {arcs.map((arc, i) => (
              <motion.circle
                key={i}
                cx={90} cy={90} r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={stroke}
                strokeDasharray={`${arc.dash} ${arc.gap}`}
                strokeDashoffset={-arc.offset + circ * 0.25}
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circ}` }}
                animate={{ strokeDasharray: `${arc.dash} ${arc.gap}` }}
                transition={{ duration: 1.2, delay: i * 0.3, ease: 'easeOut' }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Inkomst</span>
            <span className="text-2xl font-bold text-white">{income.toLocaleString('sv-SE')}</span>
            <span className="text-xs text-slate-500">kr/mån</span>
          </div>
        </div>
      </motion.div>

      {/* Legend */}
      <div className="space-y-3">
        {segments.map((seg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.15 }}
            className="rounded-2xl p-4 border border-white/8"
            style={{ background: `${seg.color}10`, borderColor: `${seg.color}30` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: seg.color }} />
                <span className="text-sm font-semibold text-white">{seg.label}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold" style={{ color: seg.color }}>
                  {seg.value.toLocaleString('sv-SE')} kr
                </span>
                <span className="text-xs text-slate-500 ml-1">({seg.pct}%)</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{ background: seg.color }}
                initial={{ width: 0 }}
                animate={{ width: `${seg.pct}%` }}
                transition={{ duration: 1, delay: 0.8 + i * 0.2 }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">{seg.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="rounded-2xl p-4 border border-violet-500/20"
        style={{ background: 'rgba(139,92,246,0.08)' }}
      >
        <p className="text-xs text-slate-400">
          {marginPct >= 30
            ? `🟢 Utmärkt! Du har ${marginPct}% frihet — en VD-standard enligt ekonomer. Investera överskottet.`
            : marginPct >= 15
            ? `🟡 Du har ${marginPct}% frihet. Målet är 30%. Optimera 1-2 fasta poster för att nå dit.`
            : `🔴 Varning: Endast ${marginPct}% frihetsmarginal. Dina fasta kostnader dominerar — se Marginal-Maxaren.`}
        </p>
      </motion.div>
    </div>
  );
}