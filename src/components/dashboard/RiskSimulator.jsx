import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, TrendingDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function RiskSimulator({ profile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState(null);

  const runSimulation = () => {
    const reducedIncome = profile.income * 0.5;
    const totalSubscriptions = (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
    const totalLoanPayments = (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
    const totalFixedCosts = profile.housingCost + totalSubscriptions + totalLoanPayments;
    
    const monthlyDeficit = totalFixedCosts - reducedIncome;
    const monthsOfBuffer = monthlyDeficit > 0 ? Math.floor(profile.buffer / monthlyDeficit) : 999;
    
    const simulation = {
      reducedIncome,
      totalFixedCosts,
      monthlyDeficit,
      monthsOfBuffer,
      bufferRemaining: Math.max(0, profile.buffer - (monthlyDeficit * 2))
    };

    setResult(simulation);

    base44.analytics.track({
      eventName: 'risk_simulation_run',
      properties: {
        months_of_buffer: monthsOfBuffer
      }
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 border border-amber-100"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Risk-simulering</h3>
            <p className="text-xs text-slate-500">Testa din ekonomiska motståndskraft</p>
          </div>
        </div>

        <Button
          onClick={() => {
            setIsOpen(true);
            runSimulation();
          }}
          variant="outline"
          className="w-full h-10 rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50"
        >
          Kör simulering
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Risk-simulering</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-amber-900">
                    <strong>Scenario:</strong> Du förlorar 50% av din inkomst i 2 månader
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Nuvarande inkomst</span>
                      <span className="font-semibold text-slate-900">{formatNumber(profile.income)} kr</span>
                    </div>
                    <div className="flex items-center gap-2 text-rose-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-sm font-medium">50% minskning</span>
                    </div>
                  </div>

                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                    <p className="text-sm text-rose-700 mb-2">Ny inkomst</p>
                    <p className="text-2xl font-bold text-rose-900">{formatNumber(result.reducedIncome)} kr</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600 mb-2">Fasta kostnader per månad</p>
                    <p className="text-xl font-bold text-slate-900">{formatNumber(result.totalFixedCosts)} kr</p>
                  </div>

                  {result.monthlyDeficit > 0 && (
                    <>
                      <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl">
                        <p className="text-sm text-rose-700 mb-2">Månatligt underskott</p>
                        <p className="text-2xl font-bold text-rose-900">-{formatNumber(result.monthlyDeficit)} kr</p>
                      </div>

                      <div className="p-5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white">
                        <p className="text-white/80 text-sm mb-2">Din buffert räcker i</p>
                        <p className="text-4xl font-bold mb-3">
                          {result.monthsOfBuffer < 2 ? '⚠️ ' : ''} 
                          {result.monthsOfBuffer} {result.monthsOfBuffer === 1 ? 'månad' : 'månader'}
                        </p>
                        <p className="text-white/80 text-sm">
                          Efter 2 månader: {formatNumber(result.bufferRemaining)} kr kvar
                        </p>
                      </div>

                      {result.monthsOfBuffer < 3 && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                          <p className="font-semibold text-amber-900 mb-2">💡 Rekommendation</p>
                          <p className="text-sm text-amber-800">
                            Din buffert är under 3 månaders kostnader. Överväg att:
                          </p>
                          <ul className="text-sm text-amber-800 mt-2 space-y-1 list-disc list-inside">
                            <li>Öka sparandet när möjligt</li>
                            <li>Granska och minska fasta kostnader</li>
                            <li>Bygga en starkare ekonomisk buffert</li>
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <Button
                  onClick={() => setIsOpen(false)}
                  className="w-full h-12 rounded-xl mt-6 bg-slate-800 hover:bg-slate-900"
                >
                  Stäng
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}