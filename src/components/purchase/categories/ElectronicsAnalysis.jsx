import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Laptop, Clock, TrendingDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function ElectronicsAnalysis({ mode, profile }) {
  const [device, setDevice] = useState({ name: '', price: '', usage: '' });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);

    if (mode === 'basic') {
      const canAfford = parseInt(device.price) <= profile.buffer;
      setAnalysis({
        type: 'basic',
        price: parseInt(device.price),
        canAfford
      });
      setLoading(false);
      return;
    }

    const prompt = mode === 'smart'
      ? `Analysera elektronikköpet ${device.name} för ${device.price} kr.

Beräkna:
1. Produktens ålder på marknaden (release-datum)
2. Rekommendera refurbished om produkten är >9 månader gammal
3. Nästa modell release (om tillgänglig info)
4. Pris-per-prestanda jämfört med alternativ
5. Bästa köptidpunkt

Ge konkret råd om timing och alternativ.`
      : `ROI-analys för ${device.name} till ${device.price} kr.

Användning: ${device.usage}

Beräkna:
1. Om frilansare/student: Hur många timmar per vecka sparar produkten?
2. Timvärde baserat på uppskattad inkomst
3. Månatligt värde i sparad tid
4. ROI (Return on Investment) - Hur snabbt tjänar produkten in sig?
5. Break-even tidpunkt
6. Produktivitetsvärde över 3 år

Ge strategisk bedömning om detta är en investering eller bara en kostnad.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: mode === 'smart' ? {
          type: 'object',
          properties: {
            product_age_months: { type: 'number' },
            recommend_refurbished: { type: 'boolean' },
            refurbished_price: { type: 'number' },
            next_model_date: { type: 'string' },
            best_timing: { type: 'string' },
            alternative: { type: 'string' }
          }
        } : {
          type: 'object',
          properties: {
            hours_saved_weekly: { type: 'number' },
            hourly_value: { type: 'number' },
            monthly_value: { type: 'number' },
            roi_months: { type: 'number' },
            value_3y: { type: 'number' },
            is_investment: { type: 'boolean' },
            recommendation: { type: 'string' }
          }
        }
      });

      setAnalysis({ type: mode, ...result });
    } catch (error) {
      console.error('Failed to analyze:', error);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dark-card p-6 rounded-2xl"
      >
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Laptop className="w-5 h-5 text-purple-400" />
          Elektronikköp
        </h3>
        <div className="space-y-4">
          <div>
            <Label>Produkt</Label>
            <Input
              value={device.name}
              onChange={(e) => setDevice({ ...device, name: e.target.value })}
              placeholder="t.ex. MacBook Pro M3, iPhone 15 Pro"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Pris (kr)</Label>
            <Input
              type="number"
              value={device.price}
              onChange={(e) => setDevice({ ...device, price: e.target.value })}
              placeholder="25000"
              className="mt-1"
            />
          </div>
          {mode === 'pro' && (
            <div>
              <Label>Användningsområde</Label>
              <Input
                value={device.usage}
                onChange={(e) => setDevice({ ...device, usage: e.target.value })}
                placeholder="t.ex. Frilans webbutveckling, Studier"
                className="mt-1"
              />
            </div>
          )}
        </div>
      </motion.div>

      <Button
        onClick={handleAnalyze}
        disabled={!device.name || !device.price || loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Analyserar produkt...
          </>
        ) : (
          <>Analysera elektronik</>
        )}
      </Button>

      {analysis && (
        <>
          {analysis.type === 'basic' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border-2 ${
                analysis.canAfford
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-rose-500 bg-rose-500/10'
              }`}
            >
              <h3 className="font-bold text-white text-xl mb-2">
                {formatNumber(analysis.price)} kr
              </h3>
              <p className={`text-sm font-medium ${analysis.canAfford ? 'text-emerald-400' : 'text-rose-400'}`}>
                {analysis.canAfford ? '✓ Du har råd' : '⚠️ Du har inte råd'}
              </p>
            </motion.div>
          )}

          {analysis.type === 'smart' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="dark-card p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Produktanalys</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Produktens ålder</p>
                    <p className="text-lg font-bold text-white">{analysis.product_age_months} månader</p>
                  </div>
                  {analysis.next_model_date && (
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Nästa modell förväntas</p>
                      <p className="text-sm text-blue-400">{analysis.next_model_date}</p>
                    </div>
                  )}
                </div>
              </div>

              {analysis.recommend_refurbished && (
                <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-emerald-400" />
                    Rekommendation: Refurbished
                  </h4>
                  <p className="text-sm text-slate-300 mb-3">
                    Produkten är över 9 månader gammal. Överväg renoverad modell.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Refurbished-pris:</span>
                    <span className="text-emerald-400 font-bold">{formatNumber(analysis.refurbished_price)} kr</span>
                  </div>
                  <p className="text-xs text-emerald-300 mt-2">
                    💰 Spara {formatNumber(parseInt(device.price) - analysis.refurbished_price)} kr
                  </p>
                </div>
              )}

              <div className="p-5 rounded-xl dark-card">
                <h4 className="font-semibold text-white mb-2">Bästa köptidpunkt</h4>
                <p className="text-sm text-slate-300">{analysis.best_timing}</p>
              </div>

              {analysis.alternative && (
                <div className="p-5 rounded-xl border border-purple-500/30 bg-purple-500/10">
                  <h4 className="font-semibold text-white mb-2">Alternativ</h4>
                  <p className="text-sm text-slate-300">{analysis.alternative}</p>
                </div>
              )}
            </motion.div>
          )}

          {analysis.type === 'pro' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="dark-card p-6 rounded-2xl">
                <h3 className="font-semibold text-white mb-4">ROI-Analys</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Sparad tid per vecka</p>
                    <p className="text-2xl font-bold text-indigo-400">{analysis.hours_saved_weekly} timmar</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Månatligt värde i sparad tid</p>
                    <p className="text-2xl font-bold text-emerald-400">{formatNumber(analysis.monthly_value)} kr</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Produkten tjänar in sig på</p>
                    <p className="text-2xl font-bold text-blue-400">{analysis.roi_months} månader</p>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Totalt värde över 3 år</p>
                    <p className="text-3xl font-bold text-purple-400">{formatNumber(analysis.value_3y)} kr</p>
                  </div>
                </div>
              </div>

              <div className={`p-5 rounded-xl border ${
                analysis.is_investment
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : 'border-amber-500/30 bg-amber-500/10'
              }`}>
                <h4 className="font-semibold text-white mb-2">
                  {analysis.is_investment ? '✓ Detta är en investering' : '⚠️ Detta är en kostnad'}
                </h4>
                <p className="text-sm text-slate-300">{analysis.recommendation}</p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}