import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Shield, Brain, TrendingUp, Users, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DecisionEngine from '@/components/protools/DecisionEngine';
import ShadowInflation from '@/components/protools/ShadowInflation';
import OpportunityScanner from '@/components/protools/OpportunityScanner';
import ResilienceScore from '@/components/protools/ResilienceScore';
import BufferPulse from '@/components/protools/BufferPulse';
import CrisisAssistant from '@/components/protools/CrisisAssistant';
import SpendingProfile from '@/components/protools/SpendingProfile';
import EmotionalShield from '@/components/protools/EmotionalShield';
import GoalAutomation from '@/components/protools/GoalAutomation';
import SubscriptionHunter from '@/components/protools/SubscriptionHunter';
import SubscriptionNegotiator from '@/components/protools/SubscriptionNegotiator';
import NetWorthDashboard from '@/components/protools/NetWorthDashboard';
import FamilyFinances from '@/components/protools/FamilyFinances';
import InheritanceChecker from '@/components/protools/InheritanceChecker';
import LegacyPlanner from '@/components/protools/LegacyPlanner';
import AgentHub from '@/components/protools/AgentHub';
import ModeGate from '@/components/ModeGate';

const categories = [
  {
    id: 'agents',
    name: 'Ledningsgruppen',
    icon: Bot,
    color: 'from-violet-500 to-purple-700',
    features: ['agent_hub'],
    highlight: true,
  },
  {
    id: 'decision',
    name: 'Beslutsmotorn',
    icon: Brain,
    color: 'from-purple-500 to-pink-600',
    features: ['decision_engine', 'shadow_inflation', 'opportunity_scanner']
  },
  {
    id: 'security',
    name: 'Trygghet & Prognos',
    icon: Shield,
    color: 'from-emerald-500 to-green-600',
    features: ['resilience', 'buffer_pulse', 'crisis_assistant']
  },
  {
    id: 'behavior',
    name: 'Beteende & Psykologi',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    features: ['spending_profile', 'emotional_shield', 'goal_automation']
  },
  {
    id: 'optimization',
    name: 'Optimering',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-600',
    features: ['subscription_hunter', 'subscription_negotiator', 'networth']
  },
  {
    id: 'family',
    name: 'Relationer & Arv',
    icon: Users,
    color: 'from-indigo-500 to-purple-600',
    features: ['family_finances', 'inheritance_checker', 'legacy_planner']
  }
];

export default function ProTools() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  const renderFeature = () => {
    switch(selectedFeature) {
      case 'decision_engine': return <DecisionEngine profile={profile} />;
      case 'shadow_inflation': return <ShadowInflation profile={profile} />;
      case 'opportunity_scanner': return <OpportunityScanner profile={profile} />;
      case 'resilience': return <ResilienceScore profile={profile} />;
      case 'buffer_pulse': return <BufferPulse profile={profile} />;
      case 'crisis_assistant': return <CrisisAssistant profile={profile} />;
      case 'spending_profile': return <SpendingProfile profile={profile} />;
      case 'emotional_shield': return <EmotionalShield profile={profile} />;
      case 'goal_automation': return <GoalAutomation profile={profile} />;
      case 'subscription_hunter': return <SubscriptionHunter profile={profile} />;
      case 'subscription_negotiator': return <SubscriptionNegotiator profile={profile} />;
      case 'networth': return <NetWorthDashboard profile={profile} />;
      case 'family_finances': return <FamilyFinances profile={profile} />;
      case 'inheritance_checker': return <InheritanceChecker profile={profile} />;
      case 'legacy_planner': return <LegacyPlanner profile={profile} />;
      case 'agent_hub': return <ModeGate feature="agent_hub" mode={profile?.mode || 'basic'}><AgentHub profile={profile} /></ModeGate>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-8 pb-6">
        <Link to={createPageUrl('Dashboard')}>
          <Button variant="ghost" size="icon" className="mb-4 rounded-xl bg-white/5 hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2">Pro Tools</h1>
        <p className="text-sm text-slate-400">Avancerade ekonomiska verktyg</p>
      </div>

      <div className="px-6 space-y-6">
        {!selectedFeature ? (
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-5 rounded-2xl dark-card hover:border-white/20 border ${cat.highlight ? 'border-violet-500/40' : 'border-white/10'}`}
                  style={cat.highlight ? { background: 'rgba(139,92,246,0.08)' } : {}}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{cat.features.length} verktyg</p>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={() => setSelectedFeature(null)}
              className="text-slate-400 hover:text-white"
            >
              ← Tillbaka
            </Button>
            {renderFeature()}
          </>
        )}

        {selectedCategory && !selectedFeature && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <Button
              variant="ghost"
              onClick={() => setSelectedCategory(null)}
              className="text-slate-400 hover:text-white mb-4"
            >
              ← Tillbaka
            </Button>
            {categories.find(c => c.id === selectedCategory)?.features.map((feature, i) => (
              <motion.button
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedFeature(feature)}
                className="w-full p-4 rounded-xl dark-card hover:border-white/20 border border-white/10 text-left"
              >
                <p className="text-white font-medium">
                  {feature.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </p>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}