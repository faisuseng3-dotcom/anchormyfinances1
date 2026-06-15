import React, { useState, useEffect } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { base44 } from '@/api/base44Client';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useDashboardPrefetch } from '@/hooks/useDashboardPrefetch';
import { AnimatePresence } from 'framer-motion';
import CopilotBentoDashboard from '@/components/dashboard/CopilotBentoDashboard';
import DashboardSkeleton from '@/components/loading/DashboardSkeleton';
import TransactionHub from '@/components/transactions/TransactionHub';
import BadgeUnlock from '@/components/goals/BadgeUnlock';
import WelcomeAnalysis from '@/components/dashboard/WelcomeAnalysis';
import { useGamification, checkAndUnlockBadges } from '@/hooks/useGamification';
import MagicEntryBox from '@/components/import/MagicEntryBox';
import { useDemoMode } from '@/components/demo/DemoMode';
import AlexModeHUD from '@/components/demo/AlexModeHUD';
import { getDashboardPath, getOnboardingPath, isBusinessMode, isBusinessOnboarded } from '@/lib/onboardingRouter';
import { isBusinessUserType } from '@/lib/onboardingWizard';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoadingAuth } = useAuth();
  const [showTransactionHub, setShowTransactionHub] = useState(false);
  const [showMagicEntry, setShowMagicEntry] = useState(false);
  const { isAlexMode: isAlex } = useDemoMode();
  const { profile, isLoading, invalidate, isPersisted, updateProfile } = useFinancialProfile();
  const { transactions: txs } = useTransactions();
  useDashboardPrefetch(profile);
  const [showWelcome, setShowWelcome] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
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
    if (!profile) return;

    if (isBusinessMode() || isBusinessUserType(profile.userType)) {
      if (!profile.onboardingCompleted || !isBusinessOnboarded()) {
        navigate('/BusinessOnboarding', { replace: true });
      } else {
        navigate(getDashboardPath('business'), { replace: true });
      }
      return;
    }

    if (!profile.onboardingCompleted) {
      navigate(getOnboardingPath(), { replace: true });
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
    if (action === 'register') window.dispatchEvent(new CustomEvent('anchor:open-quick-expense'));
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
      if (e.detail.action === 'register') window.dispatchEvent(new CustomEvent('anchor:open-quick-expense'));
      if (e.detail.action === 'plan') window.dispatchEvent(new CustomEvent('anchor:open-plan'));
      if (e.detail.action === 'transfer' || e.detail.action === 'save') setShowTransactionHub(true);
    };
    window.addEventListener('anchor:action', handler);
    return () => window.removeEventListener('anchor:action', handler);
  }, []);

  useEffect(() => {
    if (location.hash !== '#passivity') return;
    navigate(`${createPageUrl('ProTools')}?deep=ai_guru`, { replace: true });
  }, [location.hash, navigate]);

  if (isLoadingAuth || isLoading) {
    return <DashboardSkeleton />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Välkommen till Anchor</p>
          <button onClick={() => navigate(getOnboardingPath('personal'))}
          className="mt-4 px-8 py-3 rounded-full text-white font-semibold" style={{ background: 'var(--color-accent)' }}>
            Kom igång
          </button>
        </div>
      </div>);

  }

  return (
    <>
      <AlexModeHUD active={isAlex} />
      <CopilotBentoDashboard
        profile={profile}
        transactions={txs}
        updateProfile={updateProfile}
        user={isAlex ? { full_name: 'Alex Lindqvist' } : undefined}
        onOpenMagicEntry={() => setShowMagicEntry(true)}
        onOpenTransactionHub={() => setShowTransactionHub(true)}
      />
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
              if (action === 'register') window.dispatchEvent(new CustomEvent('anchor:open-quick-expense'));
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

export const pageSeo = pageSeoFor('Dashboard');
