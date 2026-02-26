import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings, ShoppingBag, Zap, TrendingUp, Landmark, Brain, Plus, Plane } from 'lucide-react';
import { Button } from "@/components/ui/button";
import QuickExpenseModal from '@/components/purchase/QuickExpenseModal';
import HeroCards from '@/components/dashboard/HeroCards';
import InsightsSection from '@/components/dashboard/InsightsSection';
import ForecastChart from '@/components/dashboard/ForecastChart';
import WelcomeAnalysis from '@/components/dashboard/WelcomeAnalysis';
import { AnimatePresence } from 'framer-motion';
import ModeSelector from '@/components/modes/ModeSelector';
import BasicDashboard from '@/components/modes/BasicDashboard';
import SmartDashboard from '@/components/modes/SmartDashboard';
import ProDashboard from '@/components/modes/ProDashboard';
import { Layers } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [insights, setInsights] = useState([]);
  const [healthScore, setHealthScore] = useState(0);
  const [healthLabel, setHealthLabel] = useState('');
  const [mentalLoad, setMentalLoad] = useState({ score: 0, factors: [] });
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  useEffect(() => {
    if (profile && !profile.onboardingCompleted) {
      navigate(createPageUrl('Onboarding'));
    }
  }, [profile, navigate]);

  const currentMode = profile?.mode || 'basic';

  useEffect(() => {
    if (profile && profile.onboardingCompleted) {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setShowWelcome(true);
        localStorage.setItem('hasSeenWelcome', 'true');
      }
    }
  }, [profile]);

  useEffect(() => {
    // Track dashboard view
    base44.analytics.track({
      eventName: 'dashboard_viewed'
    });
  }, []);

  useEffect(() => {
    if (profile) {
      calculateHealthScore(profile);
      generateInsights(profile);
      calculateMentalLoad(profile);
    }
  }, [profile]);

  const calculateHealthScore = (p) => {
    let score = 50;
    
    const totalSubscriptions = (p.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
    const totalLoanPayments = (p.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
    const totalFixedCosts = p.housingCost + totalSubscriptions + totalLoanPayments;
    const margin = p.income - totalFixedCosts;
    const marginPercent = (margin / p.income) * 100;

    if (marginPercent >= 30) score += 20;
    else if (marginPercent >= 20) score += 10;
    else if (marginPercent >= 10) score += 5;
    else if (marginPercent < 0) score -= 20;

    const monthsOfBuffer = p.buffer / totalFixedCosts;
    if (monthsOfBuffer >= 3) score += 15;
    else if (monthsOfBuffer >= 1) score += 5;
    else score -= 10;

    if (p.savingsGoal > 0 && p.buffer >= p.savingsGoal * 0.5) score += 10;
    if ((p.loans || []).length === 0) score += 5;

    score = Math.max(0, Math.min(100, score));
    setHealthScore(score);

    if (score >= 80) setHealthLabel('Utmärkt! Din ekonomi är i balans.');
    else if (score >= 60) setHealthLabel('Bra! Några områden kan förbättras.');
    else if (score >= 40) setHealthLabel('Medel. Det finns potential att optimera.');
    else setHealthLabel('Behöver uppmärksamhet. Låt oss hjälpa dig.');
  };

  const generateInsights = (p) => {
    const newInsights = [];
    
    const totalSubscriptions = (p.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
    const totalLoanPayments = (p.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
    const totalFixedCosts = p.housingCost + totalSubscriptions + totalLoanPayments;
    const margin = p.income - totalFixedCosts;

    if (margin < p.income * 0.1) {
      newInsights.push({
        type: 'warning',
        title: 'Liten marginal',
        description: 'Din månatliga marginal är under 10% av inkomsten.',
        impact: `${Math.round((margin / p.income) * 100)}% marginal`,
        action: 'Se kostnadsförslag'
      });
    }

    const monthsOfBuffer = p.buffer / totalFixedCosts;
    if (monthsOfBuffer < 3) {
      newInsights.push({
        type: monthsOfBuffer < 1 ? 'danger' : 'warning',
        title: 'Bufferten är låg',
        description: `Din buffert räcker endast ${monthsOfBuffer.toFixed(1)} månader vid oväntade utgifter.`,
        impact: `Rekommenderat: 3+ månader`,
        action: 'Skapa sparplan'
      });
    }

    if ((p.loans || []).length >= 2) {
      const totalInterest = (p.loans || []).reduce((sum, l) => sum + (l.totalAmount * (l.interestRate / 100)), 0);
      newInsights.push({
        type: 'warning',
        title: 'Flera lån upptäckta',
        description: 'Du kan potentiellt spara pengar genom att samla dina lån.',
        impact: `Årlig räntekostnad: ${Math.round(totalInterest).toLocaleString()} kr`,
        action: 'Analysera lån'
      });
    }

    if (newInsights.length === 0) {
      newInsights.push({
        type: 'success',
        title: 'Du är på rätt spår!',
        description: 'Din ekonomi ser bra ut just nu. Fortsätt så!',
        impact: 'Inga varningar'
      });
    }

    setInsights(newInsights);
  };

  const calculateMentalLoad = (p) => {
    let score = 20;
    const factors = [];

    const subscriptionCount = (p.subscriptions || []).length;
    if (subscriptionCount > 5) {
      score += 15;
      factors.push({ name: `${subscriptionCount} aktiva abonnemang`, positive: false });
    }

    const loanCount = (p.loans || []).length;
    if (loanCount > 0) {
      score += loanCount * 10;
      factors.push({ name: `${loanCount} aktiva lån`, positive: false });
    }

    const totalFixedCosts = p.housingCost + 
      (p.subscriptions || []).reduce((sum, s) => sum + s.amount, 0) + 
      (p.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
    const margin = p.income - totalFixedCosts;
    
    if (margin < p.income * 0.1) {
      score += 20;
      factors.push({ name: 'Låg marginal', positive: false });
    }

    if (p.buffer >= totalFixedCosts * 3) {
      score -= 15;
      factors.push({ name: 'God buffert', positive: true });
    }

    score = Math.max(0, Math.min(100, score));
    setMentalLoad({ score, factors });
  };

  const handleModeChange = async (newMode) => {
    await base44.entities.FinancialProfile.update(profile.id, { mode: newMode });
    queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
    setShowModeSelector(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-6">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-32 glass-effect rounded-2xl"
          />
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                className="h-24 glass-effect rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Välkommen till ANCHOR</h2>
          <p className="text-slate-600 mb-6">Din personliga ekonomiska coach</p>
          <Button
            onClick={() => navigate(createPageUrl('Onboarding'))}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            Kom igång
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-slate-500 text-sm">Välkommen tillbaka</p>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ANCHOR
            </h1>
          </motion.div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowModeSelector(true)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300 capitalize">{currentMode}</span>
            </motion.button>
            <Link to={createPageUrl('Settings')}>
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10">
                  <Settings className="w-5 h-5 text-slate-400" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Hero Cards */}
        <HeroCards profile={profile} />

        {/* Forecast Chart */}
        <ForecastChart profile={profile} />

        {/* Insights, Risks & Actions */}
        <InsightsSection insights={insights} profile={profile} />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowExpenseModal(true)}
            className="glass-effect rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20" />
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Registrera köp</p>
                <p className="text-xs text-slate-400">Lägg till utgift</p>
              </div>
            </div>
          </motion.button>

          <Link to={createPageUrl('Expenses')}>
            <motion.div
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className="glass-effect rounded-2xl p-5 shadow-lg h-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10" />
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">Se utgifter</p>
                  <p className="text-xs text-slate-400">Översikt</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Pro Tools with AI Glow */}
        <Link to={createPageUrl('ProTools')}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group"
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Pro Tools</h3>
                <p className="text-xs text-slate-400">15 avancerade verktyg för din ekonomi</p>
              </div>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Brain className="w-6 h-6 text-purple-400" />
              </motion.div>
            </div>
          </motion.div>
        </Link>

        {/* Other Actions */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Plane, label: 'Resor', page: 'TravelPlanner', color: 'from-blue-500 to-cyan-600' },
            { icon: Landmark, label: 'Lån', page: 'Loans', color: 'from-amber-500 to-orange-600' },
            { icon: Brain, label: 'Simulator', page: 'PurchaseSimulator', color: 'from-emerald-500 to-green-600', isPro: true },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <Link key={action.page} to={createPageUrl(action.page)}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl glass-effect relative"
                >
                  {action.isPro && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white">PRO</span>
                      </div>
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-slate-300 font-medium">{action.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Expense Modal */}
      <QuickExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        profile={profile}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
          setShowExpenseModal(false);
        }}
      />

      {/* Welcome Analysis */}
      <AnimatePresence>
        {showWelcome && (
          <WelcomeAnalysis 
            profile={profile} 
            onClose={() => setShowWelcome(false)} 
          />
        )}
      </AnimatePresence>

      {/* Mode Selector */}
      <AnimatePresence>
        {showModeSelector && (
          <ModeSelector 
            currentMode={currentMode}
            onSelectMode={handleModeChange}
            onClose={() => setShowModeSelector(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}