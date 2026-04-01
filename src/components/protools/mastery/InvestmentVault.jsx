import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, TrendingUp, Zap, ArrowRight, Lock, CheckCircle } from 'lucide-react';

const STRATEGIES = [
  { id: 'safe', label: 'Trygg', desc: '80% räntefonder · 20% globalfond', color: '#22d3ee', return: '+4–6%/år' },
  { id: 'balanced', label: 'Balanserad', desc: '50% aktier · 30% fonder · 20% krypto', color: '#a78bfa', return: '+8–12%/år' },
  { id: 'growth', label: 'Tillväxt', desc: '70% aktier · 20% tillväxtmarknader · 10% tech', color: '#fbbf24', return: '+12–18%/år' },
];

export default function InvestmentVault({ profile }) {
  const [selectedStrategy, setSelectedStrategy] = useState('balanced');
  const [executing, setExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);

  const income = profile?.income || 0;
  const suggAmount = Math.round(income * 0.15);

  const handleExecute = async () => {
    if (executing || executed) return;
    setExecuting(true);
    await new Promise(r => setTimeout(r, 2200));
    setExecuting(false);
    setExecuted(true);
  };

  const strategy = STRATEGIES.find(s => s.id === selectedStrategy);

  return (
    <div className="space-y-5">
      {/* Vault Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1729 50%, #1a1200 100%)',
          border: '1px solid rgba(251,191,36,0.25)',
          boxShadow: '0 0 40px rgba(251,191,36,0.08)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-blue-900/20 pointer-events-none" />

        {/* The Bridge */}
        <div className="relative flex items-center justify-between mb-6">
          {/* Bank account node */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)' }}>
              <Shield className="w-7 h-7 text-blue-400" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Bankkonto</span>
            <span className="text-xs text-white font-bold">{income.toLocaleString('sv-SE')} kr/mån</span>
          </div>

          {/* Bridge line */}
          <div className="flex-1 mx-3 relative">
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.6), rgba(251,191,36,0.8))' }} />
            <motion.div
              animate={{ x: ['0%', '100%', '0%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
              style={{ background: '#fbbf24', boxShadow: '0 0 8px #fbbf24', left: 0 }}
            />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <ArrowRight className="w-3 h-3 text-yellow-400" />
            </div>
          </div>

          {/* Anchor Safe node */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.5)', boxShadow: '0 0 20px rgba(251,191,36,0.2)' }}>
              <Lock className="w-7 h-7 text-yellow-400" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Anchor Safe</span>
            <span className="text-xs text-yellow-400 font-bold">ISK</span>
          </div>
        </div>

        {/* Suggested amount */}
        <div className="text-center mb-5">
          <p className="text-xs text-slate-500 mb-1">AI rekommenderar att flytta</p>
          <p className="text-3xl font-bold"
            style={{ background: 'linear-gradient(90deg, #60a5fa, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {suggAmount.toLocaleString('sv-SE')} kr/mån
          </p>
          <p className="text-xs text-slate-500 mt-1">= 15% av din inkomst · optimalt för tillväxt</p>
        </div>

        {/* Strategy selector */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {STRATEGIES.map(s => (
            <button
              key={s.id}
              onClick={() => { setSelectedStrategy(s.id); setExecuted(false); }}
              className="rounded-xl p-3 text-left transition-all"
              style={{
                background: selectedStrategy === s.id ? `${s.color}18` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selectedStrategy === s.id ? s.color + '60' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: selectedStrategy === s.id ? `0 0 16px ${s.color}30` : 'none'
              }}
            >
              <p className="text-xs font-bold mb-0.5" style={{ color: selectedStrategy === s.id ? s.color : '#94a3b8' }}>{s.label}</p>
              <p className="text-[9px] text-slate-500 leading-tight">{s.desc}</p>
              <p className="text-[10px] font-semibold mt-1" style={{ color: s.color }}>{s.return}</p>
            </button>
          ))}
        </div>

        {/* Execute button */}
        <AnimatePresence mode="wait">
          {executed ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-3"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)' }}
            >
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">Strategi aktiverad!</span>
            </motion.div>
          ) : (
            <motion.button
              key="execute"
              whileTap={{ scale: 0.97 }}
              onClick={handleExecute}
              disabled={executing}
              className="w-full py-4 rounded-2xl font-bold text-sm relative overflow-hidden transition-all"
              style={{
                background: executing
                  ? 'rgba(251,191,36,0.15)'
                  : 'linear-gradient(135deg, rgba(251,191,36,0.9) 0%, rgba(245,158,11,1) 100%)',
                color: executing ? '#fbbf24' : '#0a0e1a',
                border: '1px solid rgba(251,191,36,0.6)',
                boxShadow: executing ? 'none' : '0 0 30px rgba(251,191,36,0.4)',
              }}
            >
              {executing ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"
                  />
                  Konverterar till tillgångar...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Exekvera AI-strategi
                </span>
              )}

              {!executing && !executed && (
                <motion.div
                  className="absolute inset-0 bg-white/10 rounded-2xl"
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Executing animation overlay */}
        <AnimatePresence>
          {executing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-2xl flex items-center justify-center pointer-events-none"
              style={{ background: 'rgba(10,14,26,0.7)' }}
            >
              <div className="text-center">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{ background: strategy?.color || '#fbbf24', left: `${20 + i * 15}%`, top: '50%' }}
                    animate={{ y: [0, -40, -80, -120], opacity: [1, 1, 0.5, 0], scale: [1, 1.5, 1, 0.5] }}
                    transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
                <TrendingUp className="w-12 h-12 mx-auto text-yellow-400" style={{ filter: 'drop-shadow(0 0 12px #fbbf24)' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Disclaimer */}
      <p className="text-center text-[10px] text-slate-600 px-4">
        Simulerad vy · BaaS-integration förbereds · Ingen riktig transaktion utförs
      </p>
    </div>
  );
}