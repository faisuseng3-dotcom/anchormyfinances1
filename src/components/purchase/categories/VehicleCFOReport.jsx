import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, AlertTriangle, Shield, Zap, Medal, Waves, Utensils, Salad, Clock, LineChart } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function SafetyGauge({ score }) {
  const clampedScore = Math.max(1, Math.min(10, score || 5));
  const pct = (clampedScore - 1) / 9;
  const angle = -180 + pct * 180;
  const color = pct > 0.65 ? '#10B981' : pct > 0.4 ? '#F59E0B' : '#EF4444';
  const label = pct > 0.65 ? 'Säkert köp' : pct > 0.4 ? 'Måttlig risk' : 'Ekonomisk fara';
  const r = 60, cx = 80, cy = 72;
  const toRad = (d) => (d * Math.PI) / 180;

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
        <line x1={cx} y1={cy} x2={cx + (r - 10) * Math.cos(toRad(angle))} y2={cy + (r - 10) * Math.sin(toRad(angle))}
          stroke="white" strokeWidth="2.5" strokeLinecap="round" />
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
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={36}
              startAngle={90} endAngle={-270} strokeWidth={0}>
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
  const isDebtTrap = analysis.months >= 84;
  const isLongLoan = analysis.months >= 60 && !isDebtTrap;

  return (
    <div className="space-y-4">

      {/* Top Summary Bar */}
      <div className="rounded-2xl p-4 text-center"
        style={{ background: 'rgba(255,255,255,0.03)', boxShadow: 'var(--anchor-shadow-1)' }}>
        <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Total månadskostnad</p>
        <p className="text-3xl font-black text-white">{fmt(analysis.totalMonthlyCost)} kr/mån</p>
        <p className="text-xs text-slate-500 mt-1">inkl. lån ({fmt(analysis.monthlyLoan)} kr) + drift ({fmt(analysis.monthlyRunning)} kr)</p>
      </div>

      {/* Header: CFO Score + Verdict */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${verdictColor}44` }}>
        <div className="p-4" style={{ background: `linear-gradient(135deg, ${verdictColor}11 0%, rgba(0,0,0,0) 100%)` }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                {analysis.vehicleName || 'Fordon'}
              </p>
              <h2 className="text-xl font-black text-white">{fmt(analysis.price)} kr</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Insats: {analysis.downPaymentPct}% = {fmt(analysis.downPaymentAmount)} kr · Lån: {fmt(analysis.loanAmount)} kr · {analysis.interestRate}%
              </p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold"
                style={{ background: `${verdictColor}22`, color: verdictColor, border: `1px solid ${verdictColor}44` }}>
                {analysis.cfo_verdict}
              </div>
            </div>
            <SafetyGauge score={analysis.cfo_score} />
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="rounded-xl p-3 text-sm text-slate-300 leading-relaxed"
            style={{ background: 'rgba(0,0,0,0.3)', boxShadow: 'var(--anchor-shadow-1)' }}>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 block mb-1">
              {analysis.cfo_score >= 7
                ? <span className="inline-flex items-center gap-1"><Medal className="w-3 h-3 text-amber-400" aria-hidden /> Gold Verdict</span>
                : analysis.cfo_score >= 5
                ? <span className="inline-flex items-center gap-1"><Medal className="w-3 h-3 text-slate-400" aria-hidden /> Silver Verdict</span>
                : <span className="inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-rose-400" aria-hidden /> Risk Alert</span>}
            </span>
            {analysis.cfo_recommendation}
          </div>
        </div>
      </div>

      {/* Debt Trap Warning */}
      {isDebtTrap && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl p-4"
          style={{ background: 'rgba(239,68,68,0.09)', border: '2px solid rgba(239,68,68,0.35)' }}>
          <p className="text-sm font-bold text-rose-400 mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Skuldfällevarning – {analysis.months} månader
          </p>
          <p className="text-xs text-rose-200">
            Lånetiden är längre än bilens beräknade värdebehållning. Du riskerar att ha kvar skulden när du säljer bilen och kan hamna "under vatten" – skulden överstiger bilens marknadsvärde.
          </p>
        </motion.div>
      )}

      {/* Underwater warning */}
      {analysis.isUnderwater && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl p-4"
          style={{ background: 'rgba(239,68,68,0.07)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <p className="text-xs font-bold text-rose-400 mb-1 inline-flex items-center gap-1"><Waves className="w-3.5 h-3.5" aria-hidden /> Under vatten vid halvtid</p>
          <p className="text-xs text-rose-200">
            Vid lånets mitt punkt: skuld <strong>{fmt(analysis.remainingDebt)} kr</strong> vs bilens värde <strong>{fmt(analysis.midResidualValue)} kr</strong>.
            Om du säljer bilen halvvägs kan du inte betala tillbaka lånet.
          </p>
        </motion.div>
      )}

      {/* Liquidity check */}
      {analysis.downPaymentAmount > 0 && analysis.currentBuffer > 0 && (
        <div className="rounded-xl p-4 flex gap-3 items-start"
          style={{ background: 'rgba(79, 174, 130, 0.07)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-indigo-400 mb-0.5">Likviditets-check</p>
            <p className="text-xs text-slate-300">
              Kontantinsatsen på {fmt(analysis.downPaymentAmount)} kr sänker din trygghet från{' '}
              <strong className="text-white">{analysis.bufferMonths.toFixed(1)} månader</strong> till{' '}
              <strong className={analysis.newBufferMonths < 1 ? 'text-rose-300' : analysis.newBufferMonths < 2 ? 'text-amber-300' : 'text-indigo-200'}>
                {analysis.newBufferMonths.toFixed(1)} månader
              </strong>.
              {analysis.newBufferMonths < 1 && (
                <span className="inline-flex items-center gap-1 ml-1"><AlertTriangle className="w-3 h-3" aria-hidden /> Kritiskt låg buffert!</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Monthly bite + numbers */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-3 flex flex-col items-center"
          style={{ background: 'rgba(17,24,39,0.6)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <MonthlyBitePie cost={analysis.totalMonthlyCost} margin={analysis.margin} />
        </div>
        <div className="rounded-2xl p-3 flex flex-col justify-center"
          style={{ background: 'rgba(17,24,39,0.6)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <p className="text-[10px] text-slate-500 mb-0.5">Total ränta</p>
          <p className="text-base font-black text-amber-400">{fmt(analysis.totalInterest)}</p>
          <p className="text-[10px] text-slate-600">kr att betala extra</p>
        </div>
        <div className="rounded-2xl p-3 flex flex-col justify-center"
          style={{ background: 'rgba(17,24,39,0.6)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <p className="text-[10px] text-slate-500 mb-0.5">Totalpris</p>
          <p className="text-base font-black text-white">{fmt(analysis.totalPaid)}</p>
          <p className="text-[10px] text-slate-600">kr inkl. insats</p>
        </div>
      </div>

      {/* Long loan twist */}
      {isLongLoan && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-xl p-4"
          style={{ background: 'rgba(245,158,11,0.07)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <p className="text-xs font-bold text-amber-400 mb-1 inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" aria-hidden /> The {analysis.months}-Month Twist</p>
          <p className="text-xs text-amber-200">
            Priset för bekvämlighet: <strong className="text-white">{fmt(analysis.interestExtra)} kr extra</strong> i ränta jämfört med 36 månader.
            Skulden hänger kvar längre än garantin.
          </p>
        </motion.div>
      )}

      {/* Depreciation vs Debt */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.07)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <div className="flex items-start gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Värdeminskning</p>
              <p className="text-xl font-black text-white mt-0.5">-{fmt(analysis.depreciation)} kr</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">Restvärde: <span className="text-white font-semibold">{fmt(analysis.residualValue)} kr</span></p>
        </div>

        <div className="rounded-2xl p-4" style={{ background: 'rgba(79, 174, 130, 0.07)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <div className="flex items-start gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Alternativkostnad</p>
              <p className="text-xl font-black text-white mt-0.5">+{fmt(analysis.opportunityCost)} kr</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">Vad kontantinsatsen gett på börsen (7%/år).</p>
        </div>
      </div>

      {/* Trade-off */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(17,24,39,0.6)', boxShadow: 'var(--anchor-shadow-1)' }}>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 inline-flex items-center gap-1"><Utensils className="w-3.5 h-3.5" aria-hidden /> Trade-off kalkylatorn</p>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex justify-between items-center">
            <span className="inline-flex items-center gap-1"><Salad className="w-3.5 h-3.5" aria-hidden /> Luncher ute (130 kr/st)</span>
            <span className="font-bold text-white">{fmt(analysis.lunchEquivalent)} st</span>
          </div>
          <div className="h-px bg-white/5" />
          <p className="text-slate-400 leading-relaxed italic">{analysis.contextual_story}</p>
        </div>
      </div>

      {/* Opportunity investment */}
      {analysis.opportunity_investment && (
        <div className="rounded-2xl p-4" style={{ background: 'rgba(16,185,129,0.06)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 inline-flex items-center gap-1"><LineChart className="w-3.5 h-3.5" aria-hidden /> Alternativet – Indexfond</p>
          <p className="text-xs text-slate-300">{analysis.opportunity_investment}</p>
          <p className="text-sm font-bold text-emerald-400 mt-2">
            {fmt(analysis.downPaymentAmount)} kr → {fmt(analysis.opportunityFinalValue)} kr
          </p>
        </div>
      )}

      {/* Better alternative */}
      {analysis.better_alternative && (
        <div className="rounded-xl p-3 flex gap-3 items-start"
          style={{ background: 'rgba(17,24,39,0.5)', boxShadow: 'var(--anchor-shadow-1)' }}>
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