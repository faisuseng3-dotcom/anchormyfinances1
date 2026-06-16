import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useOptimisticTransactions } from '@/hooks/useOptimisticTransactions';
import { useDemoMode } from '@/components/demo/DemoMode';
import {
  COPILOT_VIEWS,
  copilotToolHref,
  parseCopilotViewFromSearch,
  resolveCopilotToolView,
} from '@/lib/copilotViews';
import { crossFade } from '@/lib/motionPresets';
import AnchorCopilotSidebar from '@/components/dashboard/copilot/AnchorCopilotSidebar';
import AccountDetailDrawer from '@/components/dashboard/copilot/AccountDetailDrawer';
import CopilotToolView from '@/components/dashboard/copilot/tools/CopilotToolView';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';
import TheSwipe from '@/components/transactions/TheSwipe';
import { CopilotNavProvider, useCopilotNav } from './CopilotNavContext';
import BottomTabBar from './BottomTabBar';
import '@/components/dashboard/copilot/anchorCopilot.css';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function CopilotShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, closeSidebar, setActiveView } = useCopilotNav();
  const { user } = useAuth();
  const { profile, updateProfile } = useFinancialProfile();
  const { transactions = [] } = useTransactions({ personalOnly: true, limit: 500 });
  const { isAlexMode: isAlex } = useDemoMode();
  const queryClient = useQueryClient();
  const { createTransaction } = useOptimisticTransactions();

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [swipeOpen, setSwipeOpen] = useState(false);

  const displayUser = isAlex ? { full_name: 'Alex Lindqvist' } : user;
  const currentPage = location.pathname.split('/').filter(Boolean).pop() || 'Dashboard';
  const onDashboard = currentPage === 'Dashboard';
  const onSubscriptionsPage = currentPage === 'Subscriptions';

  // Prenumerationer → /Subscriptions (egen route). Övriga inline-vyer → Dashboard?view=
  const toolViewFromUrl = resolveCopilotToolView(location.pathname, location.search);
  const dashboardInlineView = onDashboard ? parseCopilotViewFromSearch(location.search) : null;
  const showToolView = Boolean(
    dashboardInlineView && dashboardInlineView !== COPILOT_VIEWS.subscriptions,
  );

  // Legacy ?view=subscriptions på Dashboard → kanonisk /Subscriptions
  useEffect(() => {
    if (!onDashboard) return;
    const fromSearch = parseCopilotViewFromSearch(location.search);
    if (fromSearch === COPILOT_VIEWS.subscriptions) {
      navigate(createPageUrl('Subscriptions'), { replace: true });
    }
  }, [onDashboard, location.search, navigate]);

  // Övriga inline-vyer ska alltid ligga på Dashboard, aldrig kvar på /ProTools
  useEffect(() => {
    if (!dashboardInlineView || dashboardInlineView === COPILOT_VIEWS.subscriptions) return;
    const target = copilotToolHref(dashboardInlineView);
    const current = `${location.pathname}${location.search}`;
    if (current !== target) {
      navigate(target, { replace: true });
    }
  }, [dashboardInlineView, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.log('[CopilotRoute]', {
      pathname: location.pathname,
      search: location.search,
      currentPage,
      toolViewFromUrl,
      dashboardInlineView,
      showToolView,
      onSubscriptionsPage,
      rendering: onSubscriptionsPage
        ? 'SubscriptionsPage/SubscriptionListView'
        : showToolView
          ? `CopilotToolView(${dashboardInlineView})`
          : `children(${currentPage})`,
    });
  }, [
    location.pathname,
    location.search,
    currentPage,
    toolViewFromUrl,
    dashboardInlineView,
    showToolView,
    onSubscriptionsPage,
  ]);

  const getFreshProfile = useCallback(async () => {
    const profiles = await base44.entities.FinancialProfile.list();
    return profiles[0] || null;
  }, []);

  const handleTransfer = useCallback((direction, amount) => {
    getFreshProfile()
      .then((fresh) => {
        if (!fresh?.id) return null;
        if (direction === 'to_savings') {
          return base44.entities.FinancialProfile.update(fresh.id, {
            savingsCurrentBalance: (fresh.savingsCurrentBalance || 0) + amount,
            buffer: Math.max(0, (fresh.buffer || 0) - amount),
          }).then(() => {
            createTransaction({
              type: 'transfer_to_savings',
              amount,
              label: `Överföring till spar: +${fmt(amount)} kr`,
            });
          });
        }
        return base44.entities.FinancialProfile.update(fresh.id, {
          savingsCurrentBalance: Math.max(0, (fresh.savingsCurrentBalance || 0) - amount),
          buffer: (fresh.buffer || 0) + amount,
        }).then(() => {
          createTransaction({
            type: 'transfer_to_spending',
            amount,
            label: `Överföring från spar: +${fmt(amount)} kr`,
          });
        });
      })
      .then(() => queryClient.invalidateQueries({ queryKey: ['financialProfile'] }))
      .catch(() => {});
  }, [createTransaction, getFreshProfile, queryClient]);

  const handleGoHome = useCallback(() => {
    setActiveView(COPILOT_VIEWS.home);
    navigate(createPageUrl('Dashboard'));
  }, [navigate, setActiveView]);

  return (
    <div className="anchor-copilot-shell">
      <AnchorCopilotSidebar
        profile={profile}
        user={displayUser}
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
        onAccountSelect={setSelectedAccount}
        onGoHome={handleGoHome}
        toolViewFromUrl={toolViewFromUrl}
      />
      <main className="copilot-main" style={{ paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))' }} >
        <AnimatePresence mode="wait">
          {showToolView ? (
            <motion.div key={dashboardInlineView} {...crossFade} className="min-h-full">
              <CopilotToolView
                view={dashboardInlineView}
                profile={profile}
                transactions={transactions}
                updateProfile={updateProfile}
              />
            </motion.div>
          ) : (
            <motion.div key={`page-${location.pathname}`} {...crossFade} className="min-h-full">
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <BottomTabBar />

      <AccountDetailDrawer
        account={selectedAccount}
        profile={profile}
        transactions={transactions}
        isOpen={Boolean(selectedAccount)}
        onClose={() => setSelectedAccount(null)}
        onOpenSwipe={() => setSwipeOpen(true)}
      />

      <AnchorSheet
        isOpen={swipeOpen}
        onClose={() => setSwipeOpen(false)}
        title="Flytta pengar"
        subtitle="Dra mellan buffert och sparmål"
        maxHeight="min(88dvh, 680px)"
      >
        <TheSwipe profile={profile} onTransfer={handleTransfer} />
      </AnchorSheet>
    </div>
  );
}

export default function CopilotAppLayout({ children }) {
  return (
    <CopilotNavProvider>
      <CopilotShell>{children}</CopilotShell>
    </CopilotNavProvider>
  );
}
