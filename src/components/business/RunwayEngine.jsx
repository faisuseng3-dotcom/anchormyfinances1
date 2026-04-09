import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function RunwayEngine({ runwayMonths, runwayData, monthlyBurn }) {
  const isWarning = runwayMonths < 3;

  const fmt = (v) => `${(v / 1000).toFixed(0)}k`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: isWarning ? 'rgba(201,64,64,0.2)' : 'rgba(52,168,106,0.2)',
              border: `1px solid ${isWarning ? 'rgba(201,64,64,0.4)' : 'rgba(52,168,106,0.4)'}`,
            }}>
            {isWarning
              ? <AlertTriangle className="w-5 h-5" style={{ color: '#C94040' }} />
              : <TrendingUp className="w-5 h-5" style={{ color: '#34A86A' }} />}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Runway Engine</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Kassaflödesprognos</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black" style={{ color: isWarning ? '#C94040' : '#34A86A' }}>
            {runwayMonths.toFixed(1)}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>månader kvar</p>
        </div>
      </div>

      <div className="h-32 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={runwayData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="runwayGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isWarning ? '#C94040' : '#D4AF37'} stopOpacity={0.25} />
                <stop offset="95%" stopColor={isWarning ? '#C94040' : '#D4AF37'} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#5A7285' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: '#5A7285' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#162535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }}
              formatter={(v) => [`${v.toLocaleString('sv-SE')} kr`, 'Kassabalans']}
            />
            <Area
              type="monotone" dataKey="balance" stroke={isWarning ? '#C94040' : '#D4AF37'}
              strokeWidth={2} fill="url(#runwayGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl px-3 py-2"
        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Månadsutgifter</p>
        <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {monthlyBurn.toLocaleString('sv-SE')} kr/mån
        </p>
      </div>
    </motion.div>
  );
}