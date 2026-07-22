import React from 'react';
import { motion } from 'framer-motion';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

// Custom Lago Icons
const RadarIcon = ({ color = '#0FDEBD', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" opacity="0.5" />
    <circle cx="12" cy="12" r="1.5" fill={color} />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke={color} strokeWidth="1.5" />
    <motion.line x1="12" y1="12" x2="18" y2="6"
      stroke={color} strokeWidth="1.5"
      animate={{ rotate: 360 }}
      style={{ originX: '12px', originY: '12px' }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
    />
  </svg>
);

const WarningLightIcon = ({ color = '#FF4466', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"
    style={{ filter: `drop-shadow(0 0 5px ${color})` }}>
    <path d="M12 2L2 20h20L12 2z" stroke={color} strokeWidth="1.5" />
    <path d="M12 9v4" stroke={color} strokeWidth="1.8" />
    <circle cx="12" cy="16.5" r="1" fill={color} />
  </svg>
);

export default function MarginGauge({ safeToSpend, nextCritical }) {
  const isEmpty = safeToSpend <= 0;
  const isTight = safeToSpend > 0 && safeToSpend <= 1000;
  const isOk = safeToSpend > 1000 && safeToSpend <= 5000;

  // Gauge config
  const maxVal = 10000;
  const clampedVal = Math.max(0, Math.min(safeToSpend, maxVal));
  const angleDeg = -130 + (clampedVal / maxVal) * 260; // -130° to +130°

  const color = isEmpty ? '#FF4466' : isTight ? '#F6AD55' : '#0FDEBD';
  const statusLabel = isEmpty ? 'STOPP' : isTight ? 'VARNING' : 'FRITT FRAM';
  const statusColor = isEmpty ? '#FF4466' : isTight ? '#F6AD55' : '#0FDEBD';

  const daysText = nextCritical
    ? `${nextCritical.dayOffset} dagar kvar till nästa hinder`
    : 'Ingen hinderbana framåt';

  // SVG arc helpers
  const toRad = (d) => (d * Math.PI) / 180;
  const cx = 80, cy = 80, r = 60;
  const arcStart = -130;
  const arcEnd = 130;
  const startX = cx + r * Math.cos(toRad(arcStart));
  const startY = cy + r * Math.sin(toRad(arcStart));
  const endX = cx + r * Math.cos(toRad(arcEnd));
  const endY = cy + r * Math.sin(toRad(arcEnd));
  const bgArc = `M ${startX} ${startY} A ${r} ${r} 0 1 1 ${endX} ${endY}`;

  const fillAngle = Math.min(arcEnd, arcStart + (clampedVal / maxVal) * (arcEnd - arcStart));
  const fillEndX = cx + r * Math.cos(toRad(fillAngle));
  const fillEndY = cy + r * Math.sin(toRad(fillAngle));
  const fillLarge = fillAngle - arcStart > 180 ? 1 : 0;
  const fillArc = `M ${startX} ${startY} A ${r} ${r} 0 ${fillLarge} 1 ${fillEndX} ${fillEndY}`;

  // Needle tip
  const needleLen = 52;
  const needleX = cx + needleLen * Math.cos(toRad(angleDeg));
  const needleY = cy + needleLen * Math.sin(toRad(angleDeg));

  return (
    <div className="rounded-3xl p-4"
      style={{ background: 'rgba(6,8,18,0.9)', border: `1px solid ${color}30` }}>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <RadarIcon color={color} size={16} />
        <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.22)' }}>
          REALTIDSPULS 2.0
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Gauge SVG */}
        <div className="relative flex-shrink-0">
          <svg width="160" height="100" viewBox="0 0 160 100">
            {/* Colored zones */}
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF4466" />
                <stop offset="40%" stopColor="#F6AD55" />
                <stop offset="100%" stopColor="#0FDEBD" />
              </linearGradient>
            </defs>

            {/* BG track */}
            <path d={bgArc} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />

            {/* Fill arc */}
            <motion.path
              d={fillArc}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
            />

            {/* Needle */}
            <motion.line
              x1={cx} y1={cy}
              x2={needleX} y2={needleY}
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ rotate: -130 }}
              animate={{ rotate: angleDeg }}
              style={{ originX: `${cx}px`, originY: `${cy}px`, filter: `drop-shadow(0 0 4px ${color})` }}
              transition={{
                duration: 1.2,
                ease: 'easeOut',
                ...(isTight && { type: 'spring', stiffness: 80, damping: 4 }),
              }}
            />
            <circle cx={cx} cy={cy} r="5" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />

            {/* Zone labels */}
            <text x="20" y="95" fontSize="8" fontWeight="900" fill="#FF4466" textAnchor="middle">STOPP</text>
            <text x="80" y="25" fontSize="8" fontWeight="900" fill="#F6AD55" textAnchor="middle">VAR.</text>
            <text x="140" y="95" fontSize="8" fontWeight="900" fill="#0FDEBD" textAnchor="middle">FRITT</text>
          </svg>

          {/* Tremor effect when tight */}
          {isTight && (
            <motion.div className="absolute inset-0"
              animate={{ x: [0, -1, 1, -0.5, 0.5, 0] }}
              transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 1.5 }}
            />
          )}
        </div>

        {/* Right info */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Big number */}
          <div>
            <motion.p key={safeToSpend}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-black leading-none"
              style={{ color, fontSize: 32, letterSpacing: '-0.03em' }}>
              {fmt(Math.max(0, safeToSpend))}
            </motion.p>
            <p className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>kr säkert just nu</p>
          </div>

          {/* Status pill */}
          <motion.div
            animate={isEmpty ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: `${statusColor}15`,
              border: `1px solid ${statusColor}40`,
            }}>
            {isEmpty && <WarningLightIcon color={statusColor} size={12} />}
            <span className="text-[10px] font-black" style={{ color: statusColor }}>{statusLabel}</span>
          </motion.div>

          {/* AI copy */}
          <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {isEmpty
              ? 'Håll hårt i pengarna — rör dem inte.'
              : isTight
              ? `Marginalen är smal. ${daysText}.`
              : `Grön zon klar. ${daysText}.`}
          </p>
        </div>
      </div>
    </div>
  );
}