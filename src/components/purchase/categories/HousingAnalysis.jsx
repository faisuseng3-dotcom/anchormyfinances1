// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Link2, Loader2, AlertTriangle, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Stress-test: monthly interest at given rate
function stressMonthly(loanAmount, currentRate, deltaRate, months) {
  const newRate = (currentRate + deltaRate) / 100 / 12;
  if (newRate === 0) return loanAmount / months;
  return (loanAmount * newRate * Math.pow(1 + newRate, months)) / (Math.pow(1 + newRate, months) - 1);
}

export default function HousingAnalysis({ mode, profile }) {
  const [housing, setHousing] = useState({ type: 'brf', name: '', price: '', monthly: '', fee: '', area: '', location: '' });
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveCalc, setLiveCalc] = useState(null);

  const income = profile?.income || 30000;
  const totalFixed = (profile?.housingCost || 0) + ((profile?.subscriptions || []).reduce((s, x) => s + x.amount, 0));
  const margin = income - totalFixed;
  const currentBuffer = profile?.buffer || 0;

  // Live calculations
  useEffect(() => {
    const price = parseFloat(housing.price);
    const monthly = parseFloat(housing.monthly) || 0;
    const fee = parseFloat(housing.fee) || 0;
    if (!price) { setLiveCalc(null); return; }

    const downPct = 0.15; // 15% min
    const loanAmount = price * (1 - downPct);
    const downPayment = price * downPct;
    const rate = 4.5; // current avg %
    const months = 360; // 30yr
    const r = rate / 100 / 12;
    const monthlyLoan = (loanAmount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);

    // Hidden costs for house
    const lagfart = housing.type === 'house' ? price * 0.015 : 0;
    const pantbrev = housing.type === 'house' ? price * 0.02 : 0;
    const hiddenCosts = lagfart + pantbrev;

    const totalMonthly = monthlyLoan + fee + (housing.type !== 'brf' ? monthly : monthly);
    const incomeShare = totalMonthly / income;

    // Stress tests
    const stress3 = stressMonthly(loanAmount, rate, 3 - rate, months);
    const stress5 = stressMonthly(loanAmount, rate, 5 - rate, months);
    const afterStress5 = margin - stress5 - fee;
    const kalp = income * 0.7 - totalMonthly; // 70% of income rule

    setLiveCalc({ loanAmount, downPayment, monthlyLoan, totalMonthly, incomeShare, stress3, stress5, afterStress5, kalp, lagfart, pantbrev, hiddenCosts });
  }, [housing.price, housing.monthly, housing.fee, housing.type, income, margin]);

  const handleUrlAutofill = async () => {
    if (!urlInput) return;
    setUrlLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Läs av denna bostadsannons-URL och extrahera data: ${urlInput}. Returnera JSON med: name (adress), price (slutpris/begärt pris i kr), monthly_fee (månadsavgift i kr), area (boarea m2), location (område/stad), type (brf/house/rental).`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'number' },
          monthly_fee: { type: 'number' },
          area: { type: 'number' },
          location: { type: 'string' },
          type: { type: 'string' }
        }
      }
    });
    setHousing(h => ({
      ...h,
      name: res.name || h.name,
      price: res.price ? String(res.price) : h.price,
      fee: res.monthly_fee ? String(res.monthly_fee) : h.fee,
      area: res.area ? String(res.area) : h.area,
      location: res.location || h.location,
      type: res.type || h.type,
    }));
    setUrlLoading(false);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    const price = parseFloat(housing.price);
    const monthly = parseFloat(housing.monthly) || 0;
    const fee = parseFloat(housing.fee) || 0;

    const ai = await base44.integrations.Core.InvokeLLM({
      prompt: `Du är en bostads-CFO för en privatperson i Sverige.

Bostad: ${housing.name || housing.type} i ${housing.location}
Pris: ${fmt(price)} kr
Månadsavgift/hyra: ${fmt(fee || monthly)} kr
Boarea: ${housing.area} m²
Typ: ${housing.type}
Användarens inkomst: ${fmt(income)} kr/mån
Buffert nu: ${fmt(currentBuffer)} kr
Kontantinsats (15%): ${fmt(price * 0.15)} kr
Lånebehov: ${fmt(price * 0.85)} kr
${liveCalc ? `Total månadskostnad (est.): ${fmt(liveCalc.totalMonthly)} kr
Kassaflöde vid 5% ränta: ${fmt(liveCalc.afterStress5)} kr/mån
Dolda kostnader (lagfart+pantbrev): ${fmt(liveCalc.hiddenCosts)} kr` : ''}

Ge:
1. cfo_verdict: "Trygg investering" | "Köp med försiktighet" | "Vänta" | "Undvik"
2. cfo_score: 1-10
3. cfo_recommendation: 2-3 meningar om bostadsköpet. SVENSKA.
4. stress_ok: true/false - Klarar köparen 5% ränta?
5. kalp_ok: true/false - Klarar KALP-kalkylen (inkomst × 0.7)?
6. price_per_sqm: Prisper m² vs snitt i området (uppskatta baserat på stad)
7. value_growth_5y: Uppskattad värdeutveckling i % över 5 år baserat på ${housing.location}
8. risk_factors: array med max 3 riskfaktorer som korta strängar
9. hidden_tip: En konkret sak köparen missar. SVENSKA.

Svara ENDAST med JSON.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          cfo_verdict: { type: 'string' },
          cfo_score: { type: 'number' },
          cfo_recommendation: { type: 'string' },
          stress_ok: { type: 'boolean' },
          kalp_ok: { type: 'boolean' },
          price_per_sqm: { type: 'number' },
          value_growth_5y: { type: 'number' },
          risk_factors: { type: 'array', items: { type: 'string' } },
          hidden_tip: { type: 'string' },
        }
      }
    });

    setAnalysis({ ...liveCalc, ...ai, price, monthly: fee || monthly, housing });
    setLoading(false);
  };

  const VERDICT_COLOR = {
    'Trygg investering': '#10B981',
    'Köp med försiktighet': '#6366F1',
    'Vänta': '#F59E0B',
    'Undvik': '#EF4444',
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 space-y-4"
        style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Home className="w-5 h-5 text-emerald-400" /> Bostadsinformation
        </h3>

        {/* URL */}
        <div>
          <Label className="text-xs text-slate-400">Annons-URL (Hemnet, Booli, Blocket Bostad)</Label>
          <div className="flex gap-2 mt-1">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                placeholder="https://hemnet.se/…" className="pl-9 h-10 text-sm" />
            </div>
            <Button onClick={handleUrlAutofill} disabled={!urlInput || urlLoading} size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 h-10 flex-shrink-0">
              {urlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hämta'}
            </Button>
          </div>
        </div>

        {/* Type */}
        <div className="grid grid-cols-3 gap-2">
          {[{ id: 'brf', label: 'BRF' }, { id: 'house', label: 'Hus' }, { id: 'rental', label: 'Hyresrätt' }].map(t => (
            <button key={t.id} onClick={() => setHousing(h => ({ ...h, type: t.id }))}
              className={`py-2 rounded-xl text-sm font-medium border transition-all ${housing.type === t.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div>
          <Label className="text-xs text-slate-400">Adress / Beskrivning</Label>
          <Input value={housing.name} onChange={e => setHousing(h => ({ ...h, name: e.target.value }))}
            placeholder="Storgatan 5, 3 rum i Södermalm" className="mt-1 h-10 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-slate-400">Pris (kr)</Label>
            <Input type="number" value={housing.price} onChange={e => setHousing(h => ({ ...h, price: e.target.value }))}
              placeholder="4 500 000" className="mt-1 h-10 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-slate-400">{housing.type === 'brf' ? 'Månadsavgift (kr)' : 'Driftskostnad (kr)'}</Label>
            <Input type="number" value={housing.fee} onChange={e => setHousing(h => ({ ...h, fee: e.target.value }))}
              placeholder="3 500" className="mt-1 h-10 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Boarea (m²)</Label>
            <Input type="number" value={housing.area} onChange={e => setHousing(h => ({ ...h, area: e.target.value }))}
              placeholder="65" className="mt-1 h-10 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Område</Label>
            <Input value={housing.location} onChange={e => setHousing(h => ({ ...h, location: e.target.value }))}
              placeholder="Stockholm, Göteborg…" className="mt-1 h-10 text-sm" />
          </div>
        </div>

        {/* Live preview */}
        <AnimatePresence>
          {liveCalc && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="space-y-2">
              <div className="rounded-xl p-3 grid grid-cols-3 gap-2 text-center"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div>
                  <p className="text-[10px] text-slate-500">Månadskostnad</p>
                  <p className="text-sm font-bold text-emerald-400">{fmt(liveCalc.totalMonthly)} kr</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Av inkomst</p>
                  <p className={`text-sm font-bold ${liveCalc.incomeShare > 0.4 ? 'text-rose-400' : liveCalc.incomeShare > 0.3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {Math.round(liveCalc.incomeShare * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Vid 5% ränta</p>
                  <p className={`text-sm font-bold ${liveCalc.afterStress5 < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {fmt(liveCalc.afterStress5)} kr
                  </p>
                </div>
              </div>

              {housing.type === 'house' && liveCalc.hiddenCosts > 0 && (
                <div className="rounded-xl p-3 flex gap-2 text-xs"
                  style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-200">
                    Dolda kostnader för hus: lagfart ({fmt(liveCalc.lagfart)} kr) + pantbrev ({fmt(liveCalc.pantbrev)} kr) = <strong>{fmt(liveCalc.hiddenCosts)} kr extra</strong>
                  </p>
                </div>
              )}

              {liveCalc.incomeShare > 0.4 && (
                <div className="rounded-xl p-3 flex gap-2 text-xs"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-rose-200">Månadskostnaden överstiger 40% av din inkomst. CFO-rekommendationen är max 30-35%.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Button onClick={handleAnalyze} disabled={!housing.price || !housing.fee || loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90 font-bold text-white">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Bygger CFO-rapport…</> : '🏠 Generera CFO Bostadsrapport'}
      </Button>

      <AnimatePresence>
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Verdict header */}
            {(() => {
              const vc = VERDICT_COLOR[analysis.cfo_verdict] || '#6366F1';
              return (
                <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${vc}44` }}>
                  <div className="p-4" style={{ background: `linear-gradient(135deg, ${vc}11 0%, transparent 100%)` }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{analysis.housing.name || 'Bostad'}</p>
                        <h2 className="text-xl font-black text-white">{fmt(analysis.price)} kr</h2>
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold"
                          style={{ background: `${vc}22`, color: vc, border: `1px solid ${vc}44` }}>
                          {analysis.cfo_verdict}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-black" style={{ color: vc }}>{analysis.cfo_score}</div>
                        <div className="text-[10px] text-slate-500">CFO SCORE</div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 rounded-xl text-sm text-slate-300 leading-relaxed"
                      style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${vc}33` }}>
                      {analysis.cfo_recommendation}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Stress tests */}
            <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">🧪 Ränte-stresstest</p>
              {[
                { label: 'Nuläge (~4.5%)', value: analysis.monthlyLoan },
                { label: 'Vid 3% ränta', value: analysis.stress3, delta: analysis.stress3 - analysis.monthlyLoan },
                { label: 'Vid 5% ränta ⚠️', value: analysis.stress5, delta: analysis.stress5 - analysis.monthlyLoan },
              ].map((s, i) => s.value && (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">{s.label}</span>
                  <div className="text-right">
                    <span className={`font-bold ${i === 2 && !analysis.stress_ok ? 'text-rose-400' : 'text-white'}`}>{fmt(s.value)} kr/mån</span>
                    {s.delta && <span className={`text-xs ml-2 ${s.delta > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{s.delta > 0 ? '+' : ''}{fmt(s.delta)}</span>}
                  </div>
                </div>
              ))}
              <div className={`rounded-lg p-2 text-xs font-medium ${analysis.stress_ok ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                {analysis.stress_ok ? '✓ Du klarar 5%-ränta med positiv marginal' : '⚠️ Vid 5% ränta får du negativt kassaflöde'}
              </div>
            </div>

            {/* KALP + hidden costs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">KALP-kalkyl</p>
                <p className={`text-xl font-black ${analysis.kalp_ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {analysis.kalp_ok ? '✓ Godkänd' : '✗ Ej godkänd'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Kvar efter 70%-regel: {fmt(analysis.kalp)} kr</p>
              </div>
              {analysis.housing.type === 'house' && (
                <div className="rounded-2xl p-4" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p className="text-[10px] text-amber-400 mb-1 uppercase tracking-wider">Dolda kostnader</p>
                  <p className="text-xl font-black text-white">{fmt(analysis.hiddenCosts)} kr</p>
                  <p className="text-[10px] text-slate-500 mt-1">Lagfart + pantbrev</p>
                </div>
              )}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <p className="text-[10px] text-indigo-400 mb-1 uppercase tracking-wider">Värdeutveckling 5 år</p>
                <p className="text-xl font-black text-white">{analysis.value_growth_5y > 0 ? '+' : ''}{analysis.value_growth_5y}%</p>
                <p className="text-[10px] text-slate-500 mt-1">Uppskattning för {analysis.housing.location}</p>
              </div>
            </div>

            {/* Risk factors */}
            {analysis.risk_factors?.length > 0 && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <p className="text-xs font-bold text-rose-400 mb-2 uppercase tracking-wider">⚠️ Riskfaktorer</p>
                <div className="space-y-1">
                  {analysis.risk_factors.map((r, i) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-300">
                      <span className="text-rose-400">→</span>{r}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden tip */}
            {analysis.hidden_tip && (
              <div className="rounded-xl p-3 flex gap-3" style={{ background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-cyan-400 mb-0.5">CFO-tips du missar</p>
                  <p className="text-xs text-slate-300">{analysis.hidden_tip}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}