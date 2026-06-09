import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const fmt = (n) => Math.round(Math.abs(n || 0)).toLocaleString('sv-SE');

export default function HorizonScroll({ eventsWithBalance, whatIfAmount = 0 }) {
  const scrollRef = useRef(null);
  const today = new Date();

  const futureEvents = (eventsWithBalance || [])
    .filter(e => {
      const d = e.date instanceof Date ? e.date : new Date(e.date);
      return d >= today;
    })
    .slice(0, 12);

  if (futureEvents.length === 0) return null;

  const minBal = Math.min(...futureEvents.map(e => e.balanceAfter));
  const maxBal = Math.max(...futureEvents.map(e => e.balanceAfter), 1);
  const range = maxBal - minBal || 1;

  const TRACK_H = 80;
  const getY = (bal) => TRACK_H - Math.round(((bal - minBal) / range) * (TRACK_H - 16)) - 8;

  const points = futureEvents.map((e, i) => ({
    x: 40 + i * 90,
    y: getY(e.balanceAfter),
    event: e,
  }));

  const totalW = 40 + futureEvents.length * 90 + 40;
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  // Ghost line with whatIf offset
  const ghostPoints = whatIfAmount > 0
    ? points.map(p => ({ ...p, y: Math.min(TRACK_H - 4, p.y + Math.round((whatIfAmount / (maxBal || 1)) * 20)) }))
    : null;
  const ghostPath = ghostPoints
    ? ghostPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    : null;

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: 'rgba(6,8,18,0.9)', boxShadow: 'var(--anchor-shadow-1)' }}>

      {/* Header */}
      <div className="px-4 pt-4 pb-1 flex items-center justify-between">
        <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.22)' }}>
          HORISONT — 30 DAGAR
        </p>
        {whatIfAmount > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 rounded" style={{ background: '#F6AD55', opacity: 0.6, borderTop: '1px dashed #F6AD55' }} />
            <p className="text-[8px]" style={{ color: 'rgba(246,173,85,0.7)' }}>GHOST</p>
          </div>
        )}
      </div>

      {/* Scrollable track */}
      <div ref={scrollRef} className="overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
        <div style={{ width: totalW, minWidth: '100%' }}>
          <svg width={totalW} height={TRACK_H + 48} style={{ display: 'block' }}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(pct => (
              <line key={pct}
                x1={20} y1={Math.round(TRACK_H * (1 - pct / 100))}
                x2={totalW - 20} y2={Math.round(TRACK_H * (1 - pct / 100))}
                stroke="rgba(255,255,255,0.04)" strokeWidth="1"
              />
            ))}

            {/* Zero line */}
            {minBal < 0 && (
              <line x1={20} y1={getY(0)} x2={totalW - 20} y2={getY(0)}
                stroke="rgba(255,68,102,0.3)" strokeWidth="1" strokeDasharray="4 4" />
            )}

            {/* Ghost path */}
            {ghostPath && (
              <path d={ghostPath} fill="none"
                stroke="#F6AD55" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.5" />
            )}

            {/* Main safe-path */}
            <motion.path
              d={pathD} fill="none"
              stroke="url(#safeLine)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="safeLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0FDEBD" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>

            {/* Event nodes */}
            {points.map(({ x, y, event }, i) => {
              const isCritical = event.balanceAfter < 0;
              const isIncome = event.priority === 'income';
              const daysUntil = Math.ceil((
                (event.date instanceof Date ? event.date : new Date(event.date)) - today
              ) / 86400000);

              const nodeColor = isCritical ? '#FF4466' : isIncome ? '#22d3ee' : '#A78BFA';

              return (
                <g key={i}>
                  {/* Vertical drop line */}
                  <line x1={x} y1={y + 6} x2={x} y2={TRACK_H + 4}
                    stroke={nodeColor} strokeWidth="1" opacity="0.2" strokeDasharray="3 3" />

                  {/* Node circle */}
                  <motion.circle cx={x} cy={y} r={isCritical ? 7 : 5}
                    fill={nodeColor}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.06, type: 'spring', stiffness: 300 }}
                    style={{ filter: `drop-shadow(0 0 4px ${nodeColor})` }}
                  />

                  {/* Pulsing ring for critical */}
                  {isCritical && (
                    <motion.circle cx={x} cy={y} r={12} fill="none"
                      stroke="#FF4466" strokeWidth="1.5"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}

                  {/* Category marker */}
                  <circle
                    cx={x}
                    cy={TRACK_H + 16}
                    r={4}
                    fill={isIncome ? '#34D399' : isCritical ? '#F87171' : '#818CF8'}
                  />

                  {/* Days label */}
                  <text x={x} y={TRACK_H + 36} textAnchor="middle" fontSize="8"
                    fill="rgba(255,255,255,0.3)">
                    {daysUntil === 0 ? 'idag' : `+${daysUntil}d`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}