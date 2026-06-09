// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Target, Calendar, Zap, Ban, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { base44 } from '@/api/base44Client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function ProTravelPlanner({ profile }) {
  const [destination, setDestination] = useState('');
  const [travelCost, setTravelCost] = useState(15000);
  const [simulation, setSimulation] = useState(null);
  const [stabilityScore, setStabilityScore] = useState(100);
  const [impactData, setImpactData] = useState([]);
  const [loading, setLoading] = useState(false);

  const totalSubscriptions = (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
  const totalLoanPayments = (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
  const fixedExpenses = profile.housingCost + totalSubscriptions + totalLoanPayments;
  const monthlySavings = (profile.income - fixedExpenses) * 0.3;

  useEffect(() => {
    generateSimulation();
  }, [travelCost]);

  const generateSimulation = () => {
    const data = [];
    let currentWealth = profile.buffer;
    
    // Month 0: Current state
    data.push({
      month: 0,
      label: 'Nu',
      wealth: currentWealth,
      withTravel: currentWealth
    });

    // Month 1: Travel impact
    const wealthAfterTravel = currentWealth - travelCost;
    data.push({
      month: 1,
      label: 'Mån 1',
      wealth: currentWealth + monthlySavings,
      withTravel: wealthAfterTravel + monthlySavings
    });

    // Months 2-12: Projection
    for (let i = 2; i <= 12; i++) {
      const wealthWithout = data[i-1].wealth + monthlySavings;
      const wealthWith = data[i-1].withTravel + monthlySavings;
      data.push({
        month: i,
        label: `Mån ${i}`,
        wealth: wealthWithout,
        withTravel: wealthWith
      });
    }

    setImpactData(data);

    // Calculate stability score
    const criticalBuffer = fixedExpenses * 2;
    const postTravelBuffer = wealthAfterTravel;
    
    let score = 100;
    if (postTravelBuffer < criticalBuffer) {
      const deficit = ((criticalBuffer - postTravelBuffer) / criticalBuffer) * 100;
      score = Math.max(0, 100 - deficit);
    }
    
    setStabilityScore(Math.round(score));
  };

  const handleStrategicAnalysis = async () => {
    setLoading(true);

    const prompt = `Du är en strategisk CFO. Analysera denna reseinvestering:

Användardata:
- Månadsinkomst: ${profile.income} kr
- Fasta kostnader: ${fixedExpenses} kr
- Nuvarande buffert: ${profile.buffer} kr
- Sparmål: ${profile.savingsGoal} kr (${profile.savingsGoalName || 'Långsiktigt mål'})
- Månatligt sparande: ${Math.round(monthlySavings)} kr

Resekostnad: ${travelCost} kr till ${destination}

Beräkna:
1. Hur många månader fördröjs sparmålet?
2. Financial Stability Score (0-100)
3. Risk-analys: Går det under kritisk buffert-nivå (2 månadslöner)?
4. Strategisk rekommendation: Är denna utgift säker för långsiktig plan?
5. Alternative scenario: Vad händer om resan skjuts upp 3 månader?`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            goal_delay_months: { type: 'number' },
            stability_score: { type: 'number' },
            risk_analysis: { type: 'string' },
            strategic_recommendation: { type: 'string' },
            is_safe: { type: 'boolean' },
            alternative_scenario: { type: 'string' }
          }
        }
      });

      setSimulation(result);
    } catch (error) {
      console.error('Failed to analyze:', error);
    }

    setLoading(false);
  };

  const isRisky = stabilityScore < 60;
  const isCritical = stabilityScore < 40;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dark-card p-6 rounded-2xl"
      >
        <h3 className="font-semibold text-white mb-4">Reseinformation</h3>
        <div className="space-y-4">
          <div>
            <Label>Destination</Label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="t.ex. Madrid"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="flex items-center justify-between">
              <span>Total resekostnad</span>
              <span className="text-indigo-400 font-medium">{formatNumber(travelCost)} kr</span>
            </Label>
            <Slider
              value={[travelCost]}
              onValueChange={(value) => setTravelCost(value[0])}
              min={5000}
              max={50000}
              step={1000}
              className="mt-3"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>5 000 kr</span>
              <span>50 000 kr</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Impact Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="dark-card p-6 rounded-2xl"
      >
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          12-månaders kassaflödesprognos
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={impactData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="label" 
              stroke="#9CA3AF" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9CA3AF" 
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `${Math.round(value/1000)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value) => `${formatNumber(value)} kr`}
            />
            <ReferenceLine 
              y={fixedExpenses * 2} 
              stroke="#EF4444" 
              strokeDasharray="3 3"
              label={{ value: 'Kritisk nivå', fill: '#EF4444', fontSize: 10 }}
            />
            <Line 
              type="monotone" 
              dataKey="wealth" 
              stroke="#6366F1" 
              strokeWidth={2}
              name="Utan resa"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="withTravel" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Med resa"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full" />
            <span className="text-slate-400">Utan resa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            <span className="text-slate-400">Med resa</span>
          </div>
        </div>
      </motion.div>

      {/* Stability Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`p-6 rounded-3xl-2 ${
          isCritical 
            ? 'border-rose-500 bg-rose-500/10' 
            : isRisky 
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-emerald-500 bg-emerald-500/10'
        }`}
      >
        <div className="flex items-start gap-4">
          {isCritical ? (
            <AlertTriangle className="w-8 h-8 text-rose-400 flex-shrink-0" />
          ) : isRisky ? (
            <AlertTriangle className="w-8 h-8 text-amber-400 flex-shrink-0" />
          ) : (
            <Target className="w-8 h-8 text-emerald-400 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Financial Stability Score</h3>
            <p className="text-4xl font-bold text-white mb-3">{stabilityScore}/100</p>
            {isCritical && (
              <p className="text-rose-400 text-sm font-medium">
                <span className="inline-flex items-center gap-1"><Ban className="w-4 h-4" /> KRITISK: Denna resa tömmer bufferten under säker nivå. Strategiskt godkännande blockerat.</span>
              </p>
            )}
            {isRisky && !isCritical && (
              <p className="text-amber-400 text-sm font-medium">
                <span className="inline-flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> RISK: Bufferten blir låg. Överväg att minska kostnaden eller skjuta upp resan.</span>
              </p>
            )}
            {!isRisky && (
              <p className="text-emerald-400 text-sm font-medium">
                <span className="inline-flex items-center gap-1"><Check className="w-4 h-4" /> SÄKER: Denna utgift är strategiskt godkänd för din långsiktiga plan.</span>
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Strategic Analysis Button */}
      <Button
        onClick={handleStrategicAnalysis}
        disabled={!destination || loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
      >
        {loading ? (
          <>
            <Zap className="w-5 h-5 mr-2 animate-pulse" />
            Kör strategisk analys...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 mr-2" />
            Kör CFO-analys
          </>
        )}
      </Button>

      {/* Strategic Analysis Results */}
      {simulation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Goal Delay */}
          <div className="dark-card p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <h4 className="font-semibold text-white">Påverkan på sparmål</h4>
            </div>
            <p className="text-2xl font-bold text-blue-400 mb-2">
              +{simulation.goal_delay_months} månader
            </p>
            <p className="text-sm text-slate-400">
              Denna resa fördröjer ditt {profile.savingsGoalName || 'sparmål'} med {simulation.goal_delay_months} månader.
            </p>
          </div>

          {/* Risk Analysis */}
          <div className="dark-card p-5 rounded-xl">
            <h4 className="font-semibold text-white mb-2">Riskanalys</h4>
            <p className="text-sm text-slate-300">{simulation.risk_analysis}</p>
          </div>

          {/* Strategic Recommendation */}
          <div className={`p-5 rounded-2xl ${
            simulation.is_safe 
              ? 'border-emerald-500/30 bg-emerald-500/10' 
              : 'border-rose-500/30 bg-rose-500/10'
          }`}>
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              {simulation.is_safe ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} CFO-rekommendation
            </h4>
            <p className="text-sm text-slate-300 mb-3">{simulation.strategic_recommendation}</p>
            {simulation.alternative_scenario && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-1">Alternativt scenario:</p>
                <p className="text-sm text-slate-300">{simulation.alternative_scenario}</p>
              </div>
            )}
          </div>

          {/* Trade-off Confirmation */}
          {!simulation.is_safe ? (
            <div className="dark-card p-5 rounded-xl text-center">
              <p className="text-sm text-slate-400 mb-3">
                Är du okej med denna trade-off?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="rounded-xl">
                  Nej, justera
                </Button>
                <Button className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600">
                  Ja, jag accepterar
                </Button>
              </div>
            </div>
          ) : (
            <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700">
              <Check className="w-4 h-4 mr-1" /> Godkänn strategisk reseinvestering
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}