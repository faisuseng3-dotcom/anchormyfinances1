import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plane, Landmark, ScanLine, Brain, GitBranch, Calculator, BarChart2, Rocket, User, Scissors, Users, Bot } from 'lucide-react';

import DecisionEngine from '@/components/protools/DecisionEngine';
import AIGuru from '@/components/protools/mastery/AIGuru';
import FutureSimulator from '@/components/protools/mastery/FutureSimulator';
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
  { id: 'ai_guru',  title: 'AI-Gurun',              hook: 'Bättre beslut på sekunder.',        accent: '#60a5fa', emoji: '🧠', component: AIGuru },
  { id: 'future',   title: 'Framtids-Simulatorn',   hook: 'Se resultatet av dina beslut.',     accent: '#34d399', emoji: '⚡', component: FutureSimulator },
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
          <p className="text-[15px] text-white/45">
            {activeModule ? 'Djupanalys' : 'Verktyg'}
          </p>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">
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
              <p className="text-[17px] font-semibold text-white mb-3 px-1">Utforska</p>
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
              <p className="text-[17px] font-semibold text-white mb-3 px-1">Verktyg</p>
              <div className="grid grid-cols-2 gap-2">
                {TOOLS.map((tool, i) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.id} to={createPageUrl(tool.page)}>
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + i * 0.05 }}
                        whileTap={{ scale: 0.97 }}
                        className="p-4 rounded-xl active:opacity-80"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <Icon className="w-5 h-5 mb-2" style={{ color: tool.color }} strokeWidth={1.5} />
                        <p className="text-[15px] font-medium text-white">{tool.label}</p>
                        <p className="text-[12px] text-white/40 mt-0.5">{tool.desc}</p>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* DEEP MODULES — glassmorphic crystals */}
            <div>
              <p className="text-[17px] font-semibold text-white mb-3 px-1">Djupanalys</p>
              <div className="divide-y divide-white/[0.08]">
                {MODULES.map((mod, i) => (
                  <motion.button
                    key={mod.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleModuleClick(mod.id)}
                    className="w-full flex items-center gap-4 py-4 text-left active:opacity-70"
                  >
                    <span className="text-2xl">{mod.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-white">{mod.title}</p>
                      <p className="text-[13px] text-white/45 mt-0.5">{mod.hook}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 rotate-180 text-white/30" />
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