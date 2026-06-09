import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Car, AlertTriangle, Building2, Wrench } from 'lucide-react';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Semi-circle gauge (reuse pattern from VehicleCFOReport)
function TaxGauge({ refund }) {
  // refund: negative = kvarskatt, positive = återbäring
  const MAX = 30000;
  const clamped = Math.max(-MAX, Math.min(MAX, refund));
  const pct = (clamped + MAX) / (2 * MAX); // 0..1, 0.5 = break-even
  const angle = -180 + pct * 180;
  const color = refund > 2000 ? '#10B981' : refund < -2000 ? '#EF4444' : '#F59E0B';
  const cx = 80, cy = 72, r = 60;
  const toRad = d => (d * Math.PI) / 180;

  const tracks = [
    { start: -180, end: -60, color: '#EF4444' },
    { start: -60, end: -30, color: '#F59E0B' },
    { start: -30, end: 0, color: '#10B981' },
  ];

  function arc(s, e) {
    const sx = cx + r * Math.cos(toRad(s)), sy = cy + r * Math.sin(toRad(s));
    const ex = cx + r * Math.cos(toRad(e)), ey = cy + r * Math.sin(toRad(e));
    return `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`;
  }

  const needleX = cx + (r - 10) * Math.cos(toRad(angle));
  const needleY = cy + (r - 10) * Math.sin(toRad(angle));

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="90" viewBox="0 0 160 90">
        {tracks.map(t => (
          <path key={t.start} d={arc(t.start, t.end)} fill="none"
            stroke={t.color} strokeWidth="10" strokeOpacity="0.2" strokeLinecap="round" />
        ))}
        <path d={arc(-180, angle)} fill="none"
          stroke={color} strokeWidth="10" strokeOpacity="0.85" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={needleX} y2={needleY}
          stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill={color} />
        <text x={3} y={85} fill="#EF4444" fontSize="8" fontWeight="600">Kvarskatt</text>
        <text x={110} y={85} fill="#10B981" fontSize="8" fontWeight="600">Återbäring</text>
      </svg>
      <div className="text-center -mt-1">
        <p className="text-[10px] text-slate-500">Beräknad {refund >= 0 ? 'återbäring' : 'kvarskatt'}</p>
        <motion.p key={refund}
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-black" style={{ color }}>
          {refund >= 0 ? '+' : ''}{fmt(refund)} kr
        </motion.p>
      </div>
    </div>
  );
}

export default function TaxOracle({ simulatedNet }) {
  const [kmPerDay, setKmPerDay] = useState(0);
  const [workDays, setWorkDays] = useState(220);
  const [interestCost, setInterestCost] = useState(0);
  const [rotRut, setRotRut] = useState(0);
  const income = simulatedNet || 30000;

  const calc = useMemo(() => {
    // Rough tax paid on income (30% or 32% approx)
    const taxPaid = Math.round(income * 12 * 0.30);

    // Travel deduction: >5 km each way, >2 km saved vs transit
    // Standard: 25 kr/mil, min 11 000 kr, max 50 000 kr
    const annualKm = kmPerDay * 2 * workDays;
    const travelDeduction = kmPerDay >= 5 ? Math.min(50000, Math.max(0, (annualKm / 10) * 25 - 11000)) : 0;
    const travelTaxReduction = Math.round(travelDeduction * 0.30);

    // Interest deduction: 30% of interest costs
    const annualInterest = interestCost * 12;
    const interestDeduction = Math.round(annualInterest * 0.30);

    // ROT/RUT direct reduction (max 50 000 kr)
    const rotRutReduction = Math.min(50000, rotRut);

    const totalReduction = travelTaxReduction + interestDeduction + rotRutReduction;

    // Simple heuristic: baseline ± adjustments
    // Assume baseline ~0 (properly withheld), deductions = refund
    const refund = totalReduction;

    return { travelDeduction, travelTaxReduction, interestDeduction, rotRutReduction, totalReduction, refund, annualKm };
  }, [income, kmPerDay, workDays, interestCost, rotRut]);

  return (
    <div className="rounded-2xl p-4 space-y-4"
      style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 className="font-bold text-white text-sm uppercase tracking-wider inline-flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-indigo-400" aria-hidden /> Skatte-Siaren</h3>

      <TaxGauge refund={calc.refund} />

      {/* Deductions */}
      <div className="space-y-3">
        {/* Travel */}
        <div className="rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold text-indigo-400 inline-flex items-center gap-1"><Car className="w-3.5 h-3.5" aria-hidden /> Reseavdrag</p>
            {calc.travelTaxReduction > 0 && (
              <span className="text-xs font-bold text-emerald-400">+{fmt(calc.travelTaxReduction)} kr</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] text-slate-500 mb-1">km enkel väg/dag</p>
              <input type="number" value={kmPerDay} onChange={e => setKmPerDay(Number(e.target.value))}
                className="w-full h-8 rounded-lg px-2 text-xs text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 mb-1">Arbetsdagar/år</p>
              <input type="number" value={workDays} onChange={e => setWorkDays(Number(e.target.value))}
                className="w-full h-8 rounded-lg px-2 text-xs text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </div>
          {kmPerDay > 0 && (
            <p className="text-[10px] text-slate-500 mt-1">{fmt(calc.annualKm)} km/år → avdrag {fmt(calc.travelDeduction)} kr</p>
          )}
          {kmPerDay > 0 && kmPerDay < 5 && (
            <p className="text-[10px] text-amber-400 mt-1 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" aria-hidden /> Kräver minst 5 km enkel väg</p>
          )}
        </div>

        {/* Interest */}
        <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold text-amber-400 inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5" aria-hidden /> Ränteavdrag (30%)</p>
            {calc.interestDeduction > 0 && (
              <span className="text-xs font-bold text-emerald-400">+{fmt(calc.interestDeduction)} kr</span>
            )}
          </div>
          <div>
            <p className="text-[10px] text-slate-500 mb-1">Räntekostnad/mån (kr)</p>
            <input type="number" value={interestCost} onChange={e => setInterestCost(Number(e.target.value))}
              placeholder="t.ex. 3500"
              className="w-full h-8 rounded-lg px-2 text-xs text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
        </div>

        {/* ROT/RUT */}
        <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold text-emerald-400 inline-flex items-center gap-1"><Wrench className="w-3.5 h-3.5" aria-hidden /> ROT / RUT</p>
            {calc.rotRutReduction > 0 && (
              <span className="text-xs font-bold text-emerald-400">+{fmt(calc.rotRutReduction)} kr</span>
            )}
          </div>
          <div>
            <p className="text-[10px] text-slate-500 mb-1">Utnyttjat belopp (kr, max 50 000)</p>
            <input type="number" value={rotRut} onChange={e => setRotRut(Math.min(50000, Number(e.target.value)))}
              placeholder="t.ex. 25000"
              className="w-full h-8 rounded-lg px-2 text-xs text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
        </div>
      </div>

      {/* Total */}
      {calc.totalReduction > 0 && (
        <div className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <p className="text-[10px] text-slate-500">Totala avdrag ger beräknad återbäring</p>
          <p className="text-xl font-black text-emerald-400">+{fmt(calc.totalReduction)} kr</p>
        </div>
      )}
    </div>
  );
}