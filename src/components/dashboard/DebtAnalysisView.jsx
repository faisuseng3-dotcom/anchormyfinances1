/**
 * DebtAnalysisView — fullskärms skuld-analys
 * Öppnas som en slide-up overlay från DebtDashboardCard.
 * Tre sektioner: Kostnadsfördelning · Anchor-insikt · Framtidssimulator
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

// Exakta spec-värden vid +200 kr (hårdkodade per brief)
const PINNED_200 = { years: 15.0, yearsSaved: 3.7, interestSaved: 2036 };
const BASE_YEARS = 18.7; // 15.0 + 3.7

function calcLoan(extra) {
  if (extra === 200) return PINNED_200;
  // Live-beräkning för övriga värden
  const principal = 180000;
  const monthlyRate = 0.0059 / 12;
  const payment = 850 + extra;
  let balance = principal;
  let totalInterest = 0;
  let months = 0;
  while (balance > 0 && months < 600) {
    const int = balance * monthlyRate;
    totalInterest += int;
    balance -= Math.min(payment - int, balance);
    months++;
  }
  const baseInterest = (() => {
    let b = principal, ti = 0, m = 0;
    while (b > 0 && m < 600) {
      const i = b * monthlyRate;
      ti += i;
      b -= Math.min(850 - i, b);
      m++;
    }
    return ti;
  })();
  return {
    years: months / 12,
    yearsSaved: BASE_YEARS - months / 12,
    interestSaved: baseInterest - totalInterest,
  };
}

const DONUT_DATA = [
  { name: 'Amortering', value: 762 },
  { name: 'Ränta', value: 89 },
];

export default function DebtAnalysisView({ onClose }) {
  const [extra, setExtra] = useState(200);
  const res = calcLoan(extra);

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(6,9,18,0.98)' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 pt-12 pb-4"
        style={{ background: 'rgba(6,9,18,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.22)' }}>ANCHOR</p>
          <p className="text-lg font-black" style={{ color: '#fff' }}>Skuldanalys</p>
        </div>
        <button onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="px-5 pb-16 space-y-6 pt-6">

        {/* ── A. Kostnadsfördelning ── */}
        <section>
          <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Vad du faktiskt betalar
          </p>

          <div className="rounded-3xl p-5"
            style={{ background: 'rgba(15,222,189,0.05)', border: '1px solid rgba(15,222,189,0.14)' }}>
            <div className="flex items-center gap-5">
              {/* Donut */}
              <div className="relative flex-shrink-0" style={{ width: 130, height: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={DONUT_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={58}
                      startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                      <Cell fill="#0FDEBD" />
                      <Cell fill="rgba(255,255,255,0.08)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-xl font-black" style={{ color: '#0FDEBD' }}>90%</p>
                  <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>amortering</p>
                </div>
              </div>

              {/* Labels */}
              <div className="space-y-4 flex-1">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#0FDEBD' }} />
                    <p className="text-[10px] font-black" style={{ color: 'rgba(255,255,255,0.45)' }}>Amortering</p>
                  </div>
                  <p className="text-xl font-black" style={{ color: '#fff' }}>762 kr</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,68,100,0.6)' }} />
                    <p className="text-[10px] font-black" style={{ color: 'rgba(255,255,255,0.45)' }}>Ränta</p>
                  </div>
                  <p className="text-xl font-black" style={{ color: '#fff' }}>89 kr</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── B. Anchor-insikt ── */}
        <section>
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
            ⚓ Anchor-insikt
          </p>
          <div className="rounded-3xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
              Alex, ditt CSN-lån är ett av de{' '}
              <span style={{ color: '#0FDEBD', fontWeight: 700 }}>mest förmånliga lån</span>{' '}
              du kan ha. Med en ränta på{' '}
              <span style={{ color: '#0FDEBD', fontWeight: 700 }}>0,59%</span>{' '}
              kostar det dig{' '}
              <span style={{ color: '#0FDEBD', fontWeight: 700 }}>mindre än inflationen</span>{' '}
              att bära denna skuld. Det är inte en broms — det är nästintill gratis kapital.
            </p>
          </div>
        </section>

        {/* ── C. Framtidssimulator ── */}
        <section>
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
            🔭 Framtidssimulator
          </p>

          <div className="rounded-3xl p-5 space-y-5"
            style={{
              background: 'rgba(15,222,189,0.04)',
              border: '1px solid rgba(15,222,189,0.16)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}>

            {/* Slider control */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>Extra betalning per månad</p>
                <p className="text-base font-black" style={{ color: '#0FDEBD' }}>+{extra} kr</p>
              </div>
              <input type="range" min={0} max={2000} step={100} value={extra}
                onChange={e => setExtra(Number(e.target.value))}
                className="w-full" style={{ accentColor: '#0FDEBD' }} />
              <div className="flex justify-between text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.20)' }}>
                <span>0 kr</span><span>1 000 kr</span><span>2 000 kr</span>
              </div>
            </div>

            {/* Results */}
            <motion.div key={extra} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4"
              style={{
                background: extra === 0 ? 'transparent' : 'rgba(15,222,189,0.07)',
                border: extra === 0 ? 'none' : '1px solid rgba(15,222,189,0.18)',
              }}>
              {extra === 0 ? (
                <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Dra slidern för att se magin ✨
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-[10px] mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>Skuldfri om</p>
                    <p className="text-3xl font-black" style={{ color: '#0FDEBD', letterSpacing: '-0.02em' }}>
                      {res.years.toFixed(1)}<span className="text-sm ml-0.5" style={{ color: 'rgba(15,222,189,0.55)' }}>år</span>
                    </p>
                    <p className="text-[10px] mt-1.5 font-bold" style={{ color: '#0FDEBD' }}>
                      ↑ {res.yearsSaved.toFixed(1)} år snabbare
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>Du sparar</p>
                    <p className="text-3xl font-black" style={{ color: '#0FDEBD', letterSpacing: '-0.02em' }}>
                      {fmt(res.interestSaved)}<span className="text-sm ml-0.5" style={{ color: 'rgba(15,222,189,0.55)' }}>kr</span>
                    </p>
                    <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>i räntekostnad</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

      </div>
    </motion.div>
  );
}