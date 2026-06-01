import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Landing from '@/pages/Landing';
import { isGuestMode } from '@/components/guestStorage';
import { createPageUrl } from '@/utils';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { motion, AnimatePresence } from 'framer-motion';
import FutureDashboard from '@/components/dashboard/FutureDashboard';
import QuickExpenseModal from '@/components/purchase/QuickExpenseModal';
import TransactionHub from '@/components/transactions/TransactionHub';
import BadgeUnlock from '@/components/gamification/BadgeUnlock';
import WelcomeAnalysis from '@/components/dashboard/WelcomeAnalysis';
import { useGamification, checkAndUnlockBadges } from '@/hooks/useGamification';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import MagicEntryBox from '@/components/import/MagicEntryBox';
import { useDemoMode } from '@/components/demo/DemoMode';
import AlexModeHUD from '@/components/demo/AlexModeHUD';
import AlexConflictAlert from '@/components/demo/AlexConflictAlert';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showTransactionHub, setShowTransactionHub] = useState(false);
  const [showMagicEntry, setShowMagicEntry] = useState(false);
  const { isAlexMode: isAlex } = useDemoMode();
  const { profile, isLoading, invalidate, isPersisted } = useFinancialProfile();
  const { transactions: txs } = useTransactions();
  const [showWelcome, setShowWelcome] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
  const [insights, setInsights] = useState([]);

  useGamification(profile ?? null);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    checkAndUnlockBadges(profile).then((newBadges) => {
      if (!cancelled && newBadges?.length > 0) {
        setUnlockedBadge(newBadges[0]);
        setShowBadgeUnlock(true);
      }
    });
    return () => { cancelled = true; };
  }, [profile?.id]);

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
    const action = location.state?.anchorAction;
    if (action === 'register') setShowExpenseModal(true);
    if (action === 'plan') window.dispatchEvent(new CustomEvent('anchor:open-plan'));
    if (action === 'transfer' || action === 'save') setShowTransactionHub(true);
    if (action === 'debt') navigate(createPageUrl('Loans'));
    if (action === 'savings') setShowTransactionHub(true);
    if (action) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.anchorAction, location.pathname, navigate]);

  useEffect(() => {
    base44.analytics.track({ eventName: 'dashboard_viewed' });
    const handler = (e) => {
      if (e.detail.action === 'register') setShowExpenseModal(true);
      if (e.detail.action === 'plan') window.dispatchEvent(new CustomEvent('anchor:open-plan'));
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
        onFocusAction={(action) => {
          if (action === 'register') setShowExpenseModal(true);
          if (action === 'debt') navigate(createPageUrl('Loans'));
          if (action === 'savings') setShowTransactionHub(true);
          if (action === 'plan') window.dispatchEvent(new CustomEvent('anchor:open-plan'));
        }}
      />
      {isAlex && <AlexConflictAlert />}

      {/* Modals */}
      <QuickExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        profile={profile}
        onSuccess={() => { invalidate(); setShowExpenseModal(false); }} />

      <TransactionHub
        isOpen={showTransactionHub}
        onClose={() => setShowTransactionHub(false)}
        profile={profile} />

      <AnimatePresence>
        {showWelcome && (
          <WelcomeAnalysis
            profile={profile}
            onClose={() => setShowWelcome(false)}
            onFirstAction={(action) => {
              if (action === 'register') setShowExpenseModal(true);
              if (action === 'debt') navigate(createPageUrl('Loans'));
              if (action === 'savings') setShowTransactionHub(true);
              if (action === 'plan') window.dispatchEvent(new CustomEvent('anchor:open-plan'));
            }}
          />
        )}
      </AnimatePresence>
      <BadgeUnlock badgeId={unlockedBadge} isVisible={showBadgeUnlock} onClose={() => setShowBadgeUnlock(false)} />
      <MagicEntryBox
        isOpen={showMagicEntry}
        onClose={() => setShowMagicEntry(false)}
        onSaved={() => invalidate()} />
    </>
  );

}