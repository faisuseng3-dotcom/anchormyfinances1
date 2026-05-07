import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, Loader2, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RunwayEngine({ runwayMonths: propRunway, runwayData: propData, monthlyBurn: propBurn, isReset, cashflowHistory, totalLiquidity, vatReserved, vatDeadlines }) {
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReset || !cashflowHistory?.length) { setAiResult(null); return; }
    setLoading(true);
    base44.functions.invoke('runwayEngine', {
      cashflowHistory,
      totalLiquidity: totalLiquidity || 0,
      vatReserved: vatReserved || 0,
      vatDeadlines: vatDeadlines || [],
    }).then(res => {
      setAiResult(res.data);
    }).catch(err => {
      console.error('runwayEngine error:', err);
    }).finally(() => setLoading(false));
  }, [isReset, JSON.stringify(cashflowHistory)]);

  // Use AI data if available, fall back to static props
  const runway = isReset ? 0 : (aiResult?.runway ?? propRunway ?? 0);
  const burn = isReset ? 0 : (aiResult?.burnRate ?? propBurn ?? 0);
  const chartData = isReset ? [] : (aiResult?.forecast?.length ? aiResult.forecast : (propData || []));
  const anomalies = aiResult?.anomalies || [];
  const recommendations = aiResult?.recommendations || [];

  const isWarning = !isReset && runway > 0 && runway < 3;
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
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#0D7377' }} />
              : isWarning
                ? <AlertTriangle className="w-4 h-4" style={{ color: '#E53E3E' }} />
                : <TrendingUp className="w-4 h-4" style={{ color: '#0D7377' }} />}
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#1A2332' }}>
              Kassaflödesprognos {aiResult && <span className="text-xs font-normal" style={{ color: '#9AA5B4' }}>· AI</span>}
            </p>
            <p className="text-xs" style={{ color: '#9AA5B4' }}>Runway</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black" style={{ color: isReset ? '#C0C8D2' : isWarning ? '#E53E3E' : '#0D7377', letterSpacing: '-1px' }}>
            {isReset ? '—' : runway > 0 ? runway.toFixed(1) : '—'}
          </p>
          <p className="text-xs" style={{ color: '#9AA5B4' }}>månader kvar</p>
        </div>
      </div>

      <div className="px-2 py-3 h-36">
        {isReset || chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-center px-4" style={{ color: '#C0C8D2' }}>
              {loading ? 'Analyserar kassaflöde...' : 'Ingen data — bokför transaktioner för att se prognos'}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
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
              <Area type="monotone" dataKey="balance" stroke={isWarning ? '#E53E3E' : '#0D7377'}
                strokeWidth={2} fill="url(#runwayGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mx-5 mb-4 flex items-center justify-between rounded-2xl px-4 py-3"
        style={{ background: '#F4F6F8' }}>
        <p className="text-xs font-semibold" style={{ color: '#4A5568' }}>Månadsutgifter (burn)</p>
        <p className="text-sm font-black" style={{ color: isReset ? '#C0C8D2' : '#1A2332' }}>
          {isReset ? '0 kr/mån' : burn > 0 ? `${burn.toLocaleString('sv-SE')} kr/mån` : '—'}
        </p>
      </div>

      {/* AI Anomalies */}
      {anomalies.length > 0 && (
        <div className="mx-5 mb-4 space-y-2">
          {anomalies.slice(0, 2).map((a, i) => (
            <div key={i} className="flex items-start gap-2 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(214,158,46,0.08)', border: '1px solid rgba(214,158,46,0.2)' }}>
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#D69E2E' }} />
              <p className="text-xs" style={{ color: '#4A5568' }}>{a.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="mx-5 mb-4 space-y-1.5">
          {recommendations.slice(0, 2).map((r, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl"
              style={{ background: '#F4F6F8' }}>
              <Zap className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#0D7377' }} />
              <p className="text-xs" style={{ color: '#4A5568' }}>{r}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}