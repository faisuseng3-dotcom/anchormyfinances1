import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings, Layers } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AnimatePresence } from 'framer-motion';
import ModeSelector from '@/components/modes/ModeSelector';
import BasicDashboard from '@/components/modes/BasicDashboard';
import SmartDashboard from '@/components/modes/SmartDashboard';
import ProDashboard from '@/components/modes/ProDashboard';
import WelcomeAnalysis from '@/components/dashboard/WelcomeAnalysis';

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
    base44.analytics.track({ eventName: 'dashboard_viewed' });
  }, []);

  const currentMode = profile?.mode || 'basic';

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
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Välkommen till ANCHOR</h2>
          <p className="text-slate-400 mb-6">Din personliga ekonomiska coach</p>
          <Button onClick={() => navigate(createPageUrl('Onboarding'))} className="bg-emerald-500 hover:bg-emerald-600">
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
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
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

      {/* Mode-gated content */}
      {currentMode === 'basic' && <BasicDashboard profile={profile} />}
      {currentMode === 'smart' && <SmartDashboard profile={profile} />}
      {currentMode === 'pro' && <ProDashboard profile={profile} />}

      <AnimatePresence>
        {showWelcome && (
          <WelcomeAnalysis profile={profile} onClose={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

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