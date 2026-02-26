import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

const parseNumber = (value) => {
  return parseFloat(value.replace(/\s/g, '')) || 0;
};

export default function BasicTravelPlanner({ profile }) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [month, setMonth] = useState('');
  const [costs, setCosts] = useState({
    flight: '',
    accommodation: '',
    food: '',
    activities: '',
    other: ''
  });
  const [saved, setSaved] = useState(false);

  const totalSubscriptions = (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
  const totalLoanPayments = (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
  const fixedExpenses = profile.housingCost + totalSubscriptions + totalLoanPayments;
  const availableBalance = profile.income - fixedExpenses;

  const totalCost = 
    parseNumber(costs.flight) +
    parseNumber(costs.accommodation) +
    parseNumber(costs.food) +
    parseNumber(costs.activities) +
    parseNumber(costs.other);

  const isOverBudget = totalCost > availableBalance;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Antal dagar</Label>
              <Input
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="7"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Resmånad</Label>
              <Input
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="Maj"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cost Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="dark-card p-6 rounded-2xl"
      >
        <h3 className="font-semibold text-white mb-4">Budgetera dina kostnader</h3>
        <div className="space-y-4">
          {[
            { key: 'flight', label: 'Flyg', icon: '✈️' },
            { key: 'accommodation', label: 'Boende', icon: '🏨' },
            { key: 'food', label: 'Mat', icon: '🍽️' },
            { key: 'activities', label: 'Aktiviteter', icon: '🎭' },
            { key: 'other', label: 'Övrigt', icon: '💰' }
          ].map((item) => (
            <div key={item.key}>
              <Label className="flex items-center gap-2">
                <span>{item.icon}</span>
                {item.label}
              </Label>
              <div className="relative mt-1">
                <Input
                  value={costs[item.key]}
                  onChange={(e) => setCosts({ ...costs, [item.key]: e.target.value })}
                  placeholder="0"
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">kr</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Total Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`p-6 rounded-2xl border-2 ${
          isOverBudget 
            ? 'border-rose-500 bg-rose-500/10' 
            : 'border-emerald-500 bg-emerald-500/10'
        }`}
      >
        <div className="flex items-start gap-4">
          {isOverBudget ? (
            <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-1" />
          ) : (
            <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-2">Total kostnad</h3>
            <p className="text-3xl font-bold text-white mb-3">{formatNumber(totalCost)} kr</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Tillgängligt efter fasta kostnader:</span>
                <span className="text-white font-medium">{formatNumber(availableBalance)} kr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kvar efter resan:</span>
                <span className={`font-medium ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatNumber(availableBalance - totalCost)} kr
                </span>
              </div>
            </div>
            {isOverBudget && (
              <p className="text-rose-400 text-sm mt-3 font-medium">
                ⚠️ Varning: Du överskrider din budget med {formatNumber(totalCost - availableBalance)} kr
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={!destination || totalCost === 0}
        className={`w-full h-12 rounded-xl ${
          isOverBudget 
            ? 'bg-rose-500 hover:bg-rose-600' 
            : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
        }`}
      >
        {saved ? '✓ Budget sparad!' : 'Spara resebudget'}
      </Button>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-4 rounded-xl text-center"
        >
          <p className="text-sm text-slate-300">
            Din {destination}-budget är nu sparad och dras från ditt kvarvarande saldo för {month || 'den valda månaden'}.
          </p>
        </motion.div>
      )}
    </div>
  );
}