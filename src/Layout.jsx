// @ts-nocheck
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Mic, Plus } from 'lucide-react';
import { CORE_VIEWS } from '@/lib/appStructure';
import { prefetchRoute } from '@/lib/prefetchHub';
import { motion } from 'framer-motion';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import ProfileSwitcher from '@/components/ProfileSwitcher';
import ImpulseTrigger from '@/components/ImpulseTrigger';
import GuestBanner from '@/components/GuestBanner';
import { isGuestMode } from '@/components/guestStorage';
import { useAuth } from '@/lib/AuthContext';
import ActionMenu from '@/components/nav/ActionMenu';
import PlanQuickAddSheet from '@/components/plan/PlanQuickAddSheet';
import PushNotificationManager from '@/components/notifications/PushNotificationManager';
import { useModeContext } from '@/components/modes/ModeContext';
import { useNavigate } from 'react-router-dom';
import { isAlexMode } from '@/lib/alexMode';
import { useIsMobile } from '@/hooks/use-mobile';
import { isEmbeddedApp } from '@/lib/embedLayout';
import { cn } from '@/lib/utils';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import PageTransition from '@/components/ui-premium/PageTransition';
import CopilotAppLayout from '@/components/layout/CopilotAppLayout';

/** 5 kärnflikar + FAB — Jämför och socialt ligger under Inställningar. */
const navItems = [
  CORE_VIEWS[0],
  CORE_VIEWS[1],
  null,
  CORE_VIEWS[2],
  CORE_VIEWS[3],
  CORE_VIEWS[4],
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [planSheetOpen, setPlanSheetOpen] = useState(false);
  const { isBusiness } = useModeContext();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [alexActive, setAlexActive] = React.useState(() => isAlexMode());
  const embedded = isEmbeddedApp();
  const hideNav = currentPageName === 'Onboarding' || (!isLoadingAuth && !isAuthenticated) || isBusiness;
  const copilotHomePages = new Set(['Dashboard', 'Subscriptions']);
  const useCopilotShell = !hideNav && !isBusiness && (!embedded || copilotHomePages.has(currentPageName));

  // Lyssna på Alex Mode-event för att dölja business-element
  React.useEffect(() => {
    const handler = (e) => setAlexActive(e.detail.active);
    window.addEventListener('anchor:alex_mode', handler);
    return () => window.removeEventListener('anchor:alex_mode', handler);
  }, []);

  // Separata instanser — personal når inte business-vyer utan utloggning + ny inloggning
  React.useEffect(() => {
    const businessOnlyPages = new Set(['BusinessDashboard']);
    if (!hideNav && isBusiness && currentPageName === 'Dashboard') {
      navigate('/BusinessDashboard', { replace: true });
    } else if (!hideNav && !isBusiness && businessOnlyPages.has(currentPageName)) {
      navigate(createPageUrl('Dashboard'), { replace: true });
    }
  }, [isBusiness, currentPageName, hideNav, navigate]);

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

  return (
    <div
      className={cn(
        'anchor-app anchor-page',
        embedded ? 'anchor-app-shell h-full max-h-full' : 'min-h-screen',
      )}
    >
      <ProfileSwitcher />
      <ImpulseTrigger />
      {isGuestMode() && !hideNav && <GuestBanner />}
      {useCopilotShell ? (
        <CopilotAppLayout>
          <div className="overflow-y-auto overflow-x-hidden min-h-screen">
            <PageTransition>{children}</PageTransition>
          </div>
        </CopilotAppLayout>
      ) : (
        <main
          className={cn(
            embedded ? 'anchor-app-main' : !hideNav ? 'overflow-y-auto overflow-x-hidden' : 'overflow-x-hidden',
          )}
          style={
            !embedded && !hideNav ? { paddingBottom: 'var(--anchor-page-pad-bottom)' } : {}
          }
        >
          <PageTransition>{children}</PageTransition>
        </main>
      )}



      {/* Voice Assistant */}
      {!hideNav && (
        <>
          <AnchorPressable
            onClick={() => setVoiceOpen(true)}
            className={cn(
              'rounded-full border border-white/12 bg-[var(--color-surface)] anchor-elev-2',
              embedded ? 'anchor-voice-fab' : 'fixed z-40 right-4 sm:right-6',
              !embedded && !isMobile && (useCopilotShell ? 'bottom-6' : 'bottom-24'),
            )}
            style={
              !embedded && isMobile
                ? { bottom: useCopilotShell ? '1.5rem' : 'var(--anchor-voice-fab-bottom)' }
                : undefined
            }
            aria-label="Öppna röstassistent"
          >
            <Mic className="w-5 h-5 text-[var(--color-text-primary)]" />
          </AnchorPressable>
          <VoiceAssistant
            isOpen={voiceOpen}
            onClose={() => setVoiceOpen(false)}
          />
        </>
      )}

      {/* PWA Install Prompt */}
      {!hideNav && <PWAInstallPrompt />}

      {/* Push Notification Manager */}
      {!hideNav && <PushNotificationManager />}

      {/* Action Menu */}
      {!hideNav && (
        <ActionMenu
          isOpen={actionMenuOpen}
          onClose={() => setActionMenuOpen(false)}
          onAction={handleAction}
        />
      )}

      {!hideNav && (
        <PlanQuickAddSheet
          isOpen={planSheetOpen}
          onClose={() => setPlanSheetOpen(false)}
        />
      )}

      {/* Bottom Navigation — ersatt av Copilot-sidebar */}
      {!hideNav && !useCopilotShell && (
        <nav
          className={cn(
            'anchor-bottom-nav left-0 right-0 mobile-safe-area border-t border-white/10',
            embedded ? 'relative w-full' : 'fixed bottom-0 z-50',
          )}
        >
          <div className="flex items-center justify-between py-2 max-w-lg mx-auto px-2 sm:px-3">
            {navItems.map((item) => {
              if (item === null || item === undefined) {
                return (
                  <AnchorPressable
                    key="fab"
                    onClick={() => setActionMenuOpen((v) => !v)}
                    className="anchor-nav-fab"
                    aria-label="Snabbåtgärder"
                  >
                    <motion.div animate={{ rotate: actionMenuOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                      <Plus className="w-6 h-6" />
                    </motion.div>
                  </AnchorPressable>
                );
              }

              const Icon = item.icon;
              const isActive = currentPageName === item.page;

              const prefetchKey =
                item.page === 'FuturePulse' ? 'FuturePulse'
                  : item.page === 'TransactionHistory' ? 'TransactionHistory'
                    : item.page === 'ProTools' ? 'ProTools'
                      : null;

              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={cn('anchor-nav-item', isActive && 'anchor-nav-item--active')}
                  aria-label={item.label || item.page}
                  onMouseEnter={() => prefetchKey && prefetchRoute(prefetchKey)}
                  onFocus={() => prefetchKey && prefetchRoute(prefetchKey)}
                  onTouchStart={() => prefetchKey && prefetchRoute(prefetchKey)}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      strokeWidth: isActive ? 2.5 : 1.8,
                    }}
                  />
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}