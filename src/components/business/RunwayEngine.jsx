import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp } from 'lucide-react';

const fmt = (v) => `${(v / 1000).toFixed(0)}k`;

// ─── LIQUID CIRCULAR GAUGE ────────────────────────────────────────────────────
function RunwayGauge({ months }) {
  const MAX = 12;
  const pct = Math.min(1, months / MAX);
  const isWarning = months < 3;
  const isOk = months >= 6;

  const color = isWarning ? '#E53E3E' : isOk ? '#0D7377' : '#D69E2E';
  const colorLight = isWarning ? 'rgba(229,62,62,0.12)' : isOk ? 'rgba(13,115,119,0.12)' : 'rgba(214,158,46,0.12)';
  const colorGlow  = isWarning ? 'rgba(229,62,62,0.25)' : isOk ? 'rgba(13,115,119,0.25)' : 'rgba(214,158,46,0.25)';

  // SVG circle arc
  const R = 54;
  const CIRC = 2 * Math.PI * R;
  const dash = pct * CIRC;
  const gap  = CIRC - dash;

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="relative" style={{ width: 148, height: 148 }}>
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 32px ${colorGlow}` }} />

        {/* Liquid fill background */}
        <div className="absolute inset-2 rounded-full overflow-hidden" style={{ background: colorLight }}>
          {/* Animated liquid waves */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-b-full"
            animate={{ height: [`${pct * 100}%`, `${pct * 100 + 4}%`, `${pct * 100}%`] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: color, opacity: 0.22 }}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            animate={{ height: [`${pct * 100 - 2}%`, `${pct * 100 + 2}%`, `${pct * 100 - 2}%`] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            style={{ background: color, opacity: 0.13 }}
          />
        </div>

        {/* SVG arc */}
        <svg width="148" height="148" viewBox="0 0 120 120" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="7" />
          {/* Progress */}
          <motion.circle
            cx="60" cy="60" r={R}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            initial={{ strokeDasharray: `0 ${CIRC}` }}
            animate={{ strokeDasharray: `${dash} ${gap}` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-black leading-none" style={{ color, letterSpacing: '-1px' }}>
            {months.toFixed(1)}
          </p>
          <p className="text-xs font-semibold mt-1" style={{ color: '#9AA5B4' }}>Månader</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Runway kvar</p>
        <p className="text-xs mt-0.5" style={{ color: isWarning ? '#E53E3E' : '#9AA5B4' }}>
          {isWarning ? '⚠️ Under rekommenderat minimum (3 mån)' : isOk ? '✅ Bra kassaflöde' : 'Bevaka kassaflödet'}
        </p>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function RunwayEngine({ runwayMonths, runwayData, monthlyBurn }) {
  const isWarning = runwayMonths < 3;
  const color = isWarning ? '#E53E3E' : '#0D7377';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-3" style={{ borderBottom: '1px solid #F4F6F8' }}>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
          style={{ background: isWarning ? 'rgba(229,62,62,0.1)' : 'rgba(13,115,119,0.1)' }}>
          {isWarning
            ? <AlertTriangle className="w-4 h-4" style={{ color: '#E53E3E' }} />
            : <TrendingUp className="w-4 h-4" style={{ color: '#0D7377' }} />}
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Kassaflödesprognos</p>
          <p className="text-xs" style={{ color: '#9AA5B4' }}>Hur länge håller kassabalansen?</p>
        </div>
      </div>

      {/* Liquid gauge */}
      <RunwayGauge months={runwayMonths} />

      {/* Cash flow graph */}
      <div className="px-4 pb-2" style={{ height: 120 }}>
        <p className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1" style={{ color: '#9AA5B4' }}>Kassaflöde</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={runwayData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="rwGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.18} />
                <stop offset="95%" stopColor={color} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#9AA5B4' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#fff', border: '1px solid #F0F2F5',
                borderRadius: 12, fontSize: 12, color: '#1A2332',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}
              formatter={(v) => [`${v.toLocaleString('sv-SE')} kr`, 'Balans']}
            />
            <Area
              type="monotone" dataKey="balance"
              stroke={color} strokeWidth={2.5}
              fill="url(#rwGrad)" dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly burn footer */}
      <div className="mx-5 mb-5 mt-2 flex items-center justify-between rounded-2xl px-4 py-3"
        style={{ background: '#F9F8F6', border: '1px solid #ECEEF1' }}>
        <p className="text-xs font-semibold" style={{ color: '#4A5568' }}>Månadsutgifter</p>
        <p className="text-sm font-black" style={{ color: '#1A2332' }}>
          {monthlyBurn.toLocaleString('sv-SE')} kr/mån
        </p>
      </div>
    </motion.div>
  );
}