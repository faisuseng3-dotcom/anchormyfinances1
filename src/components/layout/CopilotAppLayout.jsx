import React, { useState, useCallback } from 'react';
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
import { COPILOT_VIEWS } from '@/lib/copilotViews';
import { crossFade } from '@/lib/motionPresets';
import AnchorCopilotSidebar from '@/components/dashboard/copilot/AnchorCopilotSidebar';
import AccountDetailDrawer from '@/components/dashboard/copilot/AccountDetailDrawer';
import CopilotToolView from '@/components/dashboard/copilot/tools/CopilotToolView';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';
import TheSwipe from '@/components/transactions/TheSwipe';
import { CopilotNavProvider, useCopilotNav } from './CopilotNavContext';
import '@/components/dashboard/copilot/anchorCopilot.css';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function CopilotShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, closeSidebar, activeView } = useCopilotNav();
  const { user } = useAuth();
  const { profile, updateProfile } = useFinancialProfile();
  const { transactions = [] } = useTransactions({ personalOnly: true, limit: 500 });
  const { isAlexMode: isAlex } = useDemoMode();
  const queryClient = useQueryClient();
  const { createTransaction } = useOptimisticTransactions();

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [swipeOpen, setSwipeOpen] = useState(false);

  const displayUser = isAlex ? { full_name: 'Alex Lindqvist' } : user;
  const showToolView = activeView !== COPILOT_VIEWS.home;

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
    if (location.pathname.split('/').pop() !== 'Dashboard') {
      navigate(createPageUrl('Dashboard'));
    }
  }, [location.pathname, navigate]);

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
        <AnimatePresence mode="wait">
          {showToolView ? (
            <motion.div key={activeView} {...crossFade} className="min-h-full">
              <CopilotToolView
                view={activeView}
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
