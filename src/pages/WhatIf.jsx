import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Heart, TrendingDown, Landmark, Clock, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const scenarios = [
  {
    id: 'sick',
    title: 'Sjukskrivning',
    description: 'Vad händer om jag blir sjukskriven?',
    icon: Heart,
    color: 'bg-rose-100 text-rose-600',
    incomeReduction: 20
  },
  {
    id: 'income_loss',
    title: 'Inkomstbortfall',
    description: 'Vad händer om jag tappar 20% av inkomsten?',
    icon: TrendingDown,
    color: 'bg-amber-100 text-amber-600',
    incomeReduction: 20
  },
  {
    id: 'new_loan',
    title: 'Nytt lån',
    description: 'Vad händer om jag tar ett nytt lån?',
    icon: Landmark,
    color: 'bg-blue-100 text-blue-600',
    newLoanAmount: 50000,
    newLoanMonthly: 1500
  }
];

export default function WhatIf() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [incomeReduction, setIncomeReduction] = useState(20);
  const [newLoanAmount, setNewLoanAmount] = useState(50000);
  const [analysis, setAnalysis] = useState(null);

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  const formatNumber = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
  };

  const runScenario = (scenario) => {
    if (!profile) return;

    setSelectedScenario(scenario);
    
    const totalSubscriptions = (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
    const totalLoanPayments = (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
    let totalFixedCosts = profile.housingCost + totalSubscriptions + totalLoanPayments;
    let newIncome = profile.income;

    if (scenario.id === 'sick' || scenario.id === 'income_loss') {
      newIncome = profile.income * (1 - incomeReduction / 100);
    }

    if (scenario.id === 'new_loan') {
      const monthlyPayment = newLoanAmount * 0.03; // ~3% monthly
      totalFixedCosts += monthlyPayment;
    }

    const newMargin = newIncome - totalFixedCosts;
    const monthsBufferLasts = newMargin < 0 ? profile.buffer / Math.abs(newMargin) : null;

    // Find pausable costs
    const pausableCosts = (profile.subscriptions || [])
      .filter(s => ['entertainment', 'streaming'].includes(s.category))
      .reduce((sum, s) => sum + s.amount, 0);

    setAnalysis({
      currentIncome: profile.income,
      newIncome,
      currentMargin: profile.income - totalFixedCosts + (scenario.id === 'new_loan' ? newLoanAmount * 0.03 : 0),
      newMargin,
      buffer: profile.buffer,
      monthsBufferLasts,
      pausableCosts,
      savingsGoal: profile.savingsGoal,
      savingsImpact: newMargin > 0 ? 0 : Math.round((Math.abs(newMargin) / profile.savingsGoal) * 100)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">What If?</h1>
            <p className="text-sm text-slate-500">Simulera framtidsscenarier</p>
          </div>
        </div>

        {/* Scenario cards */}
        <div className="space-y-3">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            const isSelected = selectedScenario?.id === scenario.id;
            
            return (
              <motion.button
                key={scenario.id}
                onClick={() => runScenario(scenario)}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-100 bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${scenario.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{scenario.title}</h3>
                    <p className="text-sm text-slate-500">{scenario.description}</p>
                  </div>
                  <Zap className={`w-5 h-5 ${isSelected ? 'text-emerald-500' : 'text-slate-300'}`} />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Slider controls */}
        {selectedScenario && (selectedScenario.id === 'sick' || selectedScenario.id === 'income_loss') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-white rounded-xl border border-slate-100"
          >
            <p className="text-sm text-slate-600 mb-3">Inkomstbortfall: {incomeReduction}%</p>
            <Slider
              value={[incomeReduction]}
              onValueChange={([val]) => {
                setIncomeReduction(val);
                runScenario({ ...selectedScenario, incomeReduction: val });
              }}
              max={50}
              min={10}
              step={5}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>10%</span>
              <span>50%</span>
            </div>
          </motion.div>
        )}

        {selectedScenario && selectedScenario.id === 'new_loan' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-white rounded-xl border border-slate-100"
          >
            <p className="text-sm text-slate-600 mb-3">Lånebelopp: {formatNumber(newLoanAmount)} kr</p>
            <Slider
              value={[newLoanAmount]}
              onValueChange={([val]) => {
                setNewLoanAmount(val);
                runScenario({ ...selectedScenario, newLoanAmount: val });
              }}
              max={200000}
              min={10000}
              step={10000}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>10 000 kr</span>
              <span>200 000 kr</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Analysis Result */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 space-y-4"
          >
            {/* Impact summary */}
            <div className={`p-5 rounded-2xl ${
              analysis.newMargin >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
            }`}>
              <p className="text-white/80 text-sm">Ny månadsmarginal</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                {formatNumber(Math.round(analysis.newMargin))} kr
              </h3>
              <p className="text-white/80 text-sm mt-2">
                {analysis.newMargin >= 0 
                  ? 'Du klarar dig ekonomiskt i detta scenario.'
                  : `Du går back ${formatNumber(Math.abs(Math.round(analysis.newMargin)))} kr per månad.`}
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white rounded-xl border border-slate-100">
                <Clock className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-xs text-slate-500">Buffert räcker</p>
                <p className="text-lg font-semibold text-slate-900">
                  {analysis.monthsBufferLasts 
                    ? `${analysis.monthsBufferLasts.toFixed(1)} mån`
                    : '∞'}
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-100">
                <Shield className="w-5 h-5 text-emerald-500 mb-2" />
                <p className="text-xs text-slate-500">Pausbara kostnader</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatNumber(analysis.pausableCosts)} kr
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h4 className="font-semibold text-slate-900 mb-4">Åtgärdsförslag</h4>
              <div className="space-y-3">
                {analysis.pausableCosts > 0 && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Pausa nöjesabonnemang</p>
                      <p className="text-sm text-slate-500">
                        Spara {formatNumber(analysis.pausableCosts)} kr/mån genom att tillfälligt pausa streaming och nöje.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Kontakta långivare</p>
                    <p className="text-sm text-slate-500">
                      Vid tillfälliga svårigheter kan du förhandla om amorteringsfrihet.
                    </p>
                  </div>
                </div>

                {analysis.newMargin < 0 && (
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Bygg buffert nu</p>
                      <p className="text-sm text-slate-500">
                        Din buffert på {formatNumber(analysis.buffer)} kr är viktig. Försök spara mer.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}