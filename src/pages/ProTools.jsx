import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plane, Landmark, ScanLine, Brain, GitBranch, Calculator, BarChart2, Rocket, User, Scissors, Users, Bot } from 'lucide-react';

import DecisionEngine from '@/components/protools/DecisionEngine';
import StrategyCenter from '@/components/protools/mastery/StrategyCenter';
import AIGuru from '@/components/protools/mastery/AIGuru';
import FutureSimulator from '@/components/protools/mastery/FutureSimulator';
import EconomicSelf from '@/components/protools/mastery/EconomicSelf';
import MarginMaxer from '@/components/protools/mastery/MarginMaxer';
import LifePuzzle from '@/components/protools/mastery/LifePuzzle';

const DISCOVERY = [
  { id: 'travel',  label: 'Resor',      icon: Plane,    color: '#4B7CF3', page: 'TravelPlanner',    emoji: '🛸' },
  { id: 'resell',  label: 'Sälj & Tjäna', icon: ScanLine, color: '#FFD700', page: 'ResellScanner',  emoji: '☄️' },
  { id: 'loans',   label: 'Lån',         icon: Landmark, color: '#3DAA7A', page: 'Loans',             emoji: '🛰️' },
  { id: 'planner', label: 'Planeraren',  icon: GitBranch, color: '#C8923A', page: 'WhatIf',          emoji: '🌌' },
];

const TOOLS = [
  { id: 'simulator', label: 'Simulator',  icon: Brain,    color: '#60a5fa', page: 'PurchaseSimulator', desc: 'Analysera köp' },
  { id: 'tax',       label: 'Skatt',      icon: Calculator, color: '#34d399', page: 'WhatIf',          desc: 'Skatteoptimering' },
  { id: 'history',   label: 'Historik',   icon: BarChart2, color: '#a78bfa', page: 'FinancialHistory', desc: 'Ekonomisk resa' },
  { id: 'pulse',     label: 'Pulse',      icon: Rocket,   color: '#fb7185', page: 'Pulse',              desc: 'Ekonomisk puls' },
];

const MODULES = [
  { id: 'strategy', title: 'Strategi-Center',       hook: 'Se din ekonomi uppifrån.',          accent: '#a78bfa', emoji: '🔭', component: StrategyCenter },
  { id: 'ai_guru',  title: 'AI-Gurun',              hook: 'Bättre beslut på sekunder.',        accent: '#60a5fa', emoji: '🧠', component: AIGuru },
  { id: 'future',   title: 'Framtids-Simulatorn',   hook: 'Se resultatet av dina beslut.',     accent: '#34d399', emoji: '⚡', component: FutureSimulator },
  { id: 'self',     title: 'Ditt Ekonomiska Jag',   hook: 'Förstå ditt ekonomibeteende.',      accent: '#fbbf24', emoji: '🪞', component: EconomicSelf },
  { id: 'margin',   title: 'Marginal-Maxaren',      hook: 'Återta din frihet.',                accent: '#fb7185', emoji: '🛡️', component: MarginMaxer },
  { id: 'puzzle',   title: 'Livspusslet',           hook: 'Bygg ekonomisk trygghet tillsammans.', accent: '#22d3ee', emoji: '🌍', component: LifePuzzle },
];

// Warp speed overlay
function WarpOverlay({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="warp"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: '#020408' }}
        >
          {[...Array(30)].map((_, i) => {
            const angle = (i / 30) * 360;
            return (
              <motion.div key={i}
                className="absolute"
                style={{
                  width: 1.5, height: '45%',
                  top: '50%', left: '50%',
                  transformOrigin: 'top center',
                  transform: `rotate(${angle}deg)`,
                  background: `linear-gradient(to bottom, transparent, rgba(15,222,189,0.8), transparent)`,
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: [0, 1.5], opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, ease: 'easeIn' }}
              />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ProTools() {
  const [activeModule, setActiveModule] = useState(null);
  const [warping, setWarping] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  const active = MODULES.find(m => m.id === activeModule);
  const ActiveComponent = active?.component;

  const handleModuleClick = (id) => {
    setWarping(true);
    setTimeout(() => { setWarping(false); setActiveModule(id); }, 500);
  };

  return (
    <div className="min-h-screen pb-28 relative" style={{ background: 'linear-gradient(160deg, #050a15 0%, #090e1e 55%, #07101c 100%)' }}>
      <WarpOverlay visible={warping} />

      {/* Starfield background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)' }} />
        <div className="absolute bottom-20 right-[-60px] w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(15,222,189,0.05) 0%, transparent 65%)' }} />
        {[...Array(32)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{
              width: i % 6 === 0 ? 2 : 1,
              height: i % 6 === 0 ? 2 : 1,
              top: `${(i * 41 + 3) % 100}%`,
              left: `${(i * 67 + 9) % 100}%`,
              background: '#fff',
              opacity: 0.12 + (i % 4) * 0.06,
            }}
            animate={{ opacity: [0.08, 0.35, 0.08] }}
            transition={{ duration: 2.5 + (i % 3), repeat: Infinity, delay: (i * 0.25) % 5 }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 px-5 pt-10 pb-4 flex items-center gap-3">
        {activeModule ? (
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveModule(null)}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
          </motion.button>
        ) : (
          <Link to={createPageUrl('Dashboard')}>
            <motion.button whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ArrowLeft className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
            </motion.button>
          </Link>
        )}
        <div>
          <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.22)' }}>
            {activeModule ? 'DJUPANALYS' : 'ANCHOR'}
          </p>
          <h1 className="text-xl font-black" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
            {activeModule ? active?.title : 'Superkrafter'}
          </h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!activeModule ? (
          <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative z-10 px-4 space-y-6">

            {/* DISCOVERY — satellites */}
            <div>
              <p className="text-[9px] font-black tracking-widest mb-3 px-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
                SNABBVAL — SATELLITER
              </p>
              <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {DISCOVERY.map((item, i) => (
                  <Link key={item.id} to={createPageUrl(item.page)} className="flex-shrink-0">
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileTap={{ scale: 0.88 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                        className="w-16 h-16 rounded-full flex items-center justify-center relative"
                        style={{
                          background: `radial-gradient(circle, ${item.color}22 0%, ${item.color}08 100%)`,
                          border: `1.5px solid ${item.color}35`,
                          boxShadow: `0 0 20px ${item.color}20`,
                        }}
                      >
                        {/* Orbit ring */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
                          <motion.circle cx="32" cy="32" r="30" fill="none"
                            stroke={`${item.color}25`} strokeWidth="1"
                            strokeDasharray="4 6"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                            style={{ transformOrigin: '32px 32px' }}
                          />
                        </svg>
                        <span style={{ fontSize: 22 }}>{item.emoji}</span>
                      </motion.div>
                      <p className="text-[10px] font-bold text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {item.label}
                      </p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* TOOLS — radar stations 2×2 */}
            <div>
              <p className="text-[9px] font-black tracking-widest mb-3 px-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
                RADAR — VERKTYG
              </p>
              <div className="grid grid-cols-2 gap-3">
                {TOOLS.map((tool, i) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.id} to={createPageUrl(tool.page)}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + i * 0.07 }}
                        whileTap={{ scale: 0.93 }}
                        className="relative rounded-3xl p-4 flex flex-col gap-3 overflow-hidden"
                        style={{
                          background: 'rgba(8,10,20,0.85)',
                          border: `1px solid ${tool.color}25`,
                          boxShadow: `0 0 20px ${tool.color}10`,
                        }}
                      >
                        {/* Radar sweep */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4 + i, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-full h-full"
                            style={{ transformOrigin: '50% 50%' }}
                          >
                            <div style={{
                              position: 'absolute', top: '50%', left: '50%',
                              width: '100%', height: 1,
                              background: `linear-gradient(90deg, transparent, ${tool.color}40)`,
                              transformOrigin: 'left center',
                            }} />
                          </motion.div>
                        </div>

                        <div className="w-9 h-9 rounded-full flex items-center justify-center"
                          style={{ background: `${tool.color}15`, border: `1px solid ${tool.color}30` }}>
                          <Icon className="w-4 h-4" style={{ color: tool.color }} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-black" style={{ color: '#fff' }}>{tool.label}</p>
                          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{tool.desc}</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: tool.color, boxShadow: `0 0 6px ${tool.color}` }} />
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* DEEP MODULES — glassmorphic crystals */}
            <div>
              <p className="text-[9px] font-black tracking-widest mb-3 px-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
                DJUPANALYS — ARTEFAKTER
              </p>
              <div className="space-y-3">
                {MODULES.map((mod, i) => (
                  <motion.button
                    key={mod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleModuleClick(mod.id)}
                    className="w-full relative overflow-hidden rounded-3xl text-left"
                    style={{
                      background: 'rgba(12,14,28,0.6)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: `1px solid ${mod.accent}22`,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px ${mod.accent}12`,
                    }}
                  >
                    {/* Prismatic sweep */}
                    <motion.div
                      animate={{ x: ['-120%', '120%'] }}
                      transition={{ duration: 5 + i * 0.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `linear-gradient(105deg, transparent 30%, ${mod.accent}18 50%, transparent 70%)`,
                      }}
                    />

                    <div className="flex items-center gap-4 p-4">
                      {/* Artifact icon */}
                      <motion.div
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${mod.accent}15`,
                          border: `1px solid ${mod.accent}30`,
                          boxShadow: `0 0 16px ${mod.accent}25`,
                          fontSize: 22,
                        }}
                      >
                        {mod.emoji}
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black" style={{ color: '#fff', letterSpacing: '-0.01em' }}>{mod.title}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: `${mod.accent}aa` }}>{mod.hook}</p>
                      </div>

                      {/* Chevron glow */}
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ color: mod.accent }}
                      >
                        <ArrowLeft className="w-4 h-4 rotate-180" style={{ color: `${mod.accent}90` }} />
                      </motion.div>
                    </div>

                    {/* Bottom glow strip */}
                    <div className="h-px mx-4 mb-0" style={{ background: `linear-gradient(90deg, transparent, ${mod.accent}40, transparent)` }} />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-10 px-5"
          >
            {ActiveComponent && <ActiveComponent profile={profile} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}