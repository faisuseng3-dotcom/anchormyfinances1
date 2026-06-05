import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Home, Car, Wallet } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function NetWorthDashboard({ profile }) {
  const [assets, setAssets] = useState({
    homeValue: '',
    carValue: '',
    investments: ''
  });
  const [calculated, setCalculated] = useState(false);

  const calculate = () => {
    setCalculated(true);
  };

  const totalAssets = 
    (profile?.buffer || 0) +
    parseFloat(assets.homeValue || 0) +
    parseFloat(assets.carValue || 0) +
    parseFloat(assets.investments || 0);

  const totalDebts = (profile?.loans || []).reduce((sum, loan) => 
    sum + loan.totalAmount, 0
  );

  const netWorth = totalAssets - totalDebts;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="dark-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-indigo-400" />
          <h3 className="font-semibold text-white">Net Worth Dashboard</h3>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <Label className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Bostad (marknadsvärde)
            </Label>
            <Input
              type="number"
              value={assets.homeValue}
              onChange={(e) => setAssets({...assets, homeValue: e.target.value})}
              placeholder="0"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Fordon (marknadsvärde)
            </Label>
            <Input
              type="number"
              value={assets.carValue}
              onChange={(e) => setAssets({...assets, carValue: e.target.value})}
              placeholder="0"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Investeringar (fonder, aktier)
            </Label>
            <Input
              type="number"
              value={assets.investments}
              onChange={(e) => setAssets({...assets, investments: e.target.value})}
              placeholder="0"
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={calculate}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600"
        >
          Beräkna Net Worth
        </Button>
      </div>

      {calculated && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="glass-effect p-6 rounded-2xl text-center">
            <p className="text-sm text-slate-400 mb-2">Din totala förmögenhet</p>
            <p className={`text-5xl font-bold ${
              netWorth >= 0 
                ? 'bg-gradient-to-r from-emerald-400 to-green-400' 
                : 'bg-gradient-to-r from-rose-400 to-red-400'
              } bg-clip-text text-transparent`}
            >
              {formatNumber(Math.round(netWorth))} kr
            </p>
          </div>

          <div className="dark-card p-6 rounded-2xl">
            <h4 className="font-semibold text-white mb-4">Detaljerad Uppdelning</h4>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Likvida medel</span>
                <span className="font-medium text-white">{formatNumber(profile?.buffer || 0)} kr</span>
              </div>
              {parseFloat(assets.homeValue) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Bostadsvärde</span>
                  <span className="font-medium text-white">{formatNumber(parseFloat(assets.homeValue))} kr</span>
                </div>
              )}
              {parseFloat(assets.carValue) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Fordonsvärde</span>
                  <span className="font-medium text-white">{formatNumber(parseFloat(assets.carValue))} kr</span>
                </div>
              )}
              {parseFloat(assets.investments) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Investeringar</span>
                  <span className="font-medium text-white">{formatNumber(parseFloat(assets.investments))} kr</span>
                </div>
              )}
              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm font-semibold text-white">Totala tillgångar</span>
                <span className="font-bold text-emerald-400">{formatNumber(Math.round(totalAssets))} kr</span>
              </div>
            </div>

            <div className="space-y-3">
              {(profile?.loans || []).map((loan, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">{loan.name}</span>
                  <span className="font-medium text-rose-400">-{formatNumber(loan.totalAmount)} kr</span>
                </div>
              ))}
              {totalDebts > 0 && (
                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">Totala skulder</span>
                  <span className="font-bold text-rose-400">-{formatNumber(Math.round(totalDebts))} kr</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}