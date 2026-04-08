import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plane, Landmark, ScanLine, Brain, GitBranch, Calculator, BarChart2, Bot, Rocket, User, Scissors, Users } from 'lucide-react';

// Feature components
import DecisionEngine from '@/components/protools/DecisionEngine';
import SpendingProfile from '@/components/protools/SpendingProfile';
import SubscriptionHunter from '@/components/protools/SubscriptionHunter';
import FamilyFinances from '@/components/protools/FamilyFinances';
import AgentHub from '@/components/protools/AgentHub';
import StrategyCenter from '@/components/protools/mastery/StrategyCenter';
import AIGuru from '@/components/protools/mastery/AIGuru';
import FutureSimulator from '@/components/protools/mastery/FutureSimulator';
import EconomicSelf from '@/components/protools/mastery/EconomicSelf';
import MarginMaxer from '@/components/protools/mastery/MarginMaxer';
import LifePuzzle from '@/components/protools/mastery/LifePuzzle';

// Discovery row — circular shortcut icons
const DISCOVERY = [
  { id: 'travel', label: 'Resor', icon: Plane, color: '#4B7CF3', page: 'TravelPlanner' },
  { id: 'resell', label: 'Sälj & Tjäna', icon: ScanLine, color: '#7C6CF3', page: 'ResellScanner' },
  { id: 'loans', label: 'Lån', icon: Landmark, color: '#3DAA7A', page: 'Loans' },
  { id: 'planner', label: 'Planeraren', icon: GitBranch, color: '#C8923A', page: 'WhatIf' },
];

// Tools grid — 2×2 secondary tools
const TOOLS = [
  { id: 'simulator', label: 'Simulator', icon: Brain, page: 'PurchaseSimulator' },
  { id: 'tax', label: 'Skatt', icon: Calculator, page: 'WhatIf' },
  { id: 'history', label: 'Historik', icon: BarChart2, page: 'FinancialHistory' },
  { id: 'pulse', label: 'Pulse', icon: Rocket, page: 'Pulse' },
];

// Deep modules
const MODULES = [
  { id: 'strategy', title: 'Strategi-Center', hook: 'Se din ekonomi uppifrån.', icon: Bot, accent: '#a78bfa', component: StrategyCenter },
  { id: 'ai_guru', title: 'AI-Gurun', hook: 'Bättre beslut på sekunder.', icon: Brain, accent: '#60a5fa', component: AIGuru },
  { id: 'future', title: 'Framtids-Simulatorn', hook: 'Se resultatet av dina beslut.', icon: Rocket, accent: '#34d399', component: FutureSimulator },
  { id: 'self', title: 'Ditt Ekonomiska Jag', hook: 'Förstå ditt ekonomibeteende.', icon: User, accent: '#fbbf24', component: EconomicSelf },
  { id: 'margin', title: 'Marginal-Maxaren', hook: 'Återta din frihet.', icon: Scissors, accent: '#fb7185', component: MarginMaxer },
  { id: 'puzzle', title: 'Livspusslet', hook: 'Bygg ekonomisk trygghet tillsammans.', icon: Users, accent: '#22d3ee', component: LifePuzzle },
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
    <div className="min-h-screen pb-28" style={{ background: 'var(--color-background-primary)' }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-4 flex items-center gap-3">
        {activeModule ? (
          <button onClick={() => setActiveModule(null)}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-surface)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        ) : (
          <Link to={createPageUrl('Dashboard')}>
            <button className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-surface)' }}>
              <ArrowLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
            </button>
          </Link>
        )}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            {activeModule ? active?.title : 'Verktyg'}
          </p>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
            {activeModule ? active?.hook : 'Min Ekonomi'}
          </h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!activeModule ? (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 space-y-6">

            {/* Discovery row — horizontal scroll of circular icons */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Snabbval</p>
              <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
                {DISCOVERY.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.id} to={createPageUrl(item.page)}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.07 }}
                        whileTap={{ scale: 0.92 }}
                        className="flex flex-col items-center gap-2 flex-shrink-0"
                      >
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ background: `${item.color}18`, border: `1.5px solid ${item.color}33` }}>
                          <Icon className="w-7 h-7" style={{ color: item.color }} strokeWidth={1.5} />
                        </div>
                        <p className="text-xs font-medium text-center" style={{ color: 'var(--color-text-secondary)' }}>
                          {item.label}
                        </p>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Tools grid — 2×2 */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Verktyg</p>
              <div className="grid grid-cols-2 gap-3">
                {TOOLS.map((tool, i) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.id} to={createPageUrl(tool.page)}>
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                        whileTap={{ scale: 0.96 }}
                        className="rounded-2xl p-5 flex flex-col gap-3"
                        style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} strokeWidth={1.5} />
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{tool.label}</p>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Deep modules */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Djupanalys</p>
              <div className="space-y-3">
                {MODULES.map((mod, i) => {
                  const Icon = mod.icon;
                  return (
                    <motion.button
                      key={mod.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.06 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveModule(mod.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl text-left"
                      style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${mod.accent}18`, border: `1px solid ${mod.accent}33` }}>
                        <Icon className="w-5 h-5" style={{ color: mod.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{mod.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{mod.hook}</p>
                      </div>
                      <ArrowLeft className="w-4 h-4 rotate-180 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                    </motion.button>
                  );
                })}
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
            className="px-5"
          >
            {ActiveComponent && <ActiveComponent profile={profile} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}