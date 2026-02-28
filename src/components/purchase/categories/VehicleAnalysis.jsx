import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Link2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import VehicleCFOReport from './VehicleCFOReport';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Real-time local calculations (no AI needed)
function calcLocal(price, months, interestRate = 0.07) {
  const p = parseFloat(price) || 0;
  const m = parseInt(months) || 60;
  const monthlyRate = interestRate / 12;
  const monthlyPayment = m > 0
    ? (p * monthlyRate * Math.pow(1 + monthlyRate, m)) / (Math.pow(1 + monthlyRate, m) - 1)
    : 0;
  const totalPaid = monthlyPayment * m;
  const totalInterest = totalPaid - p;
  // Compare to 36 months
  const m36Rate = interestRate / 12;
  const mp36 = (p * m36Rate * Math.pow(1 + m36Rate, 36)) / (Math.pow(1 + m36Rate, 36) - 1);
  const interestExtra = totalInterest - (mp36 * 36 - p);
  // Depreciation: ~15% year 1, 12% subsequent
  const years = m / 12;
  const depreciationPct = Math.min(0.65, 0.15 + (years - 1) * 0.12);
  const residualValue = p * (1 - depreciationPct);
  const depreciation = p - residualValue;
  // Opportunity cost: 7% annual on full price for duration
  const opportunityCost = p * (Math.pow(1.07, years) - 1);
  // Insurance + fuel + service estimate
  const monthlyRunning = p > 300000 ? 3200 : p > 150000 ? 2100 : 1400;

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalPaid: Math.round(totalPaid),
    totalInterest: Math.round(totalInterest),
    interestExtra: Math.round(Math.max(0, interestExtra)),
    residualValue: Math.round(residualValue),
    depreciation: Math.round(depreciation),
    opportunityCost: Math.round(opportunityCost),
    monthlyRunning,
    totalMonthlyCost: Math.round(monthlyPayment + monthlyRunning),
    lifetimeCost: Math.round(totalPaid + monthlyRunning * m),
    lunchEquivalent: Math.round(totalInterest / 130), // avg lunch 130 kr
  };
}

export default function VehicleAnalysis({ mode, profile }) {
  const [vehicle, setVehicle] = useState({ name: '', price: '', months: '60' });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [liveCalc, setLiveCalc] = useState(null);

  const margin = (profile?.income || 30000) - (profile?.housingCost || 10000) -
    ((profile?.subscriptions || []).reduce((s, x) => s + x.amount, 0));

  // Recalculate in real-time whenever price/months change
  useEffect(() => {
    if (vehicle.price && parseInt(vehicle.price) > 0) {
      setLiveCalc(calcLocal(vehicle.price, vehicle.months));
    } else {
      setLiveCalc(null);
    }
  }, [vehicle.price, vehicle.months]);

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
    const local = calcLocal(vehicle.price, vehicle.months);
    const months = parseInt(vehicle.months);
    const price = parseFloat(vehicle.price);

    const aiPrompt = `Du är en CFO-assistent som analyserar ett fordonsköp för en privatperson.

Bil: ${vehicle.name || 'okänd modell'}
Inköpspris: ${fmt(price)} kr
Avbetalningstid: ${months} månader
Beräknad månadskostnad (lån): ${fmt(local.monthlyPayment)} kr
Total ränta: ${fmt(local.totalInterest)} kr
Användarens månadsmarginal: ${fmt(margin)} kr
Bilens månadsandel av marginalen: ${Math.round((local.totalMonthlyCost / margin) * 100)}%

Ge:
1. cfo_score: 1-10 (heltal). 10 = perfekt ekonomisk beslut, 1 = ekonomisk katastrof.
2. cfo_verdict: "Köp tryggt" | "Köp varsamt" | "Vänta" | "Undvik"
3. cfo_recommendation: 2-3 meningar, anpassad till avbetalningstiden. SVENSKA. Om >60 mån: varningstext.
4. contextual_story: En mening som förklarar vad totalkostnaden "motsvarar" (t.ex. resor, luncher, aktier). SVENSKA. Kreativt!
5. risk_level: "low" | "medium" | "high"
6. better_alternative: En kort beskrivning av ett billigare alternativ. SVENSKA.
7. opportunity_investment: Vad ${fmt(local.totalInterest)} kr i ränta hade blivit på börsen. SVENSKA.

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

    setAnalysis({ ...local, ...ai, price, months, vehicleName: vehicle.name, margin });
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
            {[12,24,36,48,60,72,84,96].map(m => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Live preview while typing */}
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
                <p className={`text-sm font-bold ${liveCalc.totalMonthlyCost/margin > 0.3 ? 'text-rose-400' : liveCalc.totalMonthlyCost/margin > 0.2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {Math.round((liveCalc.totalMonthlyCost / margin) * 100)}%
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 60-month warning */}
        {months >= 60 && liveCalc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-xl p-3 flex gap-2 items-start text-xs"
            style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <span className="text-amber-400 text-base flex-shrink-0">⏳</span>
            <p className="text-amber-200">
              <strong>Lång avbetalning ({months} mån):</strong> Sänker månadskostnaden men ökar totalkostnaden med{' '}
              <strong>{fmt(liveCalc.interestExtra)} kr</strong> jämfört med 36 månader.{' '}
              Är du bekväm med att äga skulden längre än garantin?
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