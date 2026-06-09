import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, AlertTriangle, CheckCircle2, FileText, Building2, Cake } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Swedish municipalities 2026 tax rates (kommunalskatt + landsting/region)
const MUNICIPALITIES = [
  { name: "Stockholm", rate: 29.82 },
  { name: "Göteborg", rate: 32.35 },
  { name: "Malmö", rate: 32.35 },
  { name: "Uppsala", rate: 33.25 },
  { name: "Västerås", rate: 33.08 },
  { name: "Örebro", rate: 33.40 },
  { name: "Linköping", rate: 32.57 },
  { name: "Helsingborg", rate: 33.15 },
  { name: "Jönköping", rate: 33.37 },
  { name: "Norrköping", rate: 33.70 },
  { name: "Lund", rate: 31.65 },
  { name: "Umeå", rate: 33.55 },
  { name: "Gävle", rate: 33.63 },
  { name: "Borås", rate: 33.27 },
  { name: "Södertälje", rate: 32.82 },
  { name: "Eskilstuna", rate: 33.55 },
  { name: "Halmstad", rate: 33.19 },
  { name: "Sundsvall", rate: 33.88 },
  { name: "Karlstad", rate: 32.48 },
  { name: "Östersund", rate: 34.45 },
  { name: "Huddinge", rate: 31.17 },
  { name: "Nacka", rate: 30.92 },
  { name: "Täby", rate: 29.22 },
  { name: "Sollentuna", rate: 30.67 },
  { name: "Botkyrka", rate: 33.07 },
  { name: "Haninge", rate: 32.32 },
  { name: "Tyresö", rate: 31.47 },
  { name: "Järfälla", rate: 30.67 },
  { name: "Lidingö", rate: 31.82 },
  { name: "Danderyd", rate: 29.32 },
  { name: "Solna", rate: 30.07 },
  { name: "Annan kommun", rate: 32.50 },
];

function StepIndicator({ step, total }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < step ? 'bg-indigo-500' : i === step - 1 ? 'bg-indigo-400' : 'bg-white/10'}`} />
      ))}
    </div>
  );
}

export default function PrecisionWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ gross: '', withheld: '', municipality: '', birthYear: '' });
  const [warning, setWarning] = useState('');
  const TOTAL_STEPS = 4;

  const fmt = v => v ? Number(v).toLocaleString('sv-SE') : '';

  const validateTax = (gross, withheld) => {
    if (!gross || !withheld) return '';
    const rate = withheld / gross;
    if (rate < 0.05) return 'Det där ser ovanligt ut. Dubbelkolla gärna siffran för inbetald skatt – det verkar väldigt lågt.';
    if (rate > 0.55) return 'Skatten verkar för hög jämfört med bruttolönen. Dubbelkolla att du inte blandat ihop siffror.';
    return '';
  };

  const handleNext = () => {
    if (step === 2) {
      const w = validateTax(Number(data.gross), Number(data.withheld));
      if (w) { setWarning(w); return; }
    }
    setWarning('');
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else onComplete(data);
  };

  const canAdvance = () => {
    if (step === 1) return data.gross && Number(data.gross) > 5000;
    if (step === 2) return data.withheld && Number(data.withheld) > 0;
    if (step === 3) return data.municipality;
    if (step === 4) return data.birthYear && data.birthYear.length === 4;
    return false;
  };

  const inputClass = "w-full h-12 rounded-xl px-4 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const inputStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' };

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(17,24,39,0.85)', border: '1px solid rgba(99,102,241,0.3)' }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <span className="text-indigo-400 font-bold text-sm">{step}</span>
        </div>
        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Precision Input</h3>
        <span className="ml-auto text-[11px] text-slate-500">Steg {step}/{TOTAL_STEPS}</span>
      </div>
      <StepIndicator step={step} total={TOTAL_STEPS} />

      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }} className="space-y-4">

          {step === 1 && (
            <div>
              <p className="text-slate-300 text-sm leading-relaxed mb-1 inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 flex-shrink-0" aria-hidden /> Titta på din senaste lönespecifikation.
              </p>
              <p className="text-white font-semibold mb-3">Vad är din <span className="text-indigo-400">Bruttolön</span> (lön före skatt)?</p>
              <input type="number" placeholder="t.ex. 42000" value={data.gross}
                onChange={e => setData(d => ({ ...d, gross: e.target.value }))}
                className={inputClass} style={inputStyle} />
              {data.gross && <p className="text-[11px] text-slate-500 mt-1.5">{fmt(data.gross)} kr/månad</p>}
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-slate-300 text-sm mb-1 inline-flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 flex-shrink-0" aria-hidden /> Titta på <em>samma</em> lönespecifikation.</p>
              <p className="text-white font-semibold mb-3">Hur mycket <span className="text-rose-400">Skatt drogs</span> i kronor den månaden?</p>
              <input type="number" placeholder="t.ex. 11500" value={data.withheld}
                onChange={e => { setData(d => ({ ...d, withheld: e.target.value })); setWarning(''); }}
                className={inputClass} style={inputStyle} />
              {data.withheld && data.gross && (
                <p className="text-[11px] text-slate-500 mt-1.5">
                  = {((Number(data.withheld) / Number(data.gross)) * 100).toFixed(1)}% av bruttolönen
                </p>
              )}
              {warning && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-3 rounded-xl p-3 flex gap-2"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">{warning}</p>
                </motion.div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-white font-semibold mb-3 inline-flex items-center gap-1.5"><Building2 className="w-4 h-4 text-cyan-400" aria-hidden /> Vilken <span className="text-cyan-400">kommun</span> bor du i?</p>
              <select value={data.municipality}
                onChange={e => setData(d => ({ ...d, municipality: e.target.value }))}
                className={`${inputClass} cursor-pointer`} style={inputStyle}>
                <option value="">Välj kommun...</option>
                {MUNICIPALITIES.map(m => (
                  <option key={m.name} value={m.name}>{m.name} — {m.rate}%</option>
                ))}
              </select>
              {data.municipality && (
                <p className="text-[11px] text-cyan-400 mt-1.5">
                  Kommunalskatt: {MUNICIPALITIES.find(m => m.name === data.municipality)?.rate}%
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-white font-semibold mb-3 inline-flex items-center gap-1.5"><Cake className="w-4 h-4 text-amber-400" aria-hidden /> Vilket år är du född? <span className="text-slate-400 font-normal text-sm">(påverkar jobbskatteavdraget)</span></p>
              <input type="number" placeholder="t.ex. 1990" value={data.birthYear}
                onChange={e => setData(d => ({ ...d, birthYear: e.target.value }))}
                className={inputClass} style={inputStyle} min="1930" max="2006" />
              <div className="mt-4 rounded-xl p-3 space-y-1.5"
                style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Sammanfattning</p>
                <div className="flex justify-between text-xs"><span className="text-slate-400">Bruttolön/mån</span><span className="text-white font-bold">{fmt(data.gross)} kr</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-400">Inbetald skatt/mån</span><span className="text-rose-400 font-bold">−{fmt(data.withheld)} kr</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-400">Nettolön/mån</span><span className="text-emerald-400 font-bold">{fmt(Number(data.gross) - Number(data.withheld))} kr</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-400">Kommun</span><span className="text-cyan-400 font-bold">{data.municipality}</span></div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 pt-1">
        {step > 1 && (
          <Button variant="ghost" onClick={() => { setStep(s => s - 1); setWarning(''); }}
            className="text-slate-400 hover:text-white hover:bg-white/10">
            Tillbaka
          </Button>
        )}
        <Button onClick={handleNext} disabled={!canAdvance()}
          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold h-11 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
          {step === TOTAL_STEPS ? (
            <><CheckCircle2 className="w-4 h-4" /> Beräkna</>
          ) : (
            <>Nästa <ChevronRight className="w-4 h-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}