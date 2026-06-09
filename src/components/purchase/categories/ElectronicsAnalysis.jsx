// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Laptop, Link2, Loader2, TrendingDown, TrendingUp, Clock, Zap, Brain } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export default function ElectronicsAnalysis({ mode, profile }) {
  const [device, setDevice] = useState({ name: '', price: '', usage: '', usageYears: '2' });
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveCalc, setLiveCalc] = useState(null);

  const income = profile?.income || 30000;
  const buffer = profile?.buffer || 0;
  const savingsGoalName = profile?.savingsGoalName || 'sparmålet';
  const savingsGoal = profile?.savingsGoal || 0;
  const totalFixed = (profile?.housingCost || 0) + ((profile?.subscriptions || []).reduce((s, x) => s + x.amount, 0));
  const margin = income - totalFixed;

  useEffect(() => {
    const price = parseFloat(device.price) || 0;
    const years = parseFloat(device.usageYears) || 2;
    if (!price) { setLiveCalc(null); return; }

    // Cost per day
    const days = years * 365;
    const costPerDay = price / days;
    const costPerMonth = price / (years * 12);

    // Depreciation: electronics lose ~40% yr1, ~20% yr2
    const residualValue = price * (years <= 1 ? 0.6 : years <= 2 ? 0.4 : 0.25);
    const totalDepreciation = price - residualValue;

    // Savings goal impact
    const savingsPct = savingsGoal > 0 ? (price / savingsGoal) * 100 : 0;
    const bufferPct = buffer > 0 ? (price / buffer) * 100 : 0;
    const monthsToSave = margin > 0 ? price / (margin * 0.2) : 99;

    setLiveCalc({ costPerDay, costPerMonth, residualValue, totalDepreciation, savingsPct, bufferPct, monthsToSave, days });
  }, [device.price, device.usageYears, buffer, savingsGoal, margin]);

  const handleUrlAutofill = async () => {
    if (!urlInput) return;
    setUrlLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Läs av denna elektronik-URL (Webhallen, Elgiganten, Amazon, etc.) och extrahera produktdata: ${urlInput}. Returnera JSON med: name (produktnamn + modell), price (pris i kr), specs (kort specifikationssummering som sträng).`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'number' },
          specs: { type: 'string' }
        }
      }
    });
    setDevice(d => ({
      ...d,
      name: res.name || d.name,
      price: res.price ? String(res.price) : d.price,
    }));
    setUrlLoading(false);
  };

  const handleAnalyze = async () => {
    setLoading(true);

    const ai = await base44.integrations.Core.InvokeLLM({
      prompt: `Du är en elektronik-CFO och anti-impulsköps-coach för en privatperson.

Produkt: ${device.name}
Pris: ${fmt(device.price)} kr
Användning: ${device.usage || 'ej angiven'}
Planerad användningstid: ${device.usageYears} år
Kostnad per dag: ${liveCalc ? fmt(liveCalc.costPerDay) + ' kr' : 'okänd'}
Kostnad per månad: ${liveCalc ? fmt(liveCalc.costPerMonth) + ' kr' : 'okänd'}
Användarens inkomst: ${fmt(income)} kr/mån
Sparmål "${savingsGoalName}": ${fmt(savingsGoal)} kr (köpet = ${Math.round(liveCalc?.savingsPct || 0)}% av målet)
Buffert: ${fmt(buffer)} kr

Ge:
1. cfo_verdict: "Smart investering" | "Köp med eftertanke" | "Vänta" | "Skippa"
2. cfo_score: 1-10
3. need_analysis: En konkret analys om behovet är äkta eller ett impulsköp. SVENSKA.
4. depreciation_pct: Uppskattad värdeminskning i % efter 1 år för denna typ av produkt (t.ex. 40 för smartphones)
5. alternative: Konkret billigare alternativ (refurbished / annan modell). SVENSKA.
6. cost_per_use_story: Kreativ beskrivning av "kostnaden per dag" (t.ex. "Som en kopp kaffe varje dag"). SVENSKA.
7. goal_trade_off: Vad sparmålet hade blivit om pengarna investerades istället. SVENSKA. 
8. upgrade_cycle: Hur länge bör man vänta innan detta köp är rimligt (månader)?
9. best_time_to_buy: Tips om när priset brukar sjunka (rea, release-cykler). SVENSKA.

Svara ENDAST med JSON.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          cfo_verdict: { type: 'string' },
          cfo_score: { type: 'number' },
          need_analysis: { type: 'string' },
          depreciation_pct: { type: 'number' },
          alternative: { type: 'string' },
          cost_per_use_story: { type: 'string' },
          goal_trade_off: { type: 'string' },
          upgrade_cycle: { type: 'number' },
          best_time_to_buy: { type: 'string' },
        }
      }
    });

    setAnalysis({ ...liveCalc, ...ai, price: parseFloat(device.price), device });
    setLoading(false);
  };

  const VERDICT_COLOR = {
    'Smart investering': '#10B981',
    'Köp med eftertanke': '#6366F1',
    'Vänta': '#F59E0B',
    'Skippa': '#EF4444',
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 space-y-4"
        style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Laptop className="w-5 h-5 text-purple-400" /> Elektronikköp
        </h3>

        {/* URL */}
        <div>
          <Label className="text-xs text-slate-400">URL (Webhallen, Elgiganten, Amazon…)</Label>
          <div className="flex gap-2 mt-1">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                placeholder="https://webhallen.com/…" className="pl-9 h-10 text-sm" />
            </div>
            <Button onClick={handleUrlAutofill} disabled={!urlInput || urlLoading} size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 h-10 flex-shrink-0">
              {urlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hämta'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs text-slate-400">Produkt</Label>
            <Input value={device.name} onChange={e => setDevice(d => ({ ...d, name: e.target.value }))}
              placeholder="iPhone 16 Pro, MacBook Air M3…" className="mt-1 h-10 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Pris (kr)</Label>
            <Input type="number" value={device.price} onChange={e => setDevice(d => ({ ...d, price: e.target.value }))}
              placeholder="14 000" className="mt-1 h-10 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Planerad användning (år)</Label>
            <Input type="number" min="1" max="10" value={device.usageYears} onChange={e => setDevice(d => ({ ...d, usageYears: e.target.value }))}
              placeholder="2" className="mt-1 h-10 text-sm" />
          </div>
          <div className="col-span-2">
            <Label className="text-xs text-slate-400">Vad ska du använda den till?</Label>
            <Input value={device.usage} onChange={e => setDevice(d => ({ ...d, usage: e.target.value }))}
              placeholder="Frilans, studier, gaming, foto…" className="mt-1 h-10 text-sm" />
          </div>
        </div>

        {/* Live calculations */}
        <AnimatePresence>
          {liveCalc && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="rounded-xl p-3 grid grid-cols-3 gap-2 text-center"
              style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <div>
                <p className="text-[10px] text-slate-500">Kostnad/dag</p>
                <p className="text-sm font-bold text-purple-400">{fmt(liveCalc.costPerDay)} kr</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Kostnad/mån</p>
                <p className="text-sm font-bold text-purple-400">{fmt(liveCalc.costPerMonth)} kr</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Av sparmål</p>
                <p className={`text-sm font-bold ${liveCalc.savingsPct > 50 ? 'text-rose-400' : liveCalc.savingsPct > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {Math.round(liveCalc.savingsPct)}%
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Button onClick={handleAnalyze} disabled={!device.name || !device.price || loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 font-bold text-white">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Bygger CFO-rapport…</> : <><Laptop className="w-4 h-4 mr-2" aria-hidden /> Generera Elektronik CFO-rapport</>}
      </Button>

      <AnimatePresence>
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {(() => {
              const vc = VERDICT_COLOR[analysis.cfo_verdict] || '#6366F1';
              const depreciationVal = analysis.price * ((analysis.depreciation_pct || 40) / 100);
              return (
                <>
                  {/* Header verdict */}
                  <div className="rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${vc}11 0%, transparent 100%)`, border: `1px solid ${vc}44` }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">{analysis.device.name}</p>
                        <h2 className="text-xl font-black text-white">{fmt(analysis.price)} kr</h2>
                        <div className="mt-2 inline-flex px-3 py-1 rounded-full text-sm font-bold"
                          style={{ background: `${vc}22`, color: vc, border: `1px solid ${vc}44` }}>
                          {analysis.cfo_verdict}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-black" style={{ color: vc }}>{analysis.cfo_score}</div>
                        <div className="text-[10px] text-slate-500">CFO SCORE</div>
                      </div>
                    </div>
                  </div>

                  {/* Cost per use story */}
                  <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <p className="text-xs text-slate-500 mb-1">Kostnad per användning ({analysis.device.usageYears} år = {analysis.days} dagar)</p>
                    <p className="text-3xl font-black text-purple-400">{fmt(analysis.costPerDay)} kr/dag</p>
                    <p className="text-xs text-slate-400 mt-1 italic">{analysis.cost_per_use_story}</p>
                  </div>

                  {/* Depreciation */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div className="flex items-start gap-2">
                        <TrendingDown className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-rose-400 uppercase tracking-wider font-bold">Värdeminskning år 1</p>
                          <p className="text-xl font-black text-white mt-0.5">-{analysis.depreciation_pct || 40}%</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">≈ -{fmt(depreciationVal)} kr</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl p-4" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <div>
                        <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-bold">Upgrade-cykeln</p>
                        <p className="text-xl font-black text-white mt-0.5">{analysis.upgrade_cycle || 24} mån</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Vänta tills köpet är rimligt</p>
                      </div>
                    </div>
                  </div>

                  {/* Need analysis */}
                  {analysis.need_analysis && (
                    <div className="rounded-xl p-4" style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" aria-hidden /> Behovs-analys</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{analysis.need_analysis}</p>
                    </div>
                  )}

                  {/* Goal tradeoff */}
                  {analysis.goal_trade_off && (
                    <div className="rounded-xl p-3 flex gap-2 text-xs" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden />
                      <p className="text-slate-300">{analysis.goal_trade_off}</p>
                    </div>
                  )}

                  {/* Alternative */}
                  {analysis.alternative && (
                    <div className="rounded-xl p-3 flex gap-2 text-xs" style={{ background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-bold text-cyan-400 mb-0.5">Smartare alternativ</p>
                        <p className="text-slate-300">{analysis.alternative}</p>
                      </div>
                    </div>
                  )}

                  {/* Best time to buy */}
                  {analysis.best_time_to_buy && (
                    <div className="rounded-xl p-3 flex gap-2 text-xs" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                      <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-bold text-amber-400 mb-0.5">Bästa köptidpunkt</p>
                        <p className="text-slate-300">{analysis.best_time_to_buy}</p>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}