import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, TrendingDown, AlertTriangle, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function VehicleAnalysis({ mode, profile }) {
  const [vehicle, setVehicle] = useState({ name: '', price: '', months: '60' });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);

    if (mode === 'basic') {
      const monthlyPayment = parseInt(vehicle.price) / parseInt(vehicle.months);
      setAnalysis({
        type: 'basic',
        monthlyPayment,
        canAfford: monthlyPayment < (profile.income * 0.2)
      });
      setLoading(false);
      return;
    }

    const prompt = mode === 'smart' 
      ? `Analysera fordonskostnaden för ${vehicle.name} till ${vehicle.price} kr.

Beräkna Total Cost of Ownership (TCO):
- Månadskostnad: Pris/${vehicle.months} månader
- Försäkring: Snitt för fordon i denna prisklass
- Bränsle/El: Uppskattad kostnad per månad
- Service: Årlig service
- Skatt: CO2-baserad fordonsskatt

Ge totala månadskostnaden och jämför med billigare alternativ.`
      : `Strategisk fordonsanalys för ${vehicle.name} till ${vehicle.price} kr.

Beräkna:
1. Värdeminskning efter 36 månader (restvärde)
2. Alternativkostnad: Om ${vehicle.price} kr tas från sparande med 7% årlig avkastning
3. Stress-test: Vad händer om ekonomin försämras?
4. Totala livstidskostnaden (5 år)
5. ROI-analys om fordonet behövs för arbete

Ge strategisk rekommendation.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: mode === 'smart',
        response_json_schema: mode === 'smart' ? {
          type: 'object',
          properties: {
            monthly_payment: { type: 'number' },
            insurance: { type: 'number' },
            fuel: { type: 'number' },
            service: { type: 'number' },
            tax: { type: 'number' },
            total_monthly: { type: 'number' },
            cheaper_alternative: { type: 'string' },
            savings: { type: 'number' }
          }
        } : {
          type: 'object',
          properties: {
            depreciation_36m: { type: 'number' },
            residual_value: { type: 'number' },
            opportunity_cost: { type: 'number' },
            lifetime_cost_5y: { type: 'number' },
            roi_if_work: { type: 'string' },
            risk_level: { type: 'string' },
            recommendation: { type: 'string' },
            is_safe: { type: 'boolean' }
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
          <Car className="w-5 h-5 text-blue-400" />
          Fordonsinformation
        </h3>
        <div className="space-y-4">
          <div>
            <Label>Fordonsmodell</Label>
            <Input
              value={vehicle.name}
              onChange={(e) => setVehicle({ ...vehicle, name: e.target.value })}
              placeholder="t.ex. Tesla Model 3, Volvo XC60"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Inköpspris (kr)</Label>
            <Input
              type="number"
              value={vehicle.price}
              onChange={(e) => setVehicle({ ...vehicle, price: e.target.value })}
              placeholder="500000"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Avbetalningstid (månader)</Label>
            <Input
              type="number"
              value={vehicle.months}
              onChange={(e) => setVehicle({ ...vehicle, months: e.target.value })}
              placeholder="60"
              className="mt-1"
            />
          </div>
        </div>
      </motion.div>

      <Button
        onClick={handleAnalyze}
        disabled={!vehicle.name || !vehicle.price || loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Analyserar TCO...
          </>
        ) : (
          <>Analysera fordon</>
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
                {formatNumber(Math.round(analysis.monthlyPayment))} kr/mån
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
                <h3 className="font-semibold text-white mb-4">Total Cost of Ownership</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Månadskostnad (avbetalning):</span>
                    <span className="text-white font-medium">{formatNumber(analysis.monthly_payment)} kr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Försäkring:</span>
                    <span className="text-white font-medium">{formatNumber(analysis.insurance)} kr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bränsle/El:</span>
                    <span className="text-white font-medium">{formatNumber(analysis.fuel)} kr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Service:</span>
                    <span className="text-white font-medium">{formatNumber(analysis.service)} kr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Skatt:</span>
                    <span className="text-white font-medium">{formatNumber(analysis.tax)} kr</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between">
                    <span className="text-white font-semibold">Total månadskostnad:</span>
                    <span className="text-indigo-400 font-bold text-lg">{formatNumber(analysis.total_monthly)} kr</span>
                  </div>
                </div>
              </div>

              {analysis.cheaper_alternative && (
                <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-emerald-400" />
                    Billigare alternativ
                  </h4>
                  <p className="text-sm text-slate-300 mb-2">{analysis.cheaper_alternative}</p>
                  <p className="text-emerald-400 font-medium">
                    💰 Spara {formatNumber(analysis.savings)} kr/mån
                  </p>
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
                <h3 className="font-semibold text-white mb-4">Strategisk Analys</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Värdeminskning (36 mån)</p>
                    <p className="text-2xl font-bold text-rose-400">-{formatNumber(analysis.depreciation_36m)} kr</p>
                    <p className="text-xs text-slate-500">Restvärde: {formatNumber(analysis.residual_value)} kr</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Alternativkostnad (förlorad avkastning)</p>
                    <p className="text-2xl font-bold text-amber-400">{formatNumber(analysis.opportunity_cost)} kr</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Livstidskostnad (5 år)</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(analysis.lifetime_cost_5y)} kr</p>
                  </div>
                  {analysis.roi_if_work && (
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-sm text-slate-400 mb-1">ROI-analys</p>
                      <p className="text-sm text-slate-300">{analysis.roi_if_work}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={`p-5 rounded-xl border ${
                analysis.is_safe
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : 'border-rose-500/30 bg-rose-500/10'
              }`}>
                <div className="flex items-start gap-3">
                  {analysis.is_safe ? (
                    <Zap className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className="font-semibold text-white mb-1">CFO-rekommendation</h4>
                    <p className="text-sm text-slate-300 mb-2">{analysis.recommendation}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      analysis.risk_level === 'low' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : analysis.risk_level === 'medium'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      Risk: {analysis.risk_level}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}