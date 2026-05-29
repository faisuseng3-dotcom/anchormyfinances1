import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, TrendingUp, Tv, Car, Heart, Apple, Shield, Music, MoreHorizontal, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

const categoryIcons = {
  entertainment: Music,
  transport: Car,
  health: Heart,
  streaming: Tv,
  food: Apple,
  insurance: Shield,
  other: MoreHorizontal
};

const categoryColors = {
  entertainment: 'bg-purple-100 text-purple-600',
  transport: 'bg-blue-100 text-blue-600',
  health: 'bg-rose-100 text-rose-600',
  streaming: 'bg-indigo-100 text-indigo-600',
  food: 'bg-amber-100 text-amber-600',
  insurance: 'bg-emerald-100 text-emerald-600',
  other: 'bg-slate-100 text-slate-600'
};

export default function Optimize() {
  const [optimizingId, setOptimizingId] = useState(null);
  const [suggestions, setSuggestions] = useState({});

  const { profile } = useFinancialProfile();

  const formatNumber = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
  };

  const findAlternatives = async (subscription, index) => {
    setOptimizingId(index);
    
    // Generate suggestions using AI
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Du är en svensk privatekonomi-expert. Användaren betalar ${subscription.amount} kr/mån för "${subscription.name}" (kategori: ${subscription.category}).

Ge 2-3 konkreta, verkliga alternativ som kan vara billigare eller bättre värde. 
Fokusera på svenska tjänster och erbjudanden.

Svara i JSON-format med:
{
  "alternatives": [
    {
      "name": "Tjänstens namn",
      "price": "pris per månad i kr",
      "savings": "hur mycket man sparar per månad",
      "description": "kort beskrivning av erbjudandet",
      "url": "webbadress till tjänsten"
    }
  ],
  "tips": "ett kort tips för denna kategori"
}`,
      response_json_schema: {
        type: "object",
        properties: {
          alternatives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                price: { type: "string" },
                savings: { type: "string" },
                description: { type: "string" },
                url: { type: "string" }
              }
            }
          },
          tips: { type: "string" }
        }
      }
    });

    setSuggestions(prev => ({
      ...prev,
      [index]: response
    }));
    setOptimizingId(null);
  };

  const subscriptions = profile?.subscriptions || [];
  const totalCost = subscriptions.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Kostnadsoptimering</h1>
            <p className="text-sm text-slate-400">Hitta billigare alternativ</p>
          </div>
        </div>

        {/* Total */}
        <div className="p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-6">
          <p className="text-emerald-100 text-sm">Totala abonnemang</p>
          <p className="text-3xl font-bold text-white mt-1">{formatNumber(totalCost)} kr/mån</p>
          <p className="text-emerald-100 text-sm mt-2">
            {subscriptions.length} aktiva abonnemang
          </p>
        </div>

        {/* Subscriptions list */}
        <div className="space-y-3">
          {subscriptions.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-slate-100 text-center">
              <p className="text-slate-500">Inga abonnemang registrerade.</p>
              <Link to={createPageUrl('Settings')}>
                <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600">
                  Lägg till abonnemang
                </Button>
              </Link>
            </div>
          ) : (
            subscriptions.map((sub, i) => {
              const Icon = categoryIcons[sub.category] || MoreHorizontal;
              const colorClass = categoryColors[sub.category] || categoryColors.other;
              const suggestion = suggestions[i];

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-slate-100 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{sub.name}</p>
                          <p className="text-sm text-slate-500">{formatNumber(sub.amount)} kr/mån</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => findAlternatives(sub, i)}
                        disabled={optimizingId === i}
                        className="bg-emerald-500 hover:bg-emerald-600 rounded-lg"
                      >
                        {optimizingId === i ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-1" />
                            Optimera
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <AnimatePresence>
                    {suggestion && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 bg-slate-50"
                      >
                        <div className="p-4 space-y-3">
                          {suggestion.alternatives?.map((alt, j) => (
                            <div
                              key={j}
                              className="p-3 bg-white rounded-lg border border-slate-100"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900">{alt.name}</p>
                                  <p className="text-sm text-slate-500 mt-1">{alt.description}</p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-sm font-medium text-emerald-600">
                                      {alt.price}
                                    </span>
                                    {alt.savings && (
                                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                        Spara {alt.savings}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {alt.url && (
                                  <a
                                    href={alt.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4 text-slate-400" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {suggestion.tips && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <span className="font-medium">Tips: </span>
                                {suggestion.tips}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}