import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, Loader2, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { bizMetaClass, bizSubtitleClass } from '@/components/business/BusinessChrome';

export default function RunwayEngine({
  runwayMonths: propRunway,
  runwayData: propData,
  monthlyBurn: propBurn,
  isReset,
  cashflowHistory,
  totalLiquidity,
  vatReserved,
  vatDeadlines,
}) {
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReset || !cashflowHistory?.length) {
      setAiResult(null);
      return;
    }
    setLoading(true);
    base44.functions
      .invoke('runwayEngine', {
        cashflowHistory,
        totalLiquidity: totalLiquidity || 0,
        vatReserved: vatReserved || 0,
        vatDeadlines: vatDeadlines || [],
      })
      .then((res) => setAiResult(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReset, JSON.stringify(cashflowHistory)]);

  const runway = isReset ? 0 : aiResult?.runway ?? propRunway ?? 0;
  const burn = isReset ? 0 : aiResult?.burnRate ?? propBurn ?? 0;
  const chartData = isReset ? [] : aiResult?.forecast?.length ? aiResult.forecast : propData || [];
  const anomalies = aiResult?.anomalies || [];
  const recommendations = aiResult?.recommendations || [];
  const isWarning = !isReset && runway > 0 && runway < 3;
  const fmt = (v) => `${(v / 1000).toFixed(0)}k`;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-end justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#0D7377]" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-[#E53E3E]" />
          ) : (
            <TrendingUp className="w-5 h-5 text-[#0D7377]" />
          )}
          <div>
            <p className="text-[15px] font-medium text-[#1A2332]">
              Kassaflödesprognos{aiResult && <span className="text-[#9AA5B4] font-normal"> · AI</span>}
            </p>
            <p className={bizMetaClass}>Månadsutgifter {burn > 0 ? `${burn.toLocaleString('sv-SE')} kr` : '—'}</p>
          </div>
        </div>
        <div className="text-right">
          <p
            className="text-[32px] font-semibold tabular-nums leading-none"
            style={{ color: isReset ? '#C0C8D2' : isWarning ? '#E53E3E' : '#0D7377' }}
          >
            {isReset ? '—' : runway > 0 ? runway.toFixed(1) : '—'}
          </p>
          <p className={bizMetaClass}>månader runway</p>
        </div>
      </div>

      <div className="h-36 mb-4">
        {isReset || chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className={`${bizSubtitleClass} text-center px-4`}>
              {loading ? 'Analyserar kassaflöde…' : 'Bokför transaktioner för att se prognos'}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="runwayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isWarning ? '#E53E3E' : '#0D7377'} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={isWarning ? '#E53E3E' : '#0D7377'} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9AA5B4' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: '#9AA5B4' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #E8ECF0', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v.toLocaleString('sv-SE')} kr`, 'Kassabalans']}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke={isWarning ? '#E53E3E' : '#0D7377'}
                strokeWidth={2}
                fill="url(#runwayGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {anomalies.slice(0, 2).map((a, i) => (
        <p key={i} className="text-[13px] text-[#D69E2E] mb-2 flex gap-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {a.message}
        </p>
      ))}

      {recommendations.slice(0, 2).map((r, i) => (
        <p key={i} className="text-[13px] text-[#6B7A8C] mb-1 flex gap-2">
          <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#0D7377]" />
          {r}
        </p>
      ))}
    </motion.div>
  );
}
