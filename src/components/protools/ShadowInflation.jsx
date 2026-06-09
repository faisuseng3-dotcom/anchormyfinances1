import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Loader2, ScanSearch, X, Lightbulb } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Proactive lifestyle items based on profile
const LIFESTYLE_ITEMS = [
  { name: 'Kaffe ute (daglig kopp)', monthlyBase: 800, inflationPct: 12 },
  { name: 'Netflix', monthlyBase: 169, inflationPct: 18 },
  { name: 'Bensin / drivmedel', monthlyBase: 1200, inflationPct: 9 },
  { name: 'Matvaror (hushåll)', monthlyBase: 3500, inflationPct: 14 },
  { name: 'Gym-kort', monthlyBase: 450, inflationPct: 7 },
];

function XrayCost({ item, onClose }) {
  const yearlyNow = item.price * 12;
  const insurance = item.price > 5000 ? item.price * 0.015 * 24 : 0;
  const apps = item.price > 3000 ? 1200 : 0;
  const accessories = item.price > 2000 ? 800 : 0;
  const totalLifetime = yearlyNow + insurance + apps + accessories;
  const residual = item.price * 0.45; // avg electronics 2yr residual
  const netCost = totalLifetime - residual;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 mt-3 space-y-3"
      style={{ background: 'rgba(239,68,68,0.07)', boxShadow: 'var(--anchor-shadow-1)' }}>
      <div className="flex justify-between items-start">
        <p className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5"><ScanSearch className="w-3.5 h-3.5" aria-hidden /> Röntgen: {item.name}</p>
        <button onClick={onClose} className="text-slate-500 text-xs hover:text-white" aria-label="Stäng"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between"><span className="text-slate-500">Inköpspris</span><span className="text-white font-medium">{fmt(item.price)} kr</span></div>
        {insurance > 0 && <div className="flex justify-between"><span className="text-slate-500">Försäkring 2 år</span><span className="text-rose-300 font-medium">{fmt(insurance)} kr</span></div>}
        {apps > 0 && <div className="flex justify-between"><span className="text-slate-500">Appar & tjänster</span><span className="text-rose-300 font-medium">{fmt(apps)} kr</span></div>}
        {accessories > 0 && <div className="flex justify-between"><span className="text-slate-500">Tillbehör</span><span className="text-rose-300 font-medium">{fmt(accessories)} kr</span></div>}
        <div className="flex justify-between col-span-2 pt-1 border-t border-white/10">
          <span className="text-slate-400 font-bold">Totalkostnad 24 mån</span>
          <span className="text-rose-400 font-black">{fmt(totalLifetime)} kr</span>
        </div>
        <div className="flex justify-between col-span-2">
          <span className="text-slate-500">Restvärde</span><span className="text-emerald-400">-{fmt(residual)} kr</span>
        </div>
        <div className="flex justify-between col-span-2 border-t border-white/10 pt-1">
          <span className="text-white font-bold">Nettokostnad</span>
          <span className="text-2xl font-black text-rose-400">{fmt(netCost)} kr</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ShadowInflation({ profile }) {
  const [xrayItem, setXrayItem] = useState({ name: '', price: '' });
  const [xrayResult, setXrayResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [aiInflation, setAiInflation] = useState(null);

  const income = profile?.income || 30000;
  const subs = profile?.subscriptions || [];

  // Calculate proactive lifestyle inflation
  const lifestyleItems = LIFESTYLE_ITEMS.map(item => {
    // Override with actual subscription data if available
    const matchingSub = subs.find(s => item.name.toLowerCase().includes(s.name?.toLowerCase()?.split(' ')[0] || ''));
    const base = matchingSub ? matchingSub.amount : item.monthlyBase;
    const nowCost = base;
    const yearAgoCost = Math.round(base / (1 + item.inflationPct / 100));
    const monthlyIncrease = nowCost - yearAgoCost;
    return { ...item, nowCost, yearAgoCost, monthlyIncrease, yearlyExtra: monthlyIncrease * 12 };
  });
  const totalYearlyLoss = lifestyleItems.reduce((s, i) => s + i.yearlyExtra, 0);
  const incomeEquivalentDays = Math.round(totalYearlyLoss / (income / 30));

  const handleXray = () => {
    const price = parseFloat(xrayItem.price);
    if (!price || !xrayItem.name) return;
    setXrayResult({ name: xrayItem.name, price });
  };

  const handleAiScan = async () => {
    setScanning(true);
    const ai = await base44.integrations.Core.InvokeLLM({
      prompt: `Du är en prisanalytiker i Sverige 2026. Analysera hur dessa livsstilskostnader har förändrats sen 2025:
Abonnemang: ${subs.map(s => `${s.name}: ${s.amount} kr`).join(', ') || 'inga registrerade'}
Inkomst: ${fmt(income)} kr/mån

Ge för max 3 kategorier:
- category: kategorinamn
- pct_increase: procentökning sen förra året
- kr_yearly: extra kronor per år
- smart_swap: ett kortare alternativ/byte som sparar pengar
Svara ENDAST med JSON.`,
      response_json_schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                pct_increase: { type: 'number' },
                kr_yearly: { type: 'number' },
                smart_swap: { type: 'string' },
              }
            }
          }
        }
      }
    });
    setAiInflation(ai.items || []);
    setScanning(false);
  };

  return (
    <div className="space-y-5">
      {/* Proactive lifestyle inflation */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(17,24,39,0.7)', boxShadow: 'var(--anchor-shadow-1)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-rose-400" />
          <h3 className="font-semibold text-white">Din Dolda Prislapp</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">Vad din livsstil kostar <em>mer</em> än för ett år sedan</p>

        <div className="space-y-3">
          {lifestyleItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-slate-300">{item.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="h-1 bg-white/5 rounded-full flex-1 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, item.inflationPct * 5)}%` }}
                      transition={{ delay: i * 0.1, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full" />
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold flex-shrink-0">+{item.inflationPct}%</span>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-xs font-bold text-rose-400">+{fmt(item.yearlyExtra)} kr/år</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
          <p className="text-xs text-slate-400">Totalt extra per år</p>
          <div className="text-right">
            <p className="text-xl font-black text-rose-400">{fmt(totalYearlyLoss)} kr</p>
            <p className="text-[10px] text-slate-500">= {incomeEquivalentDays} dagslöner</p>
          </div>
        </div>

        <Button onClick={handleAiScan} disabled={scanning}
          className="w-full mt-4 h-10 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-sm font-bold text-white hover:opacity-90">
          {scanning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Skannar dina priser…</> : 'Djup inflationsskanning'}
        </Button>
      </div>

      {/* AI scan results */}
      <AnimatePresence>
        {aiInflation && aiInflation.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {aiInflation.map((item, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.06)', boxShadow: 'var(--anchor-shadow-1)' }}>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold text-white">{item.category}</p>
                  <span className="text-rose-400 font-black text-sm">+{item.pct_increase}%</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">Extra kostnad: <span className="text-rose-300 font-bold">{fmt(item.kr_yearly)} kr/år</span></p>
                <p className="text-xs text-emerald-300 flex items-start gap-1.5"><Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden /> {item.smart_swap}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* X-ray tool */}
      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(17,24,39,0.7)', boxShadow: 'var(--anchor-shadow-1)' }}>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><ScanSearch className="w-3.5 h-3.5" aria-hidden /> Röntgen-knappen – Köp-Scanner</p>
        <p className="text-xs text-slate-500">Klistra in ett köp för att se den <em>verkliga</em> totalkostnaden över 24 månader.</p>
        <div className="grid grid-cols-2 gap-2">
          <Input value={xrayItem.name} onChange={e => setXrayItem(x => ({ ...x, name: e.target.value }))}
            placeholder="iPhone 16 Pro" className="h-10 text-sm" />
          <Input type="number" value={xrayItem.price} onChange={e => setXrayItem(x => ({ ...x, price: e.target.value }))}
            placeholder="Pris (kr)" className="h-10 text-sm" />
        </div>
        <Button onClick={handleXray} disabled={!xrayItem.name || !xrayItem.price}
          className="w-full h-10 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-sm font-bold text-white hover:opacity-90">
          Röntga köpet
        </Button>
        {xrayResult && <XrayCost item={xrayResult} onClose={() => setXrayResult(null)} />}
      </div>
    </div>
  );
}