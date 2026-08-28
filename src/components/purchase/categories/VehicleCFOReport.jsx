import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, AlertTriangle, Shield, Zap, Waves, Utensils, Salad, Clock, LineChart } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import PurchaseVerdictCard from '@/components/purchase/PurchaseVerdictCard';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function MonthlyBitePie({ cost, margin }) {
  const pct = Math.min(cost / margin, 1);
  const data = [
    { value: pct, color: pct > 0.35 ? 'var(--color-danger)' : pct > 0.2 ? 'var(--color-warning)' : 'var(--color-accent)' },
    { value: 1 - pct, color: 'var(--color-background-secondary)' },
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
          <span className="text-xs font-bold text-[var(--color-text-primary)]">{Math.round(pct * 100)}%</span>
        </div>
      </div>
      <p className="text-[10px] text-[var(--color-text-secondary)] mt-1 text-center">av din lön</p>
    </div>
  );
}

export default function VehicleCFOReport({ analysis }) {
  const isDebtTrap = analysis.months >= 84;
  const isLongLoan = analysis.months >= 60 && !isDebtTrap;

  return (
    <div className="space-y-4">

      {/* Top Summary Bar */}
      <div className="rounded-2xl p-4 text-center bg-white border border-[var(--color-border)]"
        style={{ boxShadow: 'var(--anchor-shadow-1)' }}>
        <p className="text-xs text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Total månadskostnad</p>
        <p className="text-3xl font-black text-[var(--color-text-primary)]">{fmt(analysis.totalMonthlyCost)} kr/mån</p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">inkl. lån ({fmt(analysis.monthlyLoan)} kr) + drift ({fmt(analysis.monthlyRunning)} kr)</p>
      </div>

      {/* Header: fordon + deterministisk köpverdikt */}
      <div>
        <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold mb-1">
          {analysis.vehicleName || 'Fordon'}
        </p>
        <h2 className="text-xl font-black text-[var(--color-text-primary)]">{fmt(analysis.price)} kr</h2>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 mb-3">
          Insats: {analysis.downPaymentPct}% = {fmt(analysis.downPaymentAmount)} kr · Lån: {fmt(analysis.loanAmount)} kr · {analysis.interestRate}%
        </p>
        <PurchaseVerdictCard price={analysis.downPaymentAmount} priceLabel="Kontantinsats" impact={analysis.impact} bestDate={analysis.bestDate} />
        {analysis.cfo_recommendation && (
          <div className="rounded-xl p-3 mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-background-secondary)]"
            style={{ boxShadow: 'var(--anchor-shadow-1)' }}>
            {analysis.cfo_recommendation}
          </div>
        )}
      </div>

      {/* Debt Trap Warning */}
      {isDebtTrap && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl p-4"
          style={{ background: 'var(--color-danger-soft)', border: '1px solid var(--color-danger)' }}>
          <p className="text-sm font-bold text-[var(--color-danger)] mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Skuldfällevarning – {analysis.months} månader
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Lånetiden är längre än bilens beräknade värdebehållning. Du riskerar att ha kvar skulden när du säljer bilen och kan hamna "under vatten" – skulden överstiger bilens marknadsvärde.
          </p>
        </motion.div>
      )}

      {/* Underwater warning */}
      {analysis.isUnderwater && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl p-4"
          style={{ background: 'var(--color-danger-soft)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <p className="text-xs font-bold text-[var(--color-danger)] mb-1 inline-flex items-center gap-1"><Waves className="w-3.5 h-3.5" aria-hidden /> Under vatten vid halvtid</p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Vid lånets mitt punkt: skuld <strong>{fmt(analysis.remainingDebt)} kr</strong> vs bilens värde <strong>{fmt(analysis.midResidualValue)} kr</strong>.
            Om du säljer bilen halvvägs kan du inte betala tillbaka lånet.
          </p>
        </motion.div>
      )}

      {/* Liquidity check */}
      {analysis.downPaymentAmount > 0 && analysis.currentBuffer > 0 && (
        <div className="rounded-xl p-4 flex gap-3 items-start"
          style={{ background: 'var(--color-success-soft)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <Shield className="w-4 h-4 text-[var(--color-success)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-[var(--color-success)] mb-0.5">Likviditets-check</p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Kontantinsatsen på {fmt(analysis.downPaymentAmount)} kr sänker din trygghet från{' '}
              <strong className="text-[var(--color-text-primary)]">{analysis.bufferMonths.toFixed(1)} månader</strong> till{' '}
              <strong className={analysis.newBufferMonths < 1 ? 'text-[var(--color-danger)]' : analysis.newBufferMonths < 2 ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}>
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
        <div className="rounded-2xl p-3 flex flex-col items-center bg-white border border-[var(--color-border)]"
          style={{ boxShadow: 'var(--anchor-shadow-1)' }}>
          <MonthlyBitePie cost={analysis.totalMonthlyCost} margin={analysis.margin} />
        </div>
        <div className="rounded-2xl p-3 flex flex-col justify-center bg-white border border-[var(--color-border)]"
          style={{ boxShadow: 'var(--anchor-shadow-1)' }}>
          <p className="text-[10px] text-[var(--color-text-secondary)] mb-0.5">Total ränta</p>
          <p className="text-base font-black text-[var(--color-warning)]">{fmt(analysis.totalInterest)}</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">kr att betala extra</p>
        </div>
        <div className="rounded-2xl p-3 flex flex-col justify-center bg-white border border-[var(--color-border)]"
          style={{ boxShadow: 'var(--anchor-shadow-1)' }}>
          <p className="text-[10px] text-[var(--color-text-secondary)] mb-0.5">Totalpris</p>
          <p className="text-base font-black text-[var(--color-text-primary)]">{fmt(analysis.totalPaid)}</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">kr inkl. insats</p>
        </div>
      </div>

      {/* Long loan twist */}
      {isLongLoan && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-xl p-4"
          style={{ background: 'var(--color-warning-soft)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <p className="text-xs font-bold text-[var(--color-warning)] mb-1 inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" aria-hidden /> The {analysis.months}-Month Twist</p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Priset för bekvämlighet: <strong className="text-[var(--color-text-primary)]">{fmt(analysis.interestExtra)} kr extra</strong> i ränta jämfört med 36 månader.
            Skulden hänger kvar längre än garantin.
          </p>
        </motion.div>
      )}

      {/* Depreciation vs Debt */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ background: 'var(--color-danger-soft)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <div className="flex items-start gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-[var(--color-danger)] uppercase tracking-wider">Värdeminskning</p>
              <p className="text-xl font-black text-[var(--color-text-primary)] mt-0.5">-{fmt(analysis.depreciation)} kr</p>
            </div>
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">Restvärde: <span className="text-[var(--color-text-primary)] font-semibold">{fmt(analysis.residualValue)} kr</span></p>
        </div>

        <div className="rounded-2xl p-4" style={{ background: 'var(--color-success-soft)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <div className="flex items-start gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[var(--color-success)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-[var(--color-success)] uppercase tracking-wider">Alternativkostnad</p>
              <p className="text-xl font-black text-[var(--color-text-primary)] mt-0.5">+{fmt(analysis.opportunityCost)} kr</p>
            </div>
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">Vad kontantinsatsen gett på börsen (7%/år).</p>
        </div>
      </div>

      {/* Trade-off */}
      <div className="rounded-2xl p-4 bg-white border border-[var(--color-border)]" style={{ boxShadow: 'var(--anchor-shadow-1)' }}>
        <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 inline-flex items-center gap-1"><Utensils className="w-3.5 h-3.5" aria-hidden /> Trade-off kalkylatorn</p>
        <div className="space-y-2 text-xs text-[var(--color-text-secondary)]">
          <div className="flex justify-between items-center">
            <span className="inline-flex items-center gap-1"><Salad className="w-3.5 h-3.5" aria-hidden /> Luncher ute (130 kr/st)</span>
            <span className="font-bold text-[var(--color-text-primary)]">{fmt(analysis.lunchEquivalent)} st</span>
          </div>
          <div className="h-px bg-[var(--color-border)]" />
          <p className="text-[var(--color-text-secondary)] leading-relaxed italic">{analysis.contextual_story}</p>
        </div>
      </div>

      {/* Opportunity investment */}
      {analysis.opportunity_investment && (
        <div className="rounded-2xl p-4" style={{ background: 'var(--color-success-soft)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <p className="text-xs font-bold text-[var(--color-success)] uppercase tracking-wider mb-1 inline-flex items-center gap-1"><LineChart className="w-3.5 h-3.5" aria-hidden /> Alternativet – Indexfond</p>
          <p className="text-xs text-[var(--color-text-secondary)]">{analysis.opportunity_investment}</p>
          <p className="text-sm font-bold text-[var(--color-success)] mt-2">
            {fmt(analysis.downPaymentAmount)} kr → {fmt(analysis.opportunityFinalValue)} kr
          </p>
        </div>
      )}

      {/* Better alternative */}
      {analysis.better_alternative && (
        <div className="rounded-xl p-3 flex gap-3 items-start bg-[var(--color-accent-soft)]">
          <Zap className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-[var(--color-accent)] mb-0.5">Smartare alternativ</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{analysis.better_alternative}</p>
          </div>
        </div>
      )}
    </div>
  );
}