import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function LegacyPlanner({ profile }) {
  const [result, setResult] = useState(null);

  const runStressTest = () => {
    if (!profile) return;

    // Simulate: Main income = 0
    const totalSubs = (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
    const totalLoans = (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
    const monthlyExpenses = profile.housingCost + totalSubs + totalLoans;

    const totalAssets = profile.buffer;
    const monthsSurvival = totalAssets / monthlyExpenses;

    const isRisky = monthsSurvival < 6;

    setResult({
      monthsSurvival: monthsSurvival.toFixed(1),
      monthlyExpenses,
      totalAssets,
      isRisky,
      recommendation: isRisky 
        ? 'Öka bufferten eller teckna livförsäkring för att skydda familjen.'
        : 'Din familj klarar sig i minst 6 månader. Bra trygghet!'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="dark-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-purple-400" />
          <h3 className="font-semibold text-white">Legacy Planner</h3>
        </div>

        <p className="text-sm text-slate-400 mb-6">
          Stress-test: Hur länge klarar sig familjen om huvudinkomsten försvinner?
        </p>

        <Button
          onClick={runStressTest}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600"
        >
          Kör Stress-test
        </Button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className={`p-6 rounded-2xl border-2 ${
            result.isRisky
              ? 'border-rose-500 bg-rose-500/10'
              : 'border-emerald-500 bg-emerald-500/10'
          }`}>
            <div className="flex items-start gap-3 mb-4">
              {result.isRisky ? (
                <AlertTriangle className="w-8 h-8 text-rose-400 flex-shrink-0" />
              ) : (
                <Shield className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              )}
              <div>
                <h4 className="font-semibold text-white mb-1">Stress-test Resultat</h4>
                <p className={`text-sm ${result.isRisky ? 'text-rose-300' : 'text-emerald-300'}`}>
                  {result.recommendation}
                </p>
              </div>
            </div>

            <div className="glass-effect p-6 rounded-xl text-center">
              <p className="text-sm text-slate-400 mb-2">Familjen klarar sig</p>
              <p className={`text-5xl font-bold ${result.isRisky ? 'text-rose-400' : 'text-emerald-400'}`}>
                {result.monthsSurvival}
              </p>
              <p className="text-sm text-slate-400 mt-2">månader utan inkomst</p>
            </div>
          </div>

          <div className="dark-card p-6 rounded-2xl">
            <h4 className="font-semibold text-white mb-4">Detaljer</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Tillgängliga medel:</span>
                <span className="text-white font-medium">{formatNumber(result.totalAssets)} kr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Månadskostnader:</span>
                <span className="text-white font-medium">{formatNumber(result.monthlyExpenses)} kr</span>
              </div>
            </div>
          </div>

          {result.isRisky && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
              <p className="text-sm font-semibold text-amber-400 mb-2">
                💡 Rekommendationer:
              </p>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>• Öka bufferten till minst 6 månadslöner</li>
                <li>• Teckna livförsäkring motsvarande 3-5 årslöner</li>
                <li>• Dokumentera alla tillgångar och skulder</li>
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}