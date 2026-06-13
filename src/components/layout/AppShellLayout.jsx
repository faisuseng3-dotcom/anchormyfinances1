import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useOptimisticTransactions } from '@/hooks/useOptimisticTransactions';
import { useDemoMode } from '@/components/demo/DemoMode';
import { parseCopilotViewFromSearch } from '@/lib/copilotViews';
import AnchorCopilotSidebar from '@/components/dashboard/copilot/AnchorCopilotSidebar';
import AccountDetailDrawer from '@/components/dashboard/copilot/AccountDetailDrawer';
import AppTopBar from '@/components/layout/AppTopBar';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';
import TheSwipe from '@/components/transactions/TheSwipe';
import PageTransition from '@/components/ui-premium/PageTransition';
import { CopilotNavProvider, useCopilotNav } from './CopilotNavContext';

const VIEW_ROUTE_MAP = {
  goals: 'SavingsGoals',
  squads: 'Squads',
  academy: 'AnchorAcademy',
  subscriptions: 'Subscriptions',
};

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function AppShellInner({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, closeSidebar, setActiveView, goHome } = useCopilotNav();
  const { user } = useAuth();
  const { profile, updateProfile } = useFinancialProfile();
  const { transactions = [] } = useTransactions({ personalOnly: true, limit: 500 });
  const { isAlexMode: isAlex } = useDemoMode();
  const queryClient = useQueryClient();
  const { createTransaction } = useOptimisticTransactions();

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [swipeOpen, setSwipeOpen] = useState(false);

  const displayUser = isAlex ? { full_name: 'Alex Lindqvist' } : user;

  // Legacy ?view= på Dashboard → dedikerad route
  useEffect(() => {
    const page = location.pathname.split('/').filter(Boolean).pop();
    if (page !== 'Dashboard') return;
    const view = parseCopilotViewFromSearch(location.search);
    if (!view) return;
    const target = VIEW_ROUTE_MAP[view];
    if (target) navigate(createPageUrl(target), { replace: true });
  }, [location.pathname, location.search, navigate]);

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
    setActiveView('home');
    goHome();
    navigate(createPageUrl('Dashboard'));
  }, [navigate, setActiveView, goHome]);

  return (
    <div className="anchor-copilot-shell">
      <AnchorCopilotSidebar
        profile={profile}
        user={displayUser}
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
        onAccountSelect={setSelectedAccount}
        onGoHome={handleGoHome}
      />
      <main className="copilot-main">
        <AppTopBar />
        <div className="copilot-content flex-1">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>

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

export default function AppShellLayout({ children }) {
  return (
    <CopilotNavProvider>
      <AppShellInner>{children}</AppShellInner>
    </CopilotNavProvider>
  );
}
