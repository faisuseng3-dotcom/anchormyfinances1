import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, MapPin, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function SmartTravelPlanner({ profile }) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [month, setMonth] = useState('');
  const [userBudget, setUserBudget] = useState({
    flight: '',
    accommodation: '',
    activities: ''
  });
  const [marketData, setMarketData] = useState(null);
  const [optimizations, setOptimizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [potentialSavings, setPotentialSavings] = useState(0);

  const handleAnalyze = async () => {
    if (!destination || !days || !month) return;
    
    setLoading(true);

    const prompt = `Analysera resealternativ till ${destination} i ${month} för ${days} dagar.

Användarens budget:
- Flyg: ${userBudget.flight || 'Ej angivet'} kr
- Boende: ${userBudget.accommodation || 'Ej angivet'} kr
- Aktiviteter: ${userBudget.activities || 'Ej angivet'} kr

Ge:
1. Genomsnittliga marknadspriser för destination och månad
2. 3 konkreta optimeringsförslag med alternativ som har bättre betyg eller lägre pris
3. Beräknade besparingar per förslag
4. Pristrend: är destinationen dyr eller billig just nu?

Var specifik med hotellnamn, flygbolag eller aktiviteter.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            market_averages: {
              type: 'object',
              properties: {
                flight: { type: 'number' },
                accommodation_per_night: { type: 'number' },
                activities_daily: { type: 'number' }
              }
            },
            optimizations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  current: { type: 'string' },
                  suggestion: { type: 'string' },
                  savings: { type: 'number' },
                  rating_improvement: { type: 'string' }
                }
              }
            },
            price_trend: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                reason: { type: 'string' }
              }
            },
            total_potential_savings: { type: 'number' }
          }
        }
      });

      setMarketData(result);
      setOptimizations(result.optimizations || []);
      setPotentialSavings(result.total_potential_savings || 0);
    } catch (error) {
      console.error('Failed to analyze:', error);
    }

    setLoading(false);
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

      {/* User Budget Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="dark-card p-6 rounded-2xl"
      >
        <h3 className="font-semibold text-white mb-4">Din budget (valfritt)</h3>
        <div className="space-y-4">
          {[
            { key: 'flight', label: 'Flyg', icon: '✈️' },
            { key: 'accommodation', label: 'Boende per natt', icon: '🏨' },
            { key: 'activities', label: 'Aktiviteter per dag', icon: '🎭' }
          ].map((item) => (
            <div key={item.key}>
              <Label className="flex items-center gap-2">
                <span>{item.icon}</span>
                {item.label}
              </Label>
              <div className="relative mt-1">
                <Input
                  value={userBudget[item.key]}
                  onChange={(e) => setUserBudget({ ...userBudget, [item.key]: e.target.value })}
                  placeholder="0"
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">kr</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Analyze Button */}
      <Button
        onClick={handleAnalyze}
        disabled={!destination || !days || !month || loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
      >
        {loading ? (
          <>
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            Analyserar marknadspriser...
          </>
        ) : (
          <>
            <MapPin className="w-5 h-5 mr-2" />
            Hitta smarta alternativ
          </>
        )}
      </Button>

      {/* Market Data */}
      {marketData && (
        <>
          {/* Price Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border ${
              marketData.price_trend?.status === 'cheap' 
                ? 'border-emerald-500/30 bg-emerald-500/10' 
                : 'border-amber-500/30 bg-amber-500/10'
            }`}
          >
            <div className="flex items-start gap-3">
              {marketData.price_trend?.status === 'cheap' ? (
                <TrendingDown className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              ) : (
                <TrendingUp className="w-6 h-6 text-amber-400 flex-shrink-0" />
              )}
              <div>
                <h3 className="font-semibold text-white mb-1">Pristrend</h3>
                <p className="text-sm text-slate-300">{marketData.price_trend?.reason}</p>
              </div>
            </div>
          </motion.div>

          {/* Potential Savings */}
          {potentialSavings > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-effect p-6 rounded-2xl text-center"
            >
              <p className="text-sm text-slate-400 mb-1">Potentiell besparing</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                {formatNumber(potentialSavings)} kr
              </p>
              <div className="mt-3 px-4 py-2 rounded-full bg-emerald-500/20 inline-block">
                <span className="text-sm text-emerald-400 font-medium">🏆 Smart Traveler</span>
              </div>
            </motion.div>
          )}

          {/* Optimizations */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#0FDEBD]" />
              Smart Swap-förslag
            </h3>
            {optimizations.map((opt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="dark-card p-5 rounded-xl"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h4 className="font-semibold text-white">{opt.category}</h4>
                  <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                    -{formatNumber(opt.savings)} kr
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-400">
                    <span className="text-slate-500">Nuvarande:</span> {opt.current}
                  </p>
                  <p className="text-slate-300">
                    <span className="text-emerald-400 font-medium">Förslag:</span> {opt.suggestion}
                  </p>
                  {opt.rating_improvement && (
                    <p className="text-blue-400 text-xs">⭐ {opt.rating_improvement}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  Välj detta alternativ
                </Button>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}