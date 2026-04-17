import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingDown, Target, Coffee, Loader2, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function InsightCards({ profile, transactions }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateInsights = async () => {
    if (!profile || loading) return;
    setLoading(true);

    const txSummary = (transactions || []).slice(0, 30).map(t =>
      `${t.label || t.description || 'Okänd'}: ${t.amount} kr (${t.category || 'other'})`
    ).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Du är en ekonomicoach för en svensk användare med följande profil:
- Månadsinkomst: ${profile.income || 0} kr
- Sparmål: ${profile.savingsGoalName || 'Okänt'} (${profile.savingsGoal || 0} kr)
- Nuvarande sparande mot målet: ${profile.savingsCurrentBalance || 0} kr
- Senaste transaktioner:\n${txSummary || 'Inga transaktioner'}

Generera 3 konkreta, proaktiva tips på svenska. Varje tips ska ha: title (kort rubrik), description (konkret råd med siffror), icon (ett av: coffee, trending, target), impact (t.ex. "Sparar 340 kr/mån").`,
      response_json_schema: {
        type: 'object',
        properties: {
          insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                icon: { type: 'string' },
                impact: { type: 'string' },
              }
            }
          }
        }
      }
    });
    setInsights(result?.insights || []);
    setGenerated(true);
    setLoading(false);
  };

  const ICONS = { coffee: Coffee, trending: TrendingDown, target: Target };

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div className="px-5 pt-4 pb-3 flex items-center gap-3" style={{ borderBottom: '1px solid #F0F2F5' }}>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(13,115,119,0.1)' }}>
          <Sparkles className="w-4 h-4" style={{ color: '#0D7377' }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: '#1A2332' }}>AI Coach</p>
          <p className="text-xs" style={{ color: '#9AA5B4' }}>Proaktiva ekonomitips</p>
        </div>
        {!generated && !loading && (
          <button onClick={generateInsights}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1"
            style={{ background: '#0D7377' }}>
            Analysera <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="px-5 py-4">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#0D7377' }} />
            <p className="text-sm" style={{ color: '#9AA5B4' }}>AI analyserar din ekonomi...</p>
          </div>
        )}
        {!loading && !generated && (
          <p className="text-xs text-center py-4" style={{ color: '#9AA5B4' }}>
            Tryck "Analysera" för att få personliga tips baserade på din data.
          </p>
        )}
        <div className="space-y-3">
          <AnimatePresence>
            {insights.map((ins, i) => {
              const Icon = ICONS[ins.icon] || Target;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="p-4 rounded-2xl" style={{ background: '#F4F6F8' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(13,115,119,0.1)' }}>
                      <Icon className="w-4 h-4" style={{ color: '#0D7377' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold mb-0.5" style={{ color: '#1A2332' }}>{ins.title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: '#4A5568' }}>{ins.description}</p>
                      {ins.impact && (
                        <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: 'rgba(13,115,119,0.1)', color: '#0D7377' }}>
                          {ins.impact}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {generated && !loading && (
          <button onClick={generateInsights}
            className="w-full mt-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: '#F4F6F8', color: '#9AA5B4' }}>
            Uppdatera analys
          </button>
        )}
      </div>
    </div>
  );
}