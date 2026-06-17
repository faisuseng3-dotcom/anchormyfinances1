// @ts-nocheck
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Mic } from 'lucide-react';
import VoiceAssistant from '@/components/layout/VoiceAssistant';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import ProfileSwitcher from '@/components/ProfileSwitcher';
import ImpulseTrigger from '@/components/ImpulseTrigger';
import GuestBanner from '@/components/GuestBanner';
import { isGuestMode } from '@/components/guestStorage';
import { useAuth } from '@/lib/AuthContext';
import ActionMenu from '@/components/layout/ActionMenu';
import PlanQuickAddSheet from '@/components/planner/PlanQuickAddSheet';
import PushNotificationManager from '@/components/layout/PushNotificationManager';
import { useModeContext } from '@/components/modes/ModeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { isEmbeddedApp } from '@/lib/embedLayout';
import { cn } from '@/lib/utils';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import PaymentFailedBanner from '@/components/billing/PaymentFailedBanner';
import AppShellLayout from '@/components/layout/AppShellLayout';
import { SHELL_PAGES } from '@/lib/appNav';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [planSheetOpen, setPlanSheetOpen] = useState(false);
  const { isBusiness } = useModeContext();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const embedded = isEmbeddedApp();

  const hideChrome = !isLoadingAuth && !isAuthenticated && !isGuestMode();
  const useAppShell = !hideChrome && SHELL_PAGES.has(currentPageName);

  React.useEffect(() => {
    const businessOnlyPages = new Set(['BusinessDashboard']);
    if (!hideChrome && isBusiness && currentPageName === 'Dashboard') {
      navigate('/BusinessDashboard', { replace: true });
    } else if (!hideChrome && !isBusiness && businessOnlyPages.has(currentPageName)) {
      navigate(createPageUrl('Dashboard'), { replace: true });
    }
  }, [isBusiness, currentPageName, hideChrome, navigate]);

  React.useEffect(() => {
    const openPlan = () => setPlanSheetOpen(true);
    window.addEventListener('anchor:open-plan', openPlan);
    return () => window.removeEventListener('anchor:open-plan', openPlan);
  }, []);

  React.useEffect(() => {
    const openVoice = () => setVoiceOpen(true);
    window.addEventListener('anchor:open-voice', openVoice);
    return () => window.removeEventListener('anchor:open-voice', openVoice);
  }, []);

  const handleAction = (actionId) => {
    if (actionId === 'plan') {
      setPlanSheetOpen(true);
      return;
    }
    const onDashboard =
      location.pathname === '/' || location.pathname === createPageUrl('Dashboard');
    if (!onDashboard) {
      navigate(createPageUrl('Dashboard'), { state: { anchorAction: actionId } });
      return;
    }
    window.dispatchEvent(new CustomEvent('anchor:action', { detail: { action: actionId } }));
  };

  const content = useAppShell ? (
    <AppShellLayout>{children}</AppShellLayout>
  ) : (
    <main className="anchor-app-main">
      {children}
    </main>
  );

  return (
    <div className="anchor-app anchor-page anchor-app-shell h-full max-h-full">
      <ProfileSwitcher />
      <ImpulseTrigger />
      {isGuestMode() && !hideChrome && <GuestBanner />}
      {!hideChrome && <PaymentFailedBanner />}
      {content}

      {!hideChrome && (
        <>
          <AnchorPressable
            onClick={() => setVoiceOpen(true)}
            className={cn(
              'rounded-full border border-white/12 bg-[var(--color-surface)] anchor-elev-2',
              embedded ? 'anchor-voice-fab' : 'fixed z-40 right-4 sm:right-6',
              !embedded && !isMobile && 'bottom-6',
            )}
            style={
              !embedded && isMobile
                ? { bottom: '1.5rem' }
                : undefined
            }
            aria-label="Öppna röstassistent"
          >
            <Mic className="w-5 h-5 text-[var(--color-text-primary)]" />
          </AnchorPressable>
          <VoiceAssistant isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
        </>
      )}

      {!hideChrome && <PWAInstallPrompt />}
      {!hideChrome && <PushNotificationManager />}

      {!hideChrome && (
        <ActionMenu
          isOpen={actionMenuOpen}
          onClose={() => setActionMenuOpen(false)}
          onAction={handleAction}
        />
      )}

      {!hideChrome && (
        <PlanQuickAddSheet
          isOpen={planSheetOpen}
          onClose={() => setPlanSheetOpen(false)}
        />
      )}
    </div>
  );
}
