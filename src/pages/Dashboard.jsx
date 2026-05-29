import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Landing from '@/pages/Landing';
import { isGuestMode } from '@/components/guestStorage';
import { createPageUrl } from '@/utils';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import FutureDashboard from '@/components/dashboard/FutureDashboard';
import InsightEngineCards from '@/components/dashboard/InsightEngineCards';
import QuickExpenseModal from '@/components/purchase/QuickExpenseModal';
import TransactionHub from '@/components/transactions/TransactionHub';
import BadgeUnlock from '@/components/gamification/BadgeUnlock';
import WelcomeAnalysis from '@/components/dashboard/WelcomeAnalysis';
import AdminScoreboard from '@/components/challenge/AdminScoreboard';
import WeeklyPointsBadge from '@/components/challenge/WeeklyPointsBadge';
import { useGamification, checkAndUnlockBadges } from '@/hooks/useGamification';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import MagicEntryBox from '@/components/import/MagicEntryBox';
import DemoToggle from '@/components/demo/DemoToggle';
import { useDemoMode } from '@/components/demo/DemoMode';
import AlexModeHUD from '@/components/demo/AlexModeHUD';
import AlexConflictAlert from '@/components/demo/AlexConflictAlert';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showTransactionHub, setShowTransactionHub] = useState(false);
  const [showMagicEntry, setShowMagicEntry] = useState(false);
  const { isAlexMode: isAlex } = useDemoMode();
  const { profile, isLoading, invalidate } = useFinancialProfile({ unlockBadges: true });
  const { transactions: txs } = useTransactions();
  const [showWelcome, setShowWelcome] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
  const [insights, setInsights] = useState([]);

  useGamification(isPersisted ? profile : null);

  useEffect(() => {
    if (!isPersisted || !profile) return;
    let cancelled = false;
    checkAndUnlockBadges(profile).then((newBadges) => {
      if (!cancelled && newBadges?.length > 0) {
        setUnlockedBadge(newBadges[0]);
        setShowBadgeUnlock(true);
      }
    });
    return () => { cancelled = true; };
  }, [isPersisted, profile?.id]);

  useEffect(() => {
    if (profile && !profile.onboardingCompleted) {
      navigate(createPageUrl('Onboarding'), { replace: true });
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (profile?.onboardingCompleted) {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {setShowWelcome(true);localStorage.setItem('hasSeenWelcome', 'true');}
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
      newInsights.push({ type: 'warning', title: 'Liten marginal', description: 'Din marginal är under 10% av inkomsten.', impact: `${Math.round(margin / profile.income * 100)}% marginal`, action: 'Se kostnadsförslag' });
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
      </div>);

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
      </div>);

  }

  return (
    <>
      <AlexModeHUD active={isAlex} />
      <FutureDashboard
        profile={profile}
        transactions={txs}
        user={isAlex ? { full_name: 'Alex Lindqvist' } : undefined}
        onOpenExpense={() => setShowExpenseModal(true)}
        onOpenMagicEntry={() => setShowMagicEntry(true)}
        onOpenTransactionHub={() => setShowTransactionHub(true)}
      />
      {isAlex && <AlexConflictAlert />}

      {/* Modals */}
      <QuickExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        profile={profile}
        onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['financialProfile'] }); setShowExpenseModal(false); }} />

      <TransactionHub
        isOpen={showTransactionHub}
        onClose={() => setShowTransactionHub(false)}
        profile={profile} />

      <AnimatePresence>
        {showWelcome && <WelcomeAnalysis profile={profile} onClose={() => setShowWelcome(false)} />}
      </AnimatePresence>
      <BadgeUnlock badgeId={unlockedBadge} isVisible={showBadgeUnlock} onClose={() => setShowBadgeUnlock(false)} />
      <MagicEntryBox
        isOpen={showMagicEntry}
        onClose={() => setShowMagicEntry(false)}
        onSaved={() => invalidate()} />
    </>
  );

}