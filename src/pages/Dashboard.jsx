import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Landing from '@/pages/Landing';
import { isGuestMode, loadGuestProfile } from '@/components/guestStorage';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ChevronRight } from 'lucide-react';
import SafeToSpendWidget from '@/components/dashboard/SafeToSpendWidget';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import ExpensesCard from '@/components/dashboard/ExpensesCard';
import ForecastChart from '@/components/dashboard/ForecastChart';
import DebtAlert from '@/components/dashboard/DebtAlert';
import InsightsSection from '@/components/dashboard/InsightsSection';
import QuickExpenseModal from '@/components/purchase/QuickExpenseModal';
import TransactionHub from '@/components/transactions/TransactionHub';
import BadgeUnlock from '@/components/gamification/BadgeUnlock';
import WelcomeAnalysis from '@/components/dashboard/WelcomeAnalysis';
import AdminScoreboard from '@/components/challenge/AdminScoreboard';
import WeeklyPointsBadge from '@/components/challenge/WeeklyPointsBadge';
import { useGamification, checkAndUnlockBadges } from '@/hooks/useGamification';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import InsightCards from '@/components/import/InsightCards';
import MagicEntryBox from '@/components/import/MagicEntryBox';
import DemoToggle from '@/components/demo/DemoToggle';
import { useDemoMode } from '@/components/demo/DemoMode';
import { FileUp, Zap } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showTransactionHub, setShowTransactionHub] = useState(false);
  const [showMagicEntry, setShowMagicEntry] = useState(false);
  const { isDemoMode, demoProfile, demoTransactions } = useDemoMode();
  const [showWelcome, setShowWelcome] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
  const [insights, setInsights] = useState([]);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      if (isGuestMode()) return loadGuestProfile() || null;
      const profiles = await base44.entities.FinancialProfile.list();
      if (profiles.length > 0) {
        const newBadges = await checkAndUnlockBadges(profiles[0]);
        if (newBadges.length > 0) { setUnlockedBadge(newBadges[0]); setShowBadgeUnlock(true); }
      }
      return profiles[0] || null;
    }
  });

  const profile = isDemoMode ? demoProfile : profileData;

  useGamification(profileData);

  useEffect(() => {
    if (profile && !profile.onboardingCompleted) {
      navigate(createPageUrl('Onboarding'), { replace: true });
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (profile?.onboardingCompleted) {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) { setShowWelcome(true); localStorage.setItem('hasSeenWelcome', 'true'); }
    }
  }, [profile]);

  useEffect(() => {
    base44.analytics.track({ eventName: 'dashboard_viewed' });
    // Listen for FAB actions from Layout
    const handler = (e) => {
      if (e.detail.action === 'register') setShowExpenseModal(true);
      if (e.detail.action === 'transfer' || e.detail.action === 'save') setShowTransactionHub(true);
    };
    window.addEventListener('anchor:action', handler);
    return () => window.removeEventListener('anchor:action', handler);
  }, []);

  useEffect(() => {
    if (!profile) return;
    const totalFixedCosts = getTotalFixedCosts(profile);
    const margin = profile.income - totalFixedCosts;
    const newInsights = [];
    if (margin < profile.income * 0.1) {
      newInsights.push({ type: 'warning', title: 'Liten marginal', description: 'Din marginal är under 10% av inkomsten.', impact: `${Math.round((margin / profile.income) * 100)}% marginal`, action: 'Se kostnadsförslag' });
    }
    const monthsOfBuffer = profile.buffer / totalFixedCosts;
    if (monthsOfBuffer < 3) {
      newInsights.push({ type: monthsOfBuffer < 1 ? 'danger' : 'warning', title: 'Bufferten är låg', description: `Räcker ${monthsOfBuffer.toFixed(1)} månader.`, impact: 'Rekommenderat: 3+ månader', action: 'Skapa sparplan' });
    }
    if (newInsights.length === 0) {
      newInsights.push({ type: 'success', title: 'Bra koll!', description: 'Din ekonomi ser stabil ut.', impact: 'Inga varningar' });
    }
    setInsights(newInsights);
  }, [profile]);

  if (!isLoadingAuth && !isAuthenticated && !isGuestMode()) return <Landing />;

  if (isLoadingAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-surface)', borderTopColor: 'var(--color-accent)' }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Välkommen till Anchor</p>
          <button onClick={() => navigate(createPageUrl('Onboarding'))}
            className="mt-4 px-8 py-3 rounded-full text-white font-semibold" style={{ background: 'var(--color-accent)' }}>
            Kom igång
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--color-background-primary)' }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <div>
          <AdminScoreboard />
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Välkommen tillbaka</p>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>Din ekonomi</h1>
        </div>
        <div className="flex items-center gap-2">
          <DemoToggle />
          <WeeklyPointsBadge />
          <Link to={createPageUrl('Settings')}>
            <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
              <Settings className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </Link>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Safe-to-Spend — primary widget */}
        <SafeToSpendWidget profile={profile} />

        {/* Action Card — Verktyg & Intelligens */}
        <Link to={createPageUrl('ProTools')}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #2d1f6e 0%, #1a2f5e 100%)',
              border: '1px solid rgba(139,92,246,0.35)',
              boxShadow: '0 4px 20px rgba(75,124,243,0.18)',
            }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.4)' }}>
              <span className="text-xl">✦</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: '#e0d8ff' }}>Dina Superkrafter</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(180,168,255,0.7)' }}>
                Simulatorer, lån, reseanalys &amp; intelligens
              </p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.3)' }}>
              <ChevronRight className="w-4 h-4" style={{ color: '#c4b5fd' }} />
            </div>
          </motion.div>
        </Link>

        {/* Debt alert */}
        <DebtAlert profile={profile} />

        {/* Expenses visual card */}
        <ExpensesCard profile={profile} />

        {/* 3 recent transactions */}
        <RecentTransactions />

        {/* Forecast */}
        <ForecastChart profile={profile} />

        {/* Insights */}
        <InsightsSection insights={insights} profile={profile} />

        {/* AI Coach Insight Cards */}
        <InsightCards profile={profile} transactions={isDemoMode ? demoTransactions : []} />

        {/* Quick action row */}
        <div className="flex gap-3">
          <Link to="/Import" className="flex-1">
            <motion.div whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{ background: 'var(--color-surface)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <FileUp className="w-4 h-4" style={{ color: '#0D7377' }} />
              <span className="text-xs font-bold" style={{ color: '#1A2332' }}>Importera CSV</span>
            </motion.div>
          </Link>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowMagicEntry(true)}
            className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl"
            style={{ background: 'var(--color-surface)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <Zap className="w-4 h-4" style={{ color: '#0D7377' }} />
            <span className="text-xs font-bold" style={{ color: '#1A2332' }}>Magisk inmatning</span>
          </motion.button>
        </div>


      </div>

      {/* Modals */}
      <QuickExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        profile={profile}
        onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['financialProfile'] }); setShowExpenseModal(false); }}
      />
      <TransactionHub
        isOpen={showTransactionHub}
        onClose={() => setShowTransactionHub(false)}
        profile={profile}
      />
      <AnimatePresence>
        {showWelcome && <WelcomeAnalysis profile={profile} onClose={() => setShowWelcome(false)} />}
      </AnimatePresence>
      <BadgeUnlock badgeId={unlockedBadge} isVisible={showBadgeUnlock} onClose={() => setShowBadgeUnlock(false)} />
      <MagicEntryBox
        isOpen={showMagicEntry}
        onClose={() => setShowMagicEntry(false)}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['financialProfile'] })}
      />
    </div>
  );
}