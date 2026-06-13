import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const fmt = (n) => Math.round(Math.abs(n || 0)).toLocaleString('sv-SE');

// Anchor custom icons (inline SVG)
const PortalIcon = ({ color = '#0FDEBD', size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"
    style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <ellipse cx="12" cy="12" rx="4" ry="9" stroke={color} strokeWidth="1.5" />
    <ellipse cx="12" cy="12" rx="9" ry="9" stroke={color} strokeWidth="1" opacity="0.4" />
    <path d="M12 3v18" stroke={color} strokeWidth="1" opacity="0.3" />
  </svg>
);

const PitIcon = ({ color = '#FF4466', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"
    style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
    <path d="M3 17 Q7 11 12 17 Q17 23 21 17" stroke={color} strokeWidth="2" fill="none" />
    <path d="M8 17 Q10 13 12 17 Q14 21 16 17" stroke={color} strokeWidth="1.5" fill={`${color}30`} />
  </svg>
);

export default function HorizonPath({ eventsWithBalance, whatIfAmount = 0 }) {
  const today = new Date();

  const futureEvents = useMemo(() => (eventsWithBalance || [])
    .filter(e => {
      const d = e.date instanceof Date ? e.date : new Date(e.date);
      return d >= today;
    })
    .slice(0, 10), [eventsWithBalance]);

  if (futureEvents.length === 0) return null;

  const W = 320;
  const H = 90;
  const PAD_X = 30;
  const PATH_Y = 55; // the road baseline Y

  // Each event spaced evenly along X
  const spacing = (W - PAD_X * 2) / Math.max(futureEvents.length, 1);
  const nodes = futureEvents.map((e, i) => {
    const isIncome = e.priority === 'income';
    const isCritical = e.balanceAfter < 0;
    const x = PAD_X + i * spacing;
    return { x, event: e, isIncome, isCritical };
  });

  // "You" dot position (just before first event)
  const youX = PAD_X - 16;

  // Path points — road dips at pits, rises at portal
  const pathPoints = [
    { x: youX, y: PATH_Y },
    ...nodes.map(n => ({
      x: n.x,
      y: n.isCritical ? PATH_Y + 14 : n.isIncome ? PATH_Y - 14 : PATH_Y,
    })),
    { x: W - 10, y: PATH_Y },
  ];

  const roadD = pathPoints
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(' ');

  // Ghost path offset with whatIfAmount
  const ghostD = whatIfAmount > 0
    ? pathPoints.map((p, i) => {
        const extra = Math.min(20, (whatIfAmount / 5000) * 20);
        const y = Math.min(H - 6, p.y + extra);
        return i === 0 ? `M${p.x},${y}` : `L${p.x},${y}`;
      }).join(' ')
    : null;

  const daysUntil = (e) => {
    const d = e.date instanceof Date ? e.date : new Date(e.date);
    return Math.ceil((d - today) / 86400000);
  };

  // Income portal (last income event)
  const portalNode = nodes.filter(n => n.isIncome).pop();
  const nextPit = nodes.find(n => n.isCritical);

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: 'rgba(6,8,18,0.9)', boxShadow: 'var(--anchor-shadow-1)' }}>

      {/* Header */}
      <div className="px-4 pt-4 pb-1 flex items-center justify-between">
        <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.22)' }}>
          DIN HORISONT — 30 DAGAR
        </p>
        {nextPit && (
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1"
            style={{ background: 'rgba(255,68,102,0.12)', color: '#FF4466', boxShadow: 'var(--anchor-shadow-1)' }}>
            <Zap className="w-3 h-3" aria-hidden /> Hinder om {daysUntil(nextPit.event)}d
          </span>
        )}
      </div>

      {/* SVG path */}
      <div className="px-2 pb-4">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0FDEBD" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#A78BFA" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0FDEBD" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Ghost path (whatIf) */}
          {ghostD && (
            <path d={ghostD} fill="none"
              stroke="#FF4466" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
          )}

          {/* Main road */}
          <motion.path
            d={roadD}
            fill="none"
            stroke="url(#roadGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />

          {/* Road glow underlay */}
          <path d={roadD} fill="none" stroke="#0FDEBD" strokeWidth="8" opacity="0.04" strokeLinecap="round" />

          {/* "YOU" dot */}
          <motion.circle cx={youX} cy={PATH_Y} r="7" fill="#fff"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
            style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9))' }}
          />
          <motion.circle cx={youX} cy={PATH_Y} r="12" fill="none"
            stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"
            animate={{ r: [12, 18, 12], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <text x={youX} y={PATH_Y - 16} textAnchor="middle" fontSize="7" fontWeight="900" fill="rgba(255,255,255,0.6)">DU</text>

          {/* Event nodes */}
          {nodes.map(({ x, event, isIncome, isCritical }, i) => {
            const nodeY = isCritical ? PATH_Y + 14 : isIncome ? PATH_Y - 14 : PATH_Y;
            const nodeColor = isCritical ? '#FF4466' : isIncome ? '#0FDEBD' : '#A78BFA';
            const days = daysUntil(event);

            return (
              <g key={i}>
                {/* Vertical connector */}
                <line x1={x} y1={nodeY} x2={x} y2={PATH_Y}
                  stroke={nodeColor} strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />

                {/* Node */}
                {isIncome ? (
                  // Portal for income
                  <g>
                    <motion.circle cx={x} cy={nodeY} r="10" fill={`${nodeColor}20`}
                      stroke={nodeColor} strokeWidth="1.5"
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.08, type: 'spring', stiffness: 280 }}
                      style={{ filter: `drop-shadow(0 0 8px ${nodeColor}60)` }}
                    />
                    <motion.circle cx={x} cy={nodeY} r="16" fill="none"
                      stroke={nodeColor} strokeWidth="1"
                      animate={{ r: [16, 22, 16], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    />
                    <text x={x} y={nodeY + 4} textAnchor="middle" fontSize="9" fontWeight="900" fill={nodeColor}>▶</text>
                    <text x={x} y={nodeY - 18} textAnchor="middle" fontSize="7" fontWeight="900" fill={nodeColor}>PORTAL</text>
                  </g>
                ) : isCritical ? (
                  // Pit for danger
                  <g>
                    <motion.circle cx={x} cy={nodeY} r="8" fill={`${nodeColor}20`}
                      stroke={nodeColor} strokeWidth="1.5"
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.08, type: 'spring', stiffness: 280 }}
                      style={{ filter: `drop-shadow(0 0 6px ${nodeColor}80)` }}
                    />
                    <motion.circle cx={x} cy={nodeY} r="14" fill="none"
                      stroke={nodeColor} strokeWidth="1.5"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    <text x={x} y={nodeY + 3} textAnchor="middle" fontSize="8" fontWeight="900" fill={nodeColor}>!</text>
                  </g>
                ) : (
                  <motion.circle cx={x} cy={nodeY} r="5" fill={nodeColor}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.08, type: 'spring', stiffness: 280 }}
                  />
                )}

                {/* Label below */}
                <text x={x} y={H - 10} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.3)">
                  {days === 0 ? 'idag' : `+${days}d`}
                </text>
                <text x={x} y={H - 2} textAnchor="middle" fontSize="6.5" fill={nodeColor} fontWeight="700">
                  {(event.name || '').slice(0, 8)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-white" style={{ boxShadow: '0 0 6px rgba(255,255,255,0.8)' }} />
          <span className="text-[8px] font-black" style={{ color: 'rgba(255,255,255,0.3)' }}>DU</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: '#FF4466', boxShadow: '0 0 4px #FF4466' }} />
          <span className="text-[8px] font-black" style={{ color: 'rgba(255,255,255,0.3)' }}>GROP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: '#0FDEBD', boxShadow: '0 0 4px #0FDEBD' }} />
          <span className="text-[8px] font-black" style={{ color: 'rgba(255,255,255,0.3)' }}>PORTAL (LÖN)</span>
        </div>
        {whatIfAmount > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 border-t-2" style={{ borderColor: '#FF4466', borderStyle: 'dashed' }} />
            <span className="text-[8px] font-black" style={{ color: 'rgba(255,68,102,0.6)' }}>GHOST</span>
          </div>
        )}
      </div>
    </div>
  );
}