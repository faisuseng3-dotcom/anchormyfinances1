import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, AlertCircle } from 'lucide-react';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function OpportunityScanner({ profile }) {
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    // Trigger: Balance over 10,000 kr
    if (profile?.buffer < 10000) {
      setScanResult({ 
        triggered: false,
        message: 'Öka din buffert till minst 10 000 kr för att aktivera räntejägaren'
      });
      return;
    }

    // User's current rate (assume 0.5% if not specified)
    const userRate = 0.5;
    const marketBest = 4.2; // Market best rate in 2026
    const balance = profile.buffer;

    // Calculate yearly gain difference
    const userGain = balance * (userRate / 100);
    const marketGain = balance * (marketBest / 100);
    const missedGain = marketGain - userGain;

    setScanResult({
      triggered: true,
      userRate,
      marketBest,
      balance,
      userGain: Math.round(userGain),
      marketGain: Math.round(marketGain),
      missedGain: Math.round(missedGain)
    });
  }, [profile]);

  if (!scanResult) return null;

  if (!scanResult.triggered) {
    return (
      <div className="dark-card p-6 rounded-2xl">
        <p className="text-slate-400 text-sm">{scanResult.message}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="dark-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-blue-400" />
          <h3 className="font-semibold text-white">Räntejägaren</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Ditt sparkonto</p>
            <p className="text-2xl font-bold text-white">{formatNumber(scanResult.balance)} kr</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-xs text-slate-400 mb-1">Din ränta</p>
              <p className="text-lg font-bold text-rose-400">{scanResult.userRate}%</p>
              <p className="text-xs text-slate-500 mt-1">
                {formatNumber(scanResult.userGain)} kr/år
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-xs text-slate-400 mb-1">Marknadens bästa</p>
              <p className="text-lg font-bold text-emerald-400">{scanResult.marketBest}%</p>
              <p className="text-xs text-slate-500 mt-1">
                {formatNumber(scanResult.marketGain)} kr/år
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/10">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-white mb-1">Du förlorar pengar!</h4>
            <p className="text-sm text-slate-300 mb-3">
              Du missar {formatNumber(scanResult.missedGain)} kr per år med nuvarande sparkonto.
            </p>
            <button className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium">
              Jämför sparkonton
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}