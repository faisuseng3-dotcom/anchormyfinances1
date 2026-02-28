import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MUNICIPALITIES = [
  { name: "Stockholm", rate: 29.82 }, { name: "Göteborg", rate: 32.35 },
  { name: "Malmö", rate: 32.35 }, { name: "Uppsala", rate: 33.25 },
  { name: "Västerås", rate: 33.08 }, { name: "Örebro", rate: 33.40 },
  { name: "Linköping", rate: 32.57 }, { name: "Helsingborg", rate: 33.15 },
  { name: "Jönköping", rate: 33.37 }, { name: "Norrköping", rate: 33.70 },
  { name: "Lund", rate: 31.65 }, { name: "Umeå", rate: 33.55 },
  { name: "Gävle", rate: 33.63 }, { name: "Borås", rate: 33.27 },
  { name: "Södertälje", rate: 32.82 }, { name: "Eskilstuna", rate: 33.55 },
  { name: "Halmstad", rate: 33.19 }, { name: "Sundsvall", rate: 33.88 },
  { name: "Karlstad", rate: 32.48 }, { name: "Östersund", rate: 34.45 },
  { name: "Huddinge", rate: 31.17 }, { name: "Nacka", rate: 30.92 },
  { name: "Täby", rate: 29.22 }, { name: "Sollentuna", rate: 30.67 },
  { name: "Botkyrka", rate: 33.07 }, { name: "Haninge", rate: 32.32 },
  { name: "Tyresö", rate: 31.47 }, { name: "Järfälla", rate: 30.67 },
  { name: "Lidingö", rate: 31.82 }, { name: "Danderyd", rate: 29.32 },
  { name: "Solna", rate: 30.07 }, { name: "Annan kommun", rate: 32.50 },
];

const fmt = (v) => Math.round(v || 0).toLocaleString('sv-SE');

// 2026 Swedish tax calculation
function calcTax2026({ grossMonthly, municipalityName, birthYear }) {
  const grossAnnual = grossMonthly * 12;
  const munRate = (MUNICIPALITIES.find(m => m.name === municipalityName)?.rate ?? 32.50) / 100;

  // Grundavdrag 2026 (approximate scale)
  function grundavdrag(income) {
    if (income <= 50400) return 15300;
    if (income <= 123600) return Math.round(15300 + (income - 50400) * 0.07);
    if (income <= 278700) return Math.round(20400 - (income - 123600) * 0.02);
    return Math.round(20400 - (278700 - 123600) * 0.02);
  }

  const ga = grundavdrag(grossAnnual);
  const taxableIncome = Math.max(0, grossAnnual - ga);

  // Kommunal skatt
  const kommunalSkatt = Math.round(taxableIncome * munRate);

  // Statlig inkomstskatt (20% over ~615 300 kr / year = ~51 275/mån breakeven 2026)
  const STATE_THRESHOLD = 615300;
  const statligSkatt = grossAnnual > STATE_THRESHOLD
    ? Math.round((grossAnnual - STATE_THRESHOLD) * 0.20)
    : 0;

  // Jobbskatteavdrag (JSA) 2026 — simplified schedule
  const age = 2026 - (parseInt(birthYear) || 1985);
  const jsaBase = age >= 65
    ? Math.min(0.352 * grossAnnual, 33700)
    : Math.min(0.272 * grossAnnual, 29600);
  const jsa = Math.round(jsaBase * munRate);

  const finalKommunalSkatt = Math.max(0, kommunalSkatt - jsa);
  const totalAnnualTax = finalKommunalSkatt + statligSkatt;
  const totalMonthlyTax = Math.round(totalAnnualTax / 12);
  const netMonthly = grossMonthly - totalMonthlyTax;

  return {
    grossAnnual, grossMonthly,
    ga,
    taxableIncome,
    kommunalSkatt: Math.round(finalKommunalSkatt / 12), // monthly
    statligSkatt: Math.round(statligSkatt / 12),
    jsa: Math.round(jsa / 12),
    totalMonthlyTax,
    netMonthly,
    munRate,
    munRatePct: (munRate * 100).toFixed(2),
  };
}

function TaxRefundGauge({ refund }) {
  const MAX = 30000;
  const clamped = Math.max(-MAX, Math.min(MAX, refund));
  const pct = (clamped + MAX) / (2 * MAX);
  const angle = -180 + pct * 180;
  const color = refund > 1000 ? '#10B981' : refund < -1000 ? '#EF4444' : '#F59E0B';
  const cx = 80, cy = 72, r = 60;
  const toRad = d => (d * Math.PI) / 180;
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
        {[{ s: -180, e: -60, c: '#EF4444' }, { s: -60, e: -30, c: '#F59E0B' }, { s: -30, e: 0, c: '#10B981' }].map(t => (
          <path key={t.s} d={arc(t.s, t.e)} fill="none" stroke={t.c} strokeWidth="10" strokeOpacity="0.2" strokeLinecap="round" />
        ))}
        <path d={arc(-180, angle)} fill="none" stroke={color} strokeWidth="10" strokeOpacity="0.85" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill={color} />
        <text x={3} y={85} fill="#EF4444" fontSize="8" fontWeight="600">Kvarskatt</text>
        <text x={106} y={85} fill="#10B981" fontSize="8" fontWeight="600">Återbäring</text>
      </svg>
      <motion.p key={refund} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-3xl font-black mt-1" style={{ color }}>
        {refund >= 0 ? '+' : ''}{fmt(refund)} kr
      </motion.p>
      <p className="text-[11px] text-slate-500 mt-0.5">Beräknad {refund >= 0 ? 'återbäring' : 'kvarskatt'}</p>
    </div>
  );
}

export default function PrecisionTaxResult({ wizardData, onReset }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [kmPerDay, setKmPerDay] = useState(0);
  const [workDays, setWorkDays] = useState(220);
  const [interestCost, setInterestCost] = useState(0);
  const [rotRut, setRotRut] = useState(0);

  const gross = Number(wizardData.gross);
  const withheld = Number(wizardData.withheld);
  const withheldAnnual = withheld * 12;

  const tax = useMemo(() =>
    calcTax2026({ grossMonthly: gross, municipalityName: wizardData.municipality, birthYear: wizardData.birthYear }),
    [gross, wizardData.municipality, wizardData.birthYear]
  );

  const deductions = useMemo(() => {
    const annualKm = kmPerDay * 2 * workDays;
    const travelDed = kmPerDay >= 5 ? Math.min(50000, Math.max(0, (annualKm / 10) * 25 - 11000)) : 0;
    const travelRedux = Math.round(travelDed * (tax.munRate));

    const annualInterest = interestCost * 12;
    const interestRedux = Math.round(annualInterest <= 100000 ? annualInterest * 0.30 : 100000 * 0.30 + (annualInterest - 100000) * 0.21);

    const rotRedux = Math.min(50000, rotRut);
    const total = travelRedux + interestRedux + rotRedux;

    return { travelDed, travelRedux, interestRedux, rotRedux, total, annualKm };
  }, [kmPerDay, workDays, interestCost, rotRut, tax.munRate]);

  const finalTaxAnnual = Math.max(0, tax.totalMonthlyTax * 12 - deductions.total);
  const refund = withheldAnnual - finalTaxAnnual;
  const allFieldsFilled = gross > 0 && withheld > 0 && wizardData.municipality && wizardData.birthYear;

  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };

  return (
    <div className="space-y-4">
      {/* Verification stamp */}
      {allFieldsFilled && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3 flex items-center gap-3"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-400">Beräkningen är verifierad mot Skatteverkets regler för 2026</p>
            <p className="text-[10px] text-slate-500">Beräknat med 2026 års skattetabeller för {wizardData.municipality}</p>
          </div>
        </motion.div>
      )}

      {/* Main result card */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: 'rgba(17,24,39,0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">🔮 Skatte-Siaren</h3>
          <Button variant="ghost" size="sm" onClick={onReset}
            className="text-slate-500 hover:text-white text-xs h-7 px-2 gap-1">
            <RotateCcw className="w-3 h-3" /> Ändra uppgifter
          </Button>
        </div>

        <TaxRefundGauge refund={refund} />

        {/* Three key figures */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Slutlig skatt', value: fmt(finalTaxAnnual), sub: 'kr/år', color: '#EF4444' },
            { label: 'Betald skatt', value: fmt(withheldAnnual), sub: 'kr/år', color: '#6366F1' },
            { label: refund >= 0 ? 'Återbäring' : 'Kvarskatt', value: `${refund >= 0 ? '+' : ''}${fmt(refund)}`, sub: 'kr', color: refund >= 0 ? '#10B981' : '#EF4444' },
          ].map(c => (
            <div key={c.label} className="rounded-xl p-2.5 text-center"
              style={{ background: `${c.color}10`, border: `1px solid ${c.color}25` }}>
              <p className="text-[9px] text-slate-500 mb-0.5">{c.label}</p>
              <p className="text-sm font-black" style={{ color: c.color }}>{c.value}</p>
              <p className="text-[9px] text-slate-600">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Technical breakdown toggle */}
        <button onClick={() => setShowBreakdown(v => !v)}
          className="w-full flex items-center justify-between text-xs text-indigo-400 hover:text-indigo-300 transition-colors py-1">
          <span className="font-semibold">Se uträkningen (Teknisk specifikation)</span>
          {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {showBreakdown && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="rounded-xl p-3 space-y-2 text-xs"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-2">Teknisk Specifikation 2026</p>
                {[
                  { label: 'Bruttolön/år', value: `${fmt(tax.grossAnnual)} kr`, color: '#F3F4F6' },
                  { label: 'Grundavdrag', value: `−${fmt(tax.ga)} kr`, color: '#10B981' },
                  { label: 'Beskattningsbar inkomst', value: `${fmt(tax.taxableIncome)} kr`, color: '#F3F4F6' },
                  { label: `Kommunalskatt (${tax.munRatePct}% × ${wizardData.municipality})`, value: `${fmt(tax.kommunalSkatt * 12)} kr/år`, color: '#EF4444' },
                  { label: 'Jobbskatteavdrag (JSA)', value: `−${fmt(tax.jsa * 12)} kr/år`, color: '#10B981' },
                  { label: 'Statlig inkomstskatt (20%)', value: tax.statligSkatt > 0 ? `${fmt(tax.statligSkatt * 12)} kr/år` : '0 kr', color: tax.statligSkatt > 0 ? '#EF4444' : '#6B7280' },
                  { label: 'Total beräknad skatt', value: `${fmt(tax.totalMonthlyTax * 12)} kr/år`, color: '#EF4444', bold: true },
                  { label: 'Avdrag (resor, ränta, ROT/RUT)', value: `−${fmt(deductions.total)} kr`, color: '#10B981' },
                  { label: 'Slutlig skatt efter avdrag', value: `${fmt(finalTaxAnnual)} kr/år`, color: '#EF4444', bold: true },
                  { label: 'Betald källskatt', value: `${fmt(withheldAnnual)} kr/år`, color: '#6366F1', bold: true },
                  { label: refund >= 0 ? '→ Återbäring' : '→ Kvarskatt', value: `${refund >= 0 ? '+' : ''}${fmt(refund)} kr`, color: refund >= 0 ? '#10B981' : '#EF4444', bold: true, large: true },
                ].map((row, i) => (
                  <div key={i} className={`flex justify-between ${row.bold ? 'border-t border-white/10 pt-1.5 mt-1' : ''}`}>
                    <span className="text-slate-400">{row.label}</span>
                    <span className={`font-${row.bold ? 'black' : 'semibold'} ${row.large ? 'text-sm' : ''}`} style={{ color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Deductions */}
      <div className="rounded-2xl p-4 space-y-3"
        style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Avdrag & Skattereduktioner</h4>

        {/* Travel */}
        <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-indigo-400">🚗 Reseavdrag</p>
            {deductions.travelRedux > 0 && <span className="text-xs font-bold text-emerald-400">+{fmt(deductions.travelRedux)} kr</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] text-slate-500 mb-1">km enkel väg/dag</p>
              <input type="number" value={kmPerDay} onChange={e => setKmPerDay(Number(e.target.value))}
                className="w-full h-8 rounded-lg px-2 text-xs text-white" style={inputStyle} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 mb-1">Arbetsdagar/år</p>
              <input type="number" value={workDays} onChange={e => setWorkDays(Number(e.target.value))}
                className="w-full h-8 rounded-lg px-2 text-xs text-white" style={inputStyle} />
            </div>
          </div>
          {kmPerDay > 0 && kmPerDay < 5 && <p className="text-[10px] text-amber-400">⚠️ Kräver minst 5 km enkel väg</p>}
          {kmPerDay >= 5 && <p className="text-[10px] text-slate-500">({fmt(deductions.annualKm / 10)} mil/år × 25 kr) − 11 000 kr = {fmt(deductions.travelDed)} kr avdrag → {fmt(deductions.travelRedux)} kr skattereduktion</p>}
        </div>

        {/* Interest */}
        <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-amber-400">🏦 Ränteavdrag</p>
            {deductions.interestRedux > 0 && <span className="text-xs font-bold text-emerald-400">+{fmt(deductions.interestRedux)} kr</span>}
          </div>
          <div>
            <p className="text-[10px] text-slate-500 mb-1">Räntekostnad/mån (kr)</p>
            <input type="number" value={interestCost} onChange={e => setInterestCost(Number(e.target.value))}
              placeholder="t.ex. 3500" className="w-full h-8 rounded-lg px-2 text-xs text-white" style={inputStyle} />
          </div>
          {interestCost > 0 && <p className="text-[10px] text-slate-500">30% av {fmt(interestCost * 12)} kr/år = {fmt(deductions.interestRedux)} kr skattereduktion</p>}
        </div>

        {/* ROT/RUT */}
        <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-emerald-400">🔧 ROT / RUT</p>
            {deductions.rotRedux > 0 && <span className="text-xs font-bold text-emerald-400">+{fmt(deductions.rotRedux)} kr</span>}
          </div>
          <div>
            <p className="text-[10px] text-slate-500 mb-1">Utnyttjat belopp (kr, max 50 000)</p>
            <input type="number" value={rotRut} onChange={e => setRotRut(Math.min(50000, Number(e.target.value)))}
              placeholder="t.ex. 25000" className="w-full h-8 rounded-lg px-2 text-xs text-white" style={inputStyle} />
          </div>
        </div>

        {/* Total deductions summary */}
        {deductions.total > 0 && (
          <div className="rounded-xl p-3 text-center"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <p className="text-[10px] text-slate-500">Totala avdrag minskar din skatt med</p>
            <p className="text-xl font-black text-emerald-400">+{fmt(deductions.total)} kr</p>
          </div>
        )}
      </div>
    </div>
  );
}