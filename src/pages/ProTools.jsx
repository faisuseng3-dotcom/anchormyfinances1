import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bot, Brain, Rocket, User, Scissors, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Feature components (existing)
import DecisionEngine from '@/components/protools/DecisionEngine';
import SpendingProfile from '@/components/protools/SpendingProfile';
import SubscriptionHunter from '@/components/protools/SubscriptionHunter';
import FamilyFinances from '@/components/protools/FamilyFinances';
import AgentHub from '@/components/protools/AgentHub';
import ModeGate from '@/components/ModeGate';

// New mastery modules
import StrategyCenter from '@/components/protools/mastery/StrategyCenter';
import AIGuru from '@/components/protools/mastery/AIGuru';
import FutureSimulator from '@/components/protools/mastery/FutureSimulator';
import EconomicSelf from '@/components/protools/mastery/EconomicSelf';
import MarginMaxer from '@/components/protools/mastery/MarginMaxer';
import LifePuzzle from '@/components/protools/mastery/LifePuzzle';

const MODULES = [
  {
    id: 'strategy',
    title: 'Strategi-Center',
    hook: 'Se din ekonomi uppifrån — som en VD för ditt eget liv.',
    icon: Bot,
    gradient: 'from-violet-500 to-purple-700',
    glow: 'rgba(139,92,246,0.35)',
    accent: '#a78bfa',
    tag: 'EXECUTIVE',
    component: StrategyCenter,
  },
  {
    id: 'ai_guru',
    title: 'AI-Gurun',
    hook: 'Dra i slidern. Få svaret. Fatta bättre beslut på sekunder.',
    icon: Brain,
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'rgba(59,130,246,0.35)',
    accent: '#60a5fa',
    tag: 'BESLUT',
    component: AIGuru,
  },
  {
    id: 'future',
    title: 'Framtids-Simulatorn',
    hook: 'Res genom tiden. Se resultatet av dina beslut idag.',
    icon: Rocket,
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.35)',
    accent: '#34d399',
    tag: 'FRAMTID',
    component: FutureSimulator,
  },
  {
    id: 'self',
    title: 'Ditt Ekonomiska Jag',
    hook: 'Är du en Oros-sparare eller Impuls-shoppare? Ta reda på det.',
    icon: User,
    gradient: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.35)',
    accent: '#fbbf24',
    tag: 'PSYKOLOGI',
    component: EconomicSelf,
  },
  {
    id: 'margin',
    title: 'Marginal-Maxaren',
    hook: 'Återta din frihet — en onödig kostnad i taget.',
    icon: Scissors,
    gradient: 'from-rose-500 to-pink-600',
    glow: 'rgba(244,63,94,0.35)',
    accent: '#fb7185',
    tag: 'OPTIMERING',
    component: MarginMaxer,
  },
  {
    id: 'puzzle',
    title: 'Livspusslet',
    hook: 'Dela mål, inte hemligheter. Bygg ekonomisk trygghet tillsammans.',
    icon: Users,
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6,182,212,0.35)',
    accent: '#22d3ee',
    tag: 'RELATION',
    component: LifePuzzle,
  },
];

export default function ProTools() {
  const [activeModule, setActiveModule] = useState(null);

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  const active = MODULES.find(m => m.id === activeModule);
  const ActiveComponent = active?.component;

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        {activeModule ? (
          <button
            onClick={() => setActiveModule(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Tillbaka</span>
          </button>
        ) : (
          <Link to={createPageUrl('Dashboard')}>
            <button className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </button>
          </Link>
        )}

        <AnimatePresence mode="wait">
          {!activeModule ? (
            <motion.div key="header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">Financial Mastery Center</span>
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight">
                Din cockpit<br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  för livet.
                </span>
              </h1>
              <p className="text-sm text-slate-500 mt-2">6 verktyg byggda på beteendeforskning</p>
            </motion.div>
          ) : (
            <motion.div key="module-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: active.accent }}>{active.tag}</span>
              </div>
              <h1 className="text-2xl font-bold text-white">{active.title}</h1>
              <p className="text-sm text-slate-400 mt-1">{active.hook}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          {!activeModule ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-4"
            >
              {MODULES.map((mod, i) => {
                const Icon = mod.icon;
                return (
                  <motion.button
                    key={mod.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 28 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveModule(mod.id)}
                    className="w-full text-left relative overflow-hidden rounded-2xl p-5 border border-white/10"
                    style={{
                      background: 'rgba(15,20,35,0.7)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      boxShadow: `0 0 30px ${mod.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                      borderColor: `${mod.accent}30`,
                    }}
                  >
                    {/* Glow orb */}
                    <div
                      className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                      style={{ background: mod.glow }}
                    />

                    <div className="relative flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
                        style={{ boxShadow: `0 8px 20px ${mod.glow}` }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                            style={{ color: mod.accent, background: `${mod.accent}18` }}
                          >
                            {mod.tag}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">{mod.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mod.hook}</p>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0 self-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: `${mod.accent}20` }}
                        >
                          <span style={{ color: mod.accent }} className="text-sm font-bold">›</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {ActiveComponent && <ActiveComponent profile={profile} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}