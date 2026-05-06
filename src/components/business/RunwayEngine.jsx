import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function RunwayEngine({ runwayMonths, runwayData, monthlyBurn, isReset }) {
  const safeData = runwayData || [];
  const isWarning = !isReset && runwayMonths < 3;

  const fmt = (v) => `${(v / 1000).toFixed(0)}k`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div className="px-5 pt-4 pb-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid #F0F2F5' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: isWarning ? 'rgba(229,62,62,0.1)' : 'rgba(13,115,119,0.1)' }}>
            {isWarning
              ? <AlertTriangle className="w-4 h-4" style={{ color: '#E53E3E' }} />
              : <TrendingUp className="w-4 h-4" style={{ color: '#0D7377' }} />}
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Kassaflödesprognos</p>
            <p className="text-xs" style={{ color: '#9AA5B4' }}>Runway</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black" style={{ color: isReset ? '#C0C8D2' : isWarning ? '#E53E3E' : '#0D7377', letterSpacing: '-1px' }}>
            {isReset ? '—' : runwayMonths.toFixed(1)}
          </p>
          <p className="text-xs" style={{ color: '#9AA5B4' }}>månader kvar</p>
        </div>
      </div>

      <div className="px-2 py-3 h-36">
        {isReset || safeData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs" style={{ color: '#C0C8D2' }}>Ingen data — bokför transaktioner för att se prognos</p>
          </div>
        ) : null}
        {!isReset && safeData.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={safeData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="runwayGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isWarning ? '#E53E3E' : '#0D7377'} stopOpacity={0.2} />
                <stop offset="95%" stopColor={isWarning ? '#E53E3E' : '#0D7377'} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9AA5B4' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: '#9AA5B4' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #F0F2F5', borderRadius: 12, fontSize: 12, color: '#1A2332', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              formatter={(v) => [`${v.toLocaleString('sv-SE')} kr`, 'Kassabalans']}
            />
            <Area
              type="monotone" dataKey="balance" stroke={isWarning ? '#E53E3E' : '#0D7377'}
              strokeWidth={2} fill="url(#runwayGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>

      <div className="mx-5 mb-4 flex items-center justify-between rounded-2xl px-4 py-3"
        style={{ background: '#F4F6F8' }}>
        <p className="text-xs font-semibold" style={{ color: '#4A5568' }}>Månadsutgifter</p>
        <p className="text-sm font-black" style={{ color: isReset ? '#C0C8D2' : '#1A2332' }}>
          {isReset ? '0 kr/mån' : `${monthlyBurn.toLocaleString('sv-SE')} kr/mån`}
        </p>
      </div>
    </motion.div>
  );
}