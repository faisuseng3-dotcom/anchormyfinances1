import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

const marketPrices2026 = {
  'Bredband': { avg: 299, low: 199, provider: 'Bahnhof' },
  'Spotify': { avg: 119, low: 119, provider: 'Family Plan (delas)' },
  'Netflix': { avg: 179, low: 99, provider: 'Basic med annonser' },
  'Gym': { avg: 399, low: 199, provider: 'Online-gym' },
  'Mobilabonnemang': { avg: 249, low: 99, provider: 'Halebop' }
};

export default function SubscriptionNegotiator({ profile }) {
  const [opportunities, setOpportunities] = useState([]);

  React.useEffect(() => {
    if (!profile?.subscriptions) return;

    const opps = profile.subscriptions
      .map(sub => {
        // Find matching market data
        const marketKey = Object.keys(marketPrices2026).find(key => 
          sub.name.toLowerCase().includes(key.toLowerCase())
        );

        if (marketKey && sub.amount > marketPrices2026[marketKey].low) {
          return {
            current: sub,
            market: marketPrices2026[marketKey],
            savings: sub.amount - marketPrices2026[marketKey].low,
            savingsPercent: Math.round(((sub.amount - marketPrices2026[marketKey].low) / sub.amount) * 100)
          };
        }
        return null;
      })
      .filter(Boolean);

    setOpportunities(opps);
  }, [profile]);

  if (opportunities.length === 0) {
    return (
      <div className="dark-card p-6 rounded-2xl">
        <p className="text-slate-400 text-sm">
          Inga förhandlingsmöjligheter hittade just nu.
        </p>
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
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-purple-400" />
          <h3 className="font-semibold text-white">Subscription Negotiator</h3>
        </div>

        <p className="text-sm text-slate-400 mb-6">
          Jämför dina abonnemang mot marknaden och hitta billigare alternativ.
        </p>

        <div className="space-y-3">
          {opportunities.map((opp, i) => (
            <div key={i} className="p-4 rounded-xl dark-card border border-purple-500/20">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-white">{opp.current.name}</p>
                  <p className="text-xs text-slate-400">
                    Du betalar: {opp.current.amount} kr/mån
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                  Spara {opp.savingsPercent}%
                </span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 mb-3">
                <p className="text-sm text-white font-medium mb-1">
                  Bästa alternativ: {opp.market.provider}
                </p>
                <p className="text-xs text-slate-400">
                  {opp.market.low} kr/mån (marknadslägsta 2026)
                </p>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">Potentiell besparing:</span>
                <span className="text-lg font-bold text-emerald-400">
                  {opp.savings} kr/mån
                </span>
              </div>

              <button className="w-full px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium">
                <MessageSquare className="w-4 h-4 mr-1.5 inline" aria-hidden /> Pruta åt mig
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-white/5">
          <p className="text-sm text-slate-400 mb-1">Total årsbesparing:</p>
          <p className="text-2xl font-bold text-emerald-400">
            {opportunities.reduce((sum, o) => sum + (o.savings * 12), 0).toLocaleString()} kr
          </p>
        </div>
      </div>
    </motion.div>
  );
}