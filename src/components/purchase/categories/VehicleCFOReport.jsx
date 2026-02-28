import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, AlertTriangle, Shield, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Semi-circle gauge
function SafetyGauge({ score }) {
  const clampedScore = Math.max(1, Math.min(10, score || 5));
  // score 1-10: angle from -180 to 0 degrees
  const pct = (clampedScore - 1) / 9; // 0..1
  const angle = -180 + pct * 180; // -180..0 deg
  const color = pct > 0.65 ? '#10B981' : pct > 0.4 ? '#F59E0B' : '#EF4444';
  const label = pct > 0.65 ? 'Säkert köp' : pct > 0.4 ? 'Måttlig risk' : 'Ekonomisk fara';

  // SVG gauge arc
  const r = 60, cx = 80, cy = 72;
  const toRad = (d) => (d * Math.PI) / 180;
  const arcX = cx + r * Math.cos(toRad(angle));
  const arcY = cy + r * Math.sin(toRad(angle));

  const tracks = [
    { start: -180, end: -120, color: '#EF4444' },
    { start: -120, end: -60, color: '#F59E0B' },
    { start: -60, end: 0, color: '#10B981' },
  ];

  function describeArc(startDeg, endDeg) {
    const start = { x: cx + r * Math.cos(toRad(startDeg)), y: cy + r * Math.sin(toRad(startDeg)) };
    const end = { x: cx + r * Math.cos(toRad(endDeg)), y: cy + r * Math.sin(toRad(endDeg)) };
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="90" viewBox="0 0 160 90">
        {tracks.map((t) => (
          <path key={t.start} d={describeArc(t.start, t.end)} fill="none"
            stroke={t.color} strokeWidth="10" strokeOpacity="0.25" strokeLinecap="round" />
        ))}
        <path d={describeArc(-180, angle)} fill="none"
          stroke={color} strokeWidth="10" strokeOpacity="0.9" strokeLinecap="round" />
        {/* needle */}
        <line
          x1={cx} y1={cy}
          x2={cx + (r - 10) * Math.cos(toRad(angle))}
          y2={cy + (r - 10) * Math.sin(toRad(angle))}
          stroke="white" strokeWidth="2.5" strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="5" fill={color} />
        <text x={cx} y={cy - 20} textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">
          {clampedScore.toFixed(1)}
        </text>
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#9CA3AF" fontSize="8">CFO SCORE</text>
      </svg>
      <span className="text-xs font-semibold mt-1" style={{ color }}>{label}</span>
    </div>
  );
}

// Monthly budget pie
function MonthlyBitePie({ cost, margin }) {
  const pct = Math.min(cost / margin, 1);
  const data = [
    { value: pct, color: pct > 0.35 ? '#EF4444' : pct > 0.2 ? '#F59E0B' : '#6366F1' },
    { value: 1 - pct, color: 'rgba(255,255,255,0.06)' },
  ];
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={36} startAngle={90} endAngle={-270} strokeWidth={0}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{Math.round(pct * 100)}%</span>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 mt-1 text-center">av din lön</p>
    </div>
  );
}

const VERDICT_COLOR = {
  'Köp tryggt': '#10B981',
  'Köp varsamt': '#6366F1',
  'Vänta': '#F59E0B',
  'Undvik': '#EF4444',
};

export default function VehicleCFOReport({ analysis }) {
  const verdictColor = VERDICT_COLOR[analysis.cfo_verdict] || '#6366F1';
  const isLongLoan = analysis.months >= 60;
  const marginPct = Math.round((analysis.totalMonthlyCost / analysis.margin) * 100);

  return (
    <div className="space-y-4">

      {/* Header: CFO Score + Verdict */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${verdictColor}44` }}>
        <div className="p-4" style={{ background: `linear-gradient(135deg, ${verdictColor}11 0%, rgba(0,0,0,0) 100%)` }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                {analysis.vehicleName || 'Fordon'}
              </p>
              <h2 className="text-xl font-black text-white">{fmt(analysis.price)} kr</h2>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold"
                style={{ background: `${verdictColor}22`, color: verdictColor, border: `1px solid ${verdictColor}44` }}>
                {analysis.cfo_verdict}
              </div>
            </div>
            <SafetyGauge score={analysis.cfo_score} />
          </div>
        </div>

        {/* CFO Recommendation – gold/silver border */}
        <div className="px-4 pb-4">
          <div className="rounded-xl p-3 text-sm text-slate-300 leading-relaxed"
            style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${analysis.cfo_score >= 7 ? 'rgba(251,191,36,0.4)' : analysis.cfo_score >= 5 ? 'rgba(148,163,184,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 block mb-1">
              {analysis.cfo_score >= 7 ? '🥇 Gold Verdict' : analysis.cfo_score >= 5 ? '🥈 Silver Verdict' : '⚠️ Risk Alert'}
            </span>
            {analysis.cfo_recommendation}
          </div>
        </div>
      </div>

      {/* Monthly Bite + Real-time numbers */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-3 flex flex-col items-center"
          style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <MonthlyBitePie cost={analysis.totalMonthlyCost} margin={analysis.margin} />
        </div>
        <div className="rounded-2xl p-3 flex flex-col justify-center"
          style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] text-slate-500 mb-0.5">Månadskostnad</p>
          <p className="text-base font-black text-white">{fmt(analysis.totalMonthlyCost)}</p>
          <p className="text-[10px] text-slate-600">kr/mån total</p>
        </div>
        <div className="rounded-2xl p-3 flex flex-col justify-center"
          style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] text-slate-500 mb-0.5">Totalpris</p>
          <p className="text-base font-black text-white">{fmt(analysis.totalPaid)}</p>
          <p className="text-[10px] text-slate-600">kr att betala</p>
        </div>
      </div>

      {/* 60-month twist */}
      {isLongLoan && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-xl p-4"
          style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <p className="text-xs font-bold text-amber-400 mb-1">⏳ The {analysis.months}-Month Twist</p>
          <p className="text-xs text-amber-200">
            Priset för bekvämlighet: <strong className="text-white">{fmt(analysis.interestExtra)} kr extra</strong> i ränta jämfört med 36 månader.
            Din månadskostnad sjunker, men skulden hänger kvar längre än garantin.
          </p>
        </motion.div>
      )}

      {/* Impact cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Depreciation */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="flex items-start gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Värdeminskning</p>
              <p className="text-xl font-black text-white mt-0.5">-{fmt(analysis.depreciation)} kr</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Pengarna som försvinner när du kör ut från bilhandlaren.
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Restvärde: <span className="text-white font-semibold">{fmt(analysis.residualValue)} kr</span></p>
        </div>

        {/* Opportunity cost */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="flex items-start gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Alternativkostnad</p>
              <p className="text-xl font-black text-white mt-0.5">+{fmt(analysis.opportunityCost)} kr</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Vad dessa pengar hade blivit på börsen (7% / år).
          </p>
        </div>
      </div>

      {/* Trade-off Slider story */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">🍽 Trade-off kalkylatorn</p>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex justify-between items-center">
            <span>🥗 Luncher ute (130 kr/st)</span>
            <span className="font-bold text-white">{fmt(analysis.lunchEquivalent)} st/år</span>
          </div>
          <div className="h-px bg-white/5" />
          <p className="text-slate-400 leading-relaxed italic">{analysis.contextual_story}</p>
        </div>
      </div>

      {/* Opportunity investment */}
      {analysis.opportunity_investment && (
        <div className="rounded-2xl p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">📈 Alternativet – Börsen</p>
          <p className="text-xs text-slate-300">{analysis.opportunity_investment}</p>
        </div>
      )}

      {/* Better alternative */}
      {analysis.better_alternative && (
        <div className="rounded-xl p-3 flex gap-3 items-start"
          style={{ background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-cyan-400 mb-0.5">Smartare alternativ</p>
            <p className="text-xs text-slate-300">{analysis.better_alternative}</p>
          </div>
        </div>
      )}
    </div>
  );
}