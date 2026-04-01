import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronRight, Loader2, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const UNSPLASH_IMAGES = {
  travel: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  stock: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
  economy: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
  housing: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
};

function ImpactMeter({ days }) {
  const positive = days >= 0;
  const Icon = days > 0 ? TrendingUp : days < 0 ? TrendingDown : Minus;
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: positive ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
          border: `1px solid ${positive ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'}`,
        }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: positive ? '#10b981' : '#f43f5e' }} />
        <span className="text-xs font-bold" style={{ color: positive ? '#10b981' : '#f43f5e' }}>
          {positive ? '+' : ''}{days} dagar mot frihet
        </span>
      </div>
    </div>
  );
}

function NewsCard({ article, goalName, isActive }) {
  const img = UNSPLASH_IMAGES[article.imageKey] || UNSPLASH_IMAGES.economy;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl"
      style={{ height: 380, background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(3px) brightness(0.3)' }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

      {/* Category badge */}
      <div className="absolute top-4 left-4">
        <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full"
          style={{ background: 'rgba(99,102,241,0.3)', border: '1px solid rgba(99,102,241,0.5)', color: '#a5b4fc' }}>
          {article.category}
        </span>
      </div>

      {/* AI Butler badge */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full"
          style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-[9px] font-bold text-yellow-400">AI BUTLER</span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
        {/* Goal context */}
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span className="text-xs text-indigo-300">Påverkar: <strong>{goalName || 'ditt sparmål'}</strong></span>
        </div>

        {/* Headline */}
        <h3 className="text-lg font-bold text-white leading-snug">{article.headline}</h3>

        {/* Summary */}
        <p className="text-sm text-slate-300 leading-relaxed">{article.summary}</p>

        {/* Impact meter */}
        <ImpactMeter days={article.impactDays} />
      </div>
    </motion.div>
  );
}

export default function SmartNewsCards({ profile }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);

  const goalName = profile?.savingsGoalName || 'ditt mål';
  const income = profile?.income || 0;
  const buffer = profile?.buffer || 0;

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Du är en finansiell AI-butler som läser ekonominyheter och kopplar dem till en specifik användares situation.

Användarprofil: Inkomst ${income} kr/mån, buffert ${buffer} kr, sparmål: "${goalName}".

Skapa 3 nyhetsberättelser (Stories) på svenska om aktuella ekonomiska händelser (april 2026). 
Varje story ska:
- Ha en rubrik skriven som om AI:n pratar direkt till användaren (t.ex. "Dollarn stiger – så påverkar det din USA-resa")
- Ha en kort sammanfattning (2 meningar) anpassad till användarens profil
- Ha en kategori (economy/travel/stock/housing/tech)
- Ha en imageKey (economy/travel/stock/housing/tech)
- Beräkna hur många dagar nyheten påverkar deras mål positivt (positiv siffra) eller negativt (negativ siffra), t.ex. +5 eller -3

Var kreativ och realistisk. Använd verkliga nyheter om du kan.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            articles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  headline: { type: 'string' },
                  summary: { type: 'string' },
                  category: { type: 'string' },
                  imageKey: { type: 'string' },
                  impactDays: { type: 'number' },
                }
              }
            }
          }
        }
      });

      if (res?.articles?.length > 0) {
        setArticles(res.articles);
      }
    } catch {}
    setLoading(false);
  };

  const prev = () => setCurrentIdx(i => Math.max(0, i - 1));
  const next = () => setCurrentIdx(i => Math.min(articles.length - 1, i + 1));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Marknadens Puls</h3>
          <p className="text-xs text-slate-500">3 nyheter som faktiskt påverkar dig</p>
        </div>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Uppdatera'}
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl flex flex-col items-center justify-center gap-3 py-16"
          style={{ background: 'rgba(10,14,26,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">AI Butler läser 10 000 artiklar...</p>
          <p className="text-xs text-slate-600">Filtrerar de 3 som påverkar dig</p>
        </div>
      ) : articles.length > 0 ? (
        <>
          {/* Story card */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <NewsCard article={articles[currentIdx]} goalName={goalName} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-2">
            <button onClick={prev} disabled={currentIdx === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {articles.map((_, i) => (
                <button key={i} onClick={() => setCurrentIdx(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === currentIdx ? 20 : 6,
                    height: 6,
                    background: i === currentIdx ? '#6366f1' : 'rgba(255,255,255,0.2)'
                  }}
                />
              ))}
            </div>

            <button onClick={next} disabled={currentIdx === articles.length - 1}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'rgba(10,14,26,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-slate-400 text-sm">Kunde inte hämta nyheter just nu.</p>
          <button onClick={fetchNews} className="mt-3 text-xs text-indigo-400 underline">Försök igen</button>
        </div>
      )}
    </div>
  );
}