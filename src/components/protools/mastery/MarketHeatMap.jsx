import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Wifi, RefreshCw } from 'lucide-react';

const INITIAL_ASSETS = [
  { id: 'nvidia', name: 'NVIDIA', ticker: 'NVDA', size: 90, sentiment: 'bull', volume: 98 },
  { id: 'tesla', name: 'Tesla', ticker: 'TSLA', size: 76, sentiment: 'bear', volume: 82 },
  { id: 'apple', name: 'Apple', ticker: 'AAPL', size: 80, sentiment: 'bull', volume: 88 },
  { id: 'global', name: 'Global Index', ticker: 'MSCI', size: 68, sentiment: 'top', volume: 75 },
  { id: 'amazon', name: 'Amazon', ticker: 'AMZN', size: 72, sentiment: 'bull', volume: 79 },
  { id: 'bitcoin', name: 'Bitcoin', ticker: 'BTC', size: 84, sentiment: 'top', volume: 91 },
  { id: 'spotify', name: 'Spotify', ticker: 'SPOT', size: 54, sentiment: 'bear', volume: 58 },
  { id: 'volvo', name: 'Volvo', ticker: 'VOLV', size: 50, sentiment: 'neutral', volume: 52 },
  { id: 'ericsson', name: 'Ericsson', ticker: 'ERIC', size: 46, sentiment: 'neutral', volume: 45 },
  { id: 'kinnevik', name: 'Kinnevik', ticker: 'KINV', size: 42, sentiment: 'bear', volume: 38 },
];

const SENTIMENT_CONFIG = {
  bull: { color: '#10b981', glow: 'rgba(16,185,129,0.5)', label: 'KÖP', bg: 'rgba(16,185,129,0.15)' },
  bear: { color: '#f43f5e', glow: 'rgba(244,63,94,0.45)', label: 'SÄLJ', bg: 'rgba(244,63,94,0.12)' },
  top: { color: '#fbbf24', glow: 'rgba(251,191,36,0.6)', label: 'AI TOP', bg: 'rgba(251,191,36,0.15)' },
  neutral: { color: '#94a3b8', glow: 'rgba(148,163,184,0.3)', label: 'NEUTRAL', bg: 'rgba(148,163,184,0.08)' },
};

function Bubble({ asset, onClick, isSelected }) {
  const cfg = SENTIMENT_CONFIG[asset.sentiment];
  const size = asset.size;
  const isBig = size >= 70;

  return (
    <motion.button
      onClick={() => onClick(asset)}
      className="relative flex items-center justify-center rounded-full cursor-pointer"
      style={{
        width: size,
        height: size,
        background: cfg.bg,
        border: `2px solid ${cfg.color}60`,
        boxShadow: isSelected
          ? `0 0 ${size * 0.5}px ${cfg.glow}, 0 0 ${size * 0.25}px ${cfg.color}`
          : `0 0 ${size * 0.25}px ${cfg.glow}`,
      }}
      animate={{
        scale: [1, 1.03, 1],
        boxShadow: [
          `0 0 ${size * 0.2}px ${cfg.glow}`,
          `0 0 ${size * 0.4}px ${cfg.glow}`,
          `0 0 ${size * 0.2}px ${cfg.glow}`,
        ],
      }}
      transition={{
        duration: 2 + Math.random() * 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: Math.random() * 2,
      }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-center px-1">
        <p className="font-bold leading-tight" style={{ fontSize: isBig ? 11 : 9, color: '#f1f5f9' }}>{asset.ticker}</p>
        {isBig && (
          <p className="font-bold" style={{ fontSize: 8, color: cfg.color }}>{cfg.label}</p>
        )}
      </div>
    </motion.button>
  );
}

export default function MarketHeatMap() {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Du är en marknadsanalysmotor. Returnera aktuellt marknadsentiment för dessa tickers: NVDA, TSLA, AAPL, MSCI, AMZN, BTC, SPOT, VOLV, ERIC, KINV.
        För varje: ge sentiment (bull/bear/top/neutral), kort anledning (max 8 ord), och change% (t.ex. +2.3 eller -1.1).
        Basera på senaste trender och nyheter april 2026.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            assets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ticker: { type: 'string' },
                  sentiment: { type: 'string' },
                  reason: { type: 'string' },
                  change: { type: 'number' },
                }
              }
            }
          }
        }
      });

      if (res?.assets) {
        setAssets(prev => prev.map(a => {
          const live = res.assets.find(x => x.ticker === a.ticker);
          if (!live) return a;
          return { ...a, sentiment: live.sentiment, _reason: live.reason, _change: live.change };
        }));
        setLastUpdate(new Date());
      }
    } catch {}
    setLoading(false);
  };

  // Simulate occasional "news flash" shaking
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => prev.map(a =>
        Math.random() < 0.15 ? { ...a, _flash: Date.now() } : a
      ));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const selCfg = selected ? SENTIMENT_CONFIG[selected.sentiment] : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-emerald-400"
          />
          <span className="text-xs text-slate-400">Live sentiment · {lastUpdate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          AI-scan
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(SENTIMENT_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.glow}` }} />
            <span className="text-[10px] text-slate-500">{cfg.label}</span>
          </div>
        ))}
        <span className="text-[10px] text-slate-600 ml-auto">Storlek = volym</span>
      </div>

      {/* Bubble map */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(10,14,26,0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
          minHeight: 320,
        }}
      >
        <div className="flex flex-wrap items-center justify-center gap-3 p-5">
          {assets.map(asset => (
            <motion.div
              key={asset.id}
              animate={asset._flash ? { x: [-3, 3, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <Bubble
                asset={asset}
                onClick={setSelected}
                isSelected={selected?.id === asset.id}
              />
            </motion.div>
          ))}
        </div>

        {/* Grid overlay lines (decorative) */}
        <div className="absolute inset-0 pointer-events-none opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.3) 0px, transparent 1px, transparent 40px, rgba(255,255,255,0.3) 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0px, transparent 1px, transparent 40px, rgba(255,255,255,0.3) 40px)' }}
        />
      </div>

      {/* Selected asset detail */}
      <AnimatePresence>
        {selected && selCfg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-2xl p-4"
            style={{ background: selCfg.bg, border: `1px solid ${selCfg.color}40` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-bold text-white">{selected.name}</h4>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: selCfg.color, background: `${selCfg.color}20` }}>{selCfg.label}</span>
              </div>
              {selected._change !== undefined && (
                <p className="text-2xl font-bold" style={{ color: selected._change >= 0 ? '#10b981' : '#f43f5e' }}>
                  {selected._change >= 0 ? '+' : ''}{selected._change}%
                </p>
              )}
            </div>
            {selected._reason && (
              <p className="text-sm text-slate-300">{selected._reason}</p>
            )}
            <p className="text-xs text-slate-500 mt-2">Volym-index: {selected.volume}/100</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}