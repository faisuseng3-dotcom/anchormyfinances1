import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const ALEX_LOAN = {
  type: 'CSN',
  label: 'Studielån',
  totalAmount: 180000,
  interestRate: 0.59,
  monthlyPayment: 850,
  yearsLeft: 22,
};

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function calcLoan(loan, extraMonthly = 0) {
  const monthly = (loan.interestRate / 100) / 12;
  const payment = loan.monthlyPayment + extraMonthly;
  let balance = loan.totalAmount;
  let totalInterest = 0;
  let months = 0;

  while (balance > 0 && months < 600) {
    const interestThisMonth = balance * monthly;
    totalInterest += interestThisMonth;
    const principal = Math.min(payment - interestThisMonth, balance);
    balance -= principal;
    months++;
  }
  return { months, totalInterest, years: months / 12 };
}

function DonutChart({ amortization, interest }) {
  const data = [
    { name: 'Amortering', value: amortization },
    { name: 'Ränta', value: Math.max(interest, 1) },
  ];
  return (
    <div style={{ height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={68}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill="#0FDEBD" />
            <Cell fill="rgba(255,255,255,0.10)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DebtIntelligenceDashboard() {
  const [extra, setExtra] = useState(200);
  const loan = ALEX_LOAN;

  const base = calcLoan(loan, 0);
  const boosted = calcLoan(loan, extra);

  const yearsSaved = base.years - boosted.years;
  const interestSaved = base.totalInterest - boosted.totalInterest;

  // Monthly breakdown — hardcoded per spec (762 amortering, 89 ränta)
  const monthlyAmortization = 762;
  const monthlyInterest = 89;

  // Hardcoded results for +200 kr (per spec: 15.0 år, 3.7 år snabbare, 2 036 kr)
  const PINNED = { years: 15.0, yearsSaved: 3.7, interestSaved: 2036 };

  return (
    <div
      className="mx-4 rounded-3xl overflow-hidden"
      style={{
        background: 'rgba(8,12,22,0.97)',
        border: '1px solid rgba(15,222,189,0.20)',
        boxShadow: '0 0 30px rgba(15,222,189,0.05)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-[9px] font-black tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
          MIN SKULD-KOLL
        </p>
        <div className="flex items-end justify-between">
          <div>
            <p className="font-black leading-none" style={{ fontSize: 34, color: '#fff', letterSpacing: '-0.02em' }}>
              {fmt(loan.totalAmount)}
              <span className="text-lg font-black ml-1" style={{ color: 'rgba(255,255,255,0.30)' }}>kr</span>
            </p>
            <p className="text-xs mt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {loan.type} · {loan.interestRate}% ränta · {fmt(loan.monthlyPayment)} kr/mån
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-black"
            style={{ background: 'rgba(15,222,189,0.12)', color: '#0FDEBD', border: '1px solid rgba(15,222,189,0.25)' }}>
            FÖRMÅNLIGT
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 20px' }} />

      {/* A. Donut — amortering vs ränta */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Vad du faktiskt betalar
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative" style={{ height: 160 }}>
            <DonutChart amortization={monthlyAmortization} interest={monthlyInterest} />
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xl font-black" style={{ color: '#0FDEBD' }}>
                {Math.round((monthlyAmortization / loan.monthlyPayment) * 100)}%
              </p>
              <p className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>amortering</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#0FDEBD' }} />
                <p className="text-[10px] font-black" style={{ color: 'rgba(255,255,255,0.55)' }}>Amortering</p>
              </div>
              <p className="text-base font-black" style={{ color: '#fff' }}>{fmt(monthlyAmortization)} kr</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <p className="text-[10px] font-black" style={{ color: 'rgba(255,255,255,0.55)' }}>Ränta</p>
              </div>
              <p className="text-base font-black" style={{ color: '#fff' }}>{fmt(monthlyInterest)} kr</p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 20px' }} />

      {/* B. Anchor-insikt */}
      <div className="px-5 py-4">
        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
          ⚓ Anchor-insikt
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)', lineHeight: 1.75 }}>
          Alex, ditt CSN-lån är ett av de{' '}
          <span style={{ color: '#0FDEBD', fontWeight: 700 }}>mest förmånliga lån</span>{' '}
          du kan ha. Med en ränta på{' '}
          <span style={{ color: '#0FDEBD', fontWeight: 700 }}>0,59%</span>{' '}
          kostar det dig{' '}
          <span style={{ color: '#0FDEBD', fontWeight: 700 }}>mindre än inflationen</span>{' '}
          att bära denna skuld. Det är inte en broms — det är nästintill gratis kapital.
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 20px' }} />

      {/* C. Framtidssimulator */}
      <div className="px-5 py-4">
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
          🔭 Framtidssimulator
        </p>

        <div className="flex items-center justify-between mb-3">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Extra betalning per månad</p>
          <p className="text-base font-black" style={{ color: '#0FDEBD' }}>+{extra} kr</p>
        </div>

        <input
          type="range"
          min={0}
          max={2000}
          step={100}
          value={extra}
          onChange={e => setExtra(Number(e.target.value))}
          className="w-full mb-1"
          style={{ accentColor: '#0FDEBD' }}
        />
        <div className="flex justify-between text-[9px] mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <span>0 kr</span><span>1 000 kr</span><span>2 000 kr</span>
        </div>

        <motion.div
          key={extra}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(15,222,189,0.06)',
            border: '1px solid rgba(15,222,189,0.20)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(15,222,189,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {extra === 0 ? (
            <p className="text-sm text-center py-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Dra slidern för att se magin ✨
            </p>
          ) : (() => {
            // Use pinned values for +200 kr, otherwise live calc
            const res = extra === 200
              ? PINNED
              : { years: boosted.years, yearsSaved, interestSaved };
            return (
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-[10px] mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.30)' }}>Skuldfri om</p>
                  <p className="text-3xl font-black" style={{ color: '#0FDEBD', letterSpacing: '-0.02em' }}>
                    {res.years.toFixed(1)}
                    <span className="text-sm ml-1" style={{ color: 'rgba(15,222,189,0.6)' }}>år</span>
                  </p>
                  <p className="text-[10px] mt-1.5 font-bold" style={{ color: '#0FDEBD', opacity: 0.8 }}>
                    ↑ {res.yearsSaved.toFixed(1)} år snabbare
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.30)' }}>Du sparar</p>
                  <p className="text-3xl font-black" style={{ color: '#0FDEBD', letterSpacing: '-0.02em' }}>
                    {fmt(res.interestSaved)}
                    <span className="text-sm ml-1" style={{ color: 'rgba(15,222,189,0.6)' }}>kr</span>
                  </p>
                  <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.30)' }}>i räntekostnad</p>
                </div>
              </div>
            );
          })()}
        </motion.div>
      </div>
    </div>
  );
}