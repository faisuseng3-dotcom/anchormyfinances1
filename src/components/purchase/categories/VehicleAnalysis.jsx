import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Link2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { base44 } from '@/api/base44Client';
import VehicleCFOReport from './VehicleCFOReport';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function calcAnnuity(principal, annualRate, months) {
  if (!principal || !months) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function calcLocal(price, months, downPaymentPct, interestRate) {
  const p = parseFloat(price) || 0;
  const m = parseInt(months) || 60;
  const dp = (downPaymentPct / 100) * p;
  const loanAmount = p - dp;
  const rate = interestRate / 100;

  const monthlyLoan = calcAnnuity(loanAmount, rate, m);
  const totalPaid = monthlyLoan * m;
  const totalInterest = totalPaid - loanAmount;

  // Compare to 36 months
  const mp36 = calcAnnuity(loanAmount, rate, 36);
  const interestExtra = Math.max(0, totalInterest - (mp36 * 36 - loanAmount));

  // Depreciation: ~15% yr1, 12% subsequent
  const years = m / 12;
  const depreciationPct = Math.min(0.65, 0.15 + Math.max(0, years - 1) * 0.12);
  const residualValue = p * (1 - depreciationPct);
  const depreciation = p - residualValue;

  // Underwater check: remaining debt vs residual value at midpoint
  const midMonth = Math.floor(m / 2);
  let remainingDebt = loanAmount;
  for (let i = 0; i < midMonth; i++) {
    const interest = remainingDebt * (rate / 12);
    const principal = monthlyLoan - interest;
    remainingDebt -= principal;
  }
  const midDepPct = Math.min(0.5, 0.15 + Math.max(0, (midMonth / 12) - 1) * 0.12);
  const midResidualValue = p * (1 - midDepPct);
  const isUnderwater = remainingDebt > midResidualValue;

  // Opportunity cost on down payment at 7%/yr
  const opportunityCost = dp * (Math.pow(1.07, years) - 1);
  const opportunityFinalValue = dp * Math.pow(1.07, years);

  const monthlyRunning = p > 300000 ? 3200 : p > 150000 ? 2100 : 1400;
  const totalMonthlyCost = Math.round(monthlyLoan + monthlyRunning);

  return {
    loanAmount: Math.round(loanAmount),
    downPaymentAmount: Math.round(dp),
    monthlyLoan: Math.round(monthlyLoan),
    totalPaid: Math.round(totalPaid + dp),
    totalInterest: Math.round(totalInterest),
    interestExtra: Math.round(interestExtra),
    residualValue: Math.round(residualValue),
    depreciation: Math.round(depreciation),
    opportunityCost: Math.round(opportunityCost),
    opportunityFinalValue: Math.round(opportunityFinalValue),
    monthlyRunning,
    totalMonthlyCost,
    lifetimeCost: Math.round(totalPaid + monthlyRunning * m + dp),
    lunchEquivalent: Math.round(totalInterest / 130),
    isUnderwater,
    remainingDebt: Math.round(remainingDebt),
    midResidualValue: Math.round(midResidualValue),
  };
}

export default function VehicleAnalysis({ mode, profile }) {
  const [vehicle, setVehicle] = useState({ name: '', price: '', months: '60' });
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.95);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [liveCalc, setLiveCalc] = useState(null);

  const totalFixed = (profile?.housingCost || 0) +
    ((profile?.subscriptions || []).reduce((s, x) => s + x.amount, 0)) +
    ((profile?.loans || []).reduce((s, x) => s + x.monthlyPayment, 0));
  const margin = (profile?.income || 30000) - totalFixed;
  const currentBuffer = profile?.buffer || 0;
  const bufferMonths = totalFixed > 0 ? currentBuffer / totalFixed : 0;

  useEffect(() => {
    const price = parseFloat(vehicle.price);
    if (price > 0) {
      setLiveCalc(calcLocal(price, vehicle.months, downPaymentPct, interestRate));
    } else {
      setLiveCalc(null);
    }
  }, [vehicle.price, vehicle.months, downPaymentPct, interestRate]);

  const handleUrlAutofill = async () => {
    if (!urlInput) return;
    setUrlLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Läs av denna bilannons-URL och extrahera fordonsdata: ${urlInput}. Returnera JSON med: model (string), price (number i kr), mileage (number), fuel (string).`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          model: { type: 'string' },
          price: { type: 'number' },
          mileage: { type: 'number' },
          fuel: { type: 'string' }
        }
      }
    });
    if (res.model) setVehicle(v => ({ ...v, name: res.model, price: String(res.price || v.price) }));
    setUrlLoading(false);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    const price = parseFloat(vehicle.price);
    const months = parseInt(vehicle.months);
    const local = calcLocal(price, months, downPaymentPct, interestRate);

    // Resilience impact
    const newBufferMonths = totalFixed > 0 ? Math.max(0, (currentBuffer - local.downPaymentAmount) / totalFixed) : 0;

    const aiPrompt = `Du är en CFO-assistent som analyserar ett fordonsköp för en privatperson.

Bil: ${vehicle.name || 'okänd modell'}
Inköpspris: ${fmt(price)} kr
Kontantinsats: ${downPaymentPct}% = ${fmt(local.downPaymentAmount)} kr
Lånebelopp: ${fmt(local.loanAmount)} kr
Ränta: ${interestRate}%
Avbetalningstid: ${months} månader
Månadskostnad lån: ${fmt(local.monthlyLoan)} kr
Total månadskostnad (inkl drift): ${fmt(local.totalMonthlyCost)} kr
Total ränta: ${fmt(local.totalInterest)} kr
Användarens månadsmarginal: ${fmt(margin)} kr
Bilens andel av marginalen: ${Math.round((local.totalMonthlyCost / margin) * 100)}%
Buffert nu: ${fmt(currentBuffer)} kr (${bufferMonths.toFixed(1)} mån trygghet)
Buffert efter kontantinsats: ${fmt(currentBuffer - local.downPaymentAmount)} kr (${newBufferMonths.toFixed(1)} mån trygghet)
Är man "under vatten" vid halvtid: ${local.isUnderwater ? 'JA – skulden överstiger bilens värde' : 'NEJ'}

Ge:
1. cfo_score: 1-10 (heltal). 10 = perfekt ekonomisk beslut, 1 = ekonomisk katastrof.
2. cfo_verdict: "Köp tryggt" | "Köp varsamt" | "Vänta" | "Undvik"
3. cfo_recommendation: 2-3 meningar, anpassad till situationen. SVENSKA. Kommentera kontantinsatsen, räntan och buffertpåverkan.
4. contextual_story: En mening som förklarar vad totalkostnaden "motsvarar" kreativt. SVENSKA.
5. risk_level: "low" | "medium" | "high"
6. better_alternative: En kort beskrivning av ett ekonomiskt smartare alternativ. SVENSKA.
7. opportunity_investment: Vad kontantinsatsen ${fmt(local.downPaymentAmount)} kr hade blivit i en indexfond när lånet är slutbetalt. SVENSKA.

Svara ENDAST med JSON.`;

    const ai = await base44.integrations.Core.InvokeLLM({
      prompt: aiPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          cfo_score: { type: 'number' },
          cfo_verdict: { type: 'string' },
          cfo_recommendation: { type: 'string' },
          contextual_story: { type: 'string' },
          risk_level: { type: 'string' },
          better_alternative: { type: 'string' },
          opportunity_investment: { type: 'string' },
        }
      }
    });

    setAnalysis({
      ...local, ...ai, price, months,
      vehicleName: vehicle.name, margin,
      downPaymentPct, interestRate,
      currentBuffer, bufferMonths, newBufferMonths,
    });
    setLoading(false);
  };

  const months = parseInt(vehicle.months) || 60;
  const btnRisk = liveCalc
    ? (liveCalc.totalMonthlyCost / margin) > 0.3 ? 'high' : (liveCalc.totalMonthlyCost / margin) > 0.2 ? 'mid' : 'low'
    : 'low';
  const btnClass = btnRisk === 'high'
    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90'
    : btnRisk === 'mid'
    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90'
    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90';

  const price = parseFloat(vehicle.price) || 0;
  const loanAmount = price - (downPaymentPct / 100) * price;

  return (
    <div className="space-y-5">
      {/* Input Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 space-y-4"
        style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Car className="w-5 h-5 text-blue-400" /> Fordonsinformation
        </h3>

        {/* URL */}
        <div>
          <Label className="text-xs text-slate-400">Annons-URL (Blocket, Riddermark…)</Label>
          <div className="flex gap-2 mt-1">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                placeholder="https://blocket.se/…" className="pl-9 h-10 text-sm" />
            </div>
            <Button onClick={handleUrlAutofill} disabled={!urlInput || urlLoading} size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 h-10 flex-shrink-0">
              {urlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hämta'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-slate-400">Modell</Label>
            <Input value={vehicle.name}
              onChange={e => setVehicle({ ...vehicle, name: e.target.value })}
              placeholder="Volvo XC60…" className="mt-1 h-10 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Pris (kr)</Label>
            <Input type="number" value={vehicle.price}
              onChange={e => setVehicle({ ...vehicle, price: e.target.value })}
              placeholder="450 000" className="mt-1 h-10 text-sm" />
          </div>
        </div>

        {/* Down payment */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-xs text-slate-400">Kontantinsats</Label>
            <span className="text-sm font-bold text-white">{downPaymentPct}%
              {price > 0 && <span className="text-slate-400 font-normal ml-1">= {fmt((downPaymentPct / 100) * price)} kr</span>}
            </span>
          </div>
          <Slider min={10} max={50} step={5}
            value={[downPaymentPct]}
            onValueChange={([v]) => setDownPaymentPct(v)}
            className="w-full" />
          <div className="flex justify-between text-[10px] text-slate-600 mt-1">
            <span>10% (min)</span><span>50%</span>
          </div>
          {downPaymentPct < 20 && (
            <p className="text-[10px] text-amber-400 mt-1">⚠️ Lagens minimikrav för billån är 20%</p>
          )}
        </div>

        {/* Loan amount (read-only) */}
        {price > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-400">Lånebelopp (beräknat)</Label>
              <div className="mt-1 h-10 rounded-xl flex items-center px-3 text-sm font-semibold text-blue-300"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                {fmt(loanAmount)} kr
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-400">Ränta (%)</Label>
              <Input type="number" step="0.05" value={interestRate}
                onChange={e => setInterestRate(parseFloat(e.target.value) || 6.95)}
                className="mt-1 h-10 text-sm" />
            </div>
          </div>
        )}

        {/* Months slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-xs text-slate-400">Avbetalningstid</Label>
            <span className="text-sm font-bold text-white">{months} månader</span>
          </div>
          <input type="range" min="12" max="96" step="12"
            value={months}
            onChange={e => setVehicle({ ...vehicle, months: e.target.value })}
            className="w-full accent-indigo-500 cursor-pointer"
            style={{ height: '4px' }}
          />
          <div className="flex justify-between text-[10px] text-slate-600 mt-1">
            {[12, 24, 36, 48, 60, 72, 84, 96].map(m => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Live preview */}
        <AnimatePresence>
          {liveCalc && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl p-3 grid grid-cols-3 gap-2 text-center"
              style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <div>
                <p className="text-[10px] text-slate-500">Månadskostnad</p>
                <p className="text-sm font-bold text-blue-400">{fmt(liveCalc.totalMonthlyCost)} kr</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Total ränta</p>
                <p className="text-sm font-bold text-amber-400">{fmt(liveCalc.totalInterest)} kr</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Av marginalen</p>
                <p className={`text-sm font-bold ${liveCalc.totalMonthlyCost / margin > 0.3 ? 'text-rose-400' : liveCalc.totalMonthlyCost / margin > 0.2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {Math.round((liveCalc.totalMonthlyCost / margin) * 100)}%
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Debt Trap Warning */}
        {months >= 84 && liveCalc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-xl p-3 flex gap-2 items-start text-xs"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-rose-200">
              <strong>Skuldfälla ({months} mån):</strong> Lånetiden är längre än bilens beräknade värdebehållning. Du riskerar att ha kvar skulden när du säljer bilen.
            </p>
          </motion.div>
        )}

        {months >= 60 && months < 84 && liveCalc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-xl p-3 flex gap-2 items-start text-xs"
            style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <span className="text-amber-400 text-base flex-shrink-0">⏳</span>
            <p className="text-amber-200">
              <strong>Lång avbetalning ({months} mån):</strong> Ökar totalkostnaden med{' '}
              <strong>{fmt(liveCalc.interestExtra)} kr</strong> jämfört med 36 månader.
            </p>
          </motion.div>
        )}

        {/* Buffer warning */}
        {liveCalc && liveCalc.downPaymentAmount > 0 && currentBuffer > 0 && liveCalc.downPaymentAmount > currentBuffer * 0.3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-xl p-3 flex gap-2 items-start text-xs"
            style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <span className="text-indigo-400 text-base flex-shrink-0">🛡️</span>
            <p className="text-indigo-200">
              Kontantinsatsen på <strong>{fmt(liveCalc.downPaymentAmount)} kr</strong> sänker din buffert
              från <strong>{bufferMonths.toFixed(1)} mån</strong> till{' '}
              <strong className={currentBuffer - liveCalc.downPaymentAmount < totalFixed ? 'text-rose-300' : 'text-indigo-200'}>
                {Math.max(0, ((currentBuffer - liveCalc.downPaymentAmount) / totalFixed)).toFixed(1)} mån
              </strong> trygghet.
            </p>
          </motion.div>
        )}
      </motion.div>

      <Button onClick={handleAnalyze}
        disabled={!vehicle.name || !vehicle.price || loading}
        className={`w-full h-12 rounded-xl font-bold text-white ${btnClass}`}>
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Bygger CFO-rapport…</>
        ) : (
          btnRisk === 'high'
            ? '⚠️ Analysera (Hög risk – >30% av marginalen)'
            : '🚗 Generera CFO Impact Report'
        )}
      </Button>

      <AnimatePresence>
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <VehicleCFOReport analysis={analysis} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}