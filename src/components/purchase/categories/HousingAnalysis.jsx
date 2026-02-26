import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, MapPin, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function HousingAnalysis({ mode, profile }) {
  const [housing, setHousing] = useState({ 
    type: '', 
    price: '', 
    monthly: '',
    location: '',
    distance: ''
  });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);

    if (mode === 'basic') {
      const canAfford = parseInt(housing.monthly) < (profile.income * 0.3);
      setAnalysis({
        type: 'basic',
        monthly: parseInt(housing.monthly),
        canAfford
      });
      setLoading(false);
      return;
    }

    const prompt = mode === 'smart'
      ? `Analysera bostadskostnaden för ${housing.type} i ${housing.location}.

Månadskostnad: ${housing.monthly} kr
Distans till jobb: ${housing.distance} km

Beräkna:
1. Pendlingskostnad (SL-kort eller bensin baserat på distans)
2. Total månadskostnad (boende + pendling)
3. Jämför med alternativ närmare arbetsplatsen
4. Slutsats: Är den dyrare men närmare lägenheten faktiskt billigare totalt?`
      : `Strategisk bostadsanalys för ${housing.type} till ${housing.price} kr med ${housing.monthly} kr/mån.

Beräkna:
1. Stress-test med ränta +1%, +2%, +4%
2. Kassaflöde i varje scenario
3. Risk-bedömning: Blir kassaflödet negativt?
4. Långsiktig värdetillväxt baserat på område
5. Break-even punkt vs hyra

Flagga som High Risk om kassaflödet blir negativt vid +4% ränta.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: mode === 'smart' ? {
          type: 'object',
          properties: {
            commute_cost: { type: 'number' },
            total_monthly: { type: 'number' },
            closer_alternative: { type: 'string' },
            closer_cost: { type: 'number' },
            conclusion: { type: 'string' }
          }
        } : {
          type: 'object',
          properties: {
            current_cashflow: { type: 'number' },
            stress_1: { type: 'number' },
            stress_2: { type: 'number' },
            stress_4: { type: 'number' },
            risk_level: { type: 'string' },
            value_growth_10y: { type: 'number' },
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
          <Home className="w-5 h-5 text-emerald-400" />
          Boendeinformation
        </h3>
        <div className="space-y-4">
          <div>
            <Label>Typ av boende</Label>
            <Input
              value={housing.type}
              onChange={(e) => setHousing({ ...housing, type: e.target.value })}
              placeholder="t.ex. 3:a i Södermalm, Villa i Nacka"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Pris (kr)</Label>
              <Input
                type="number"
                value={housing.price}
                onChange={(e) => setHousing({ ...housing, price: e.target.value })}
                placeholder="4500000"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Månadskostnad (kr)</Label>
              <Input
                type="number"
                value={housing.monthly}
                onChange={(e) => setHousing({ ...housing, monthly: e.target.value })}
                placeholder="12000"
                className="mt-1"
              />
            </div>
          </div>
          {mode !== 'basic' && (
            <>
              <div>
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Område
                </Label>
                <Input
                  value={housing.location}
                  onChange={(e) => setHousing({ ...housing, location: e.target.value })}
                  placeholder="t.ex. Södermalm, Nacka"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Distans till jobb (km)</Label>
                <Input
                  type="number"
                  value={housing.distance}
                  onChange={(e) => setHousing({ ...housing, distance: e.target.value })}
                  placeholder="15"
                  className="mt-1"
                />
              </div>
            </>
          )}
        </div>
      </motion.div>

      <Button
        onClick={handleAnalyze}
        disabled={!housing.type || !housing.monthly || loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Analyserar boende...
          </>
        ) : (
          <>Analysera boende</>
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
                {formatNumber(analysis.monthly)} kr/mån
              </h3>
              <p className={`text-sm font-medium ${analysis.canAfford ? 'text-emerald-400' : 'text-rose-400'}`}>
                {analysis.canAfford ? '✓ Du har råd' : '⚠️ Över 30% av din inkomst'}
              </p>
            </motion.div>
          )}

          {analysis.type === 'smart' && analysis.commute_cost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="dark-card p-6 rounded-2xl">
                <h3 className="font-semibold text-white mb-4">Total Boendekostnad</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Boende:</span>
                    <span className="text-white font-medium">{formatNumber(parseInt(housing.monthly))} kr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pendling:</span>
                    <span className="text-white font-medium">{formatNumber(analysis.commute_cost)} kr</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between">
                    <span className="text-white font-semibold">Total månadskostnad:</span>
                    <span className="text-indigo-400 font-bold text-lg">{formatNumber(analysis.total_monthly)} kr</span>
                  </div>
                </div>
              </div>

              {analysis.closer_alternative && (
                <div className="p-5 rounded-xl border border-blue-500/30 bg-blue-500/10">
                  <h4 className="font-semibold text-white mb-2">Alternativ närmare jobbet</h4>
                  <p className="text-sm text-slate-300 mb-3">{analysis.closer_alternative}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Total kostnad:</span>
                    <span className="text-blue-400 font-bold">{formatNumber(analysis.closer_cost)} kr/mån</span>
                  </div>
                  <p className="text-xs text-blue-300 mt-3">{analysis.conclusion}</p>
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
                <h3 className="font-semibold text-white mb-4">Ränte-stresstester</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">Nuvarande kassaflöde</span>
                      <span className="text-emerald-400 font-bold">{formatNumber(analysis.current_cashflow)} kr</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">Vid ränta +1%</span>
                      <span className={`font-bold ${analysis.stress_1 > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {formatNumber(analysis.stress_1)} kr
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">Vid ränta +2%</span>
                      <span className={`font-bold ${analysis.stress_2 > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatNumber(analysis.stress_2)} kr
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">Vid ränta +4%</span>
                      <span className={`font-bold ${analysis.stress_4 > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatNumber(analysis.stress_4)} kr
                      </span>
                    </div>
                  </div>
                  {analysis.value_growth_10y > 0 && (
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-slate-400">Värdetillväxt (10 år)</span>
                      </div>
                      <p className="text-2xl font-bold text-emerald-400">+{formatNumber(analysis.value_growth_10y)} kr</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={`p-5 rounded-xl border ${
                analysis.is_safe
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : 'border-rose-500/30 bg-rose-500/10'
              }`}>
                <h4 className="font-semibold text-white mb-2">
                  {analysis.risk_level === 'low' && '✓ Låg risk'}
                  {analysis.risk_level === 'medium' && '⚠️ Medelhög risk'}
                  {analysis.risk_level === 'high' && '🚫 Hög risk'}
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