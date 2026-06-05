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
  const { isBusiness, toggleMode } = useModeContext();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [alexActive, setAlexActive] = React.useState(() => isAlexMode());
  const hideNav = currentPageName === 'Onboarding' || (!isLoadingAuth && !isAuthenticated) || isBusiness;
  const embedded = isEmbeddedApp();

  // Lyssna på Alex Mode-event för att dölja business-element
  React.useEffect(() => {
    const handler = (e) => setAlexActive(e.detail.active);
    window.addEventListener('anchor:alex_mode', handler);
    return () => window.removeEventListener('anchor:alex_mode', handler);
  }, []);

  // Route to business or personal dashboard based on mode
  React.useEffect(() => {
    if (!hideNav && isBusiness && currentPageName === 'Dashboard') {
      navigate('/BusinessDashboard', { replace: true });
    } else if (!hideNav && !isBusiness && currentPageName === 'BusinessDashboard') {
      navigate('/', { replace: true });
    }
  }, [isBusiness]);

  React.useEffect(() => {
    const openPlan = () => setPlanSheetOpen(true);
    window.addEventListener('anchor:open-plan', openPlan);
    return () => window.removeEventListener('anchor:open-plan', openPlan);
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
      <style>{`
        :root {
          --anchor-nav-height: 5.5rem;
          --anchor-safe-top: env(safe-area-inset-top, 0px);
          --anchor-safe-bottom: env(safe-area-inset-bottom, 0px);
          --anchor-page-pad-bottom: calc(var(--anchor-nav-height) + var(--anchor-safe-bottom) + 1.25rem);
          --anchor-dashboard-pad-bottom: calc(var(--anchor-nav-height) + var(--anchor-safe-bottom) + 6.5rem);
          --anchor-voice-fab-bottom: calc(var(--anchor-nav-height) + var(--anchor-safe-bottom) + 0.65rem);
          --anchor-flow-btn-bottom: calc(var(--anchor-nav-height) + var(--anchor-safe-bottom) + 4.25rem);
          /* Anchor Revolut — global tokens */
          --anchor-page-gradient: linear-gradient(165deg, #1a3dff 0%, #0f2a9e 28%, #081858 55%, #050d28 82%, #030610 100%);
          --color-background-primary: #040814;
          --color-background-secondary: rgba(8, 14, 30, 0.88);
          --color-surface: rgba(255, 255, 255, 0.08);
          --color-card: rgba(255, 255, 255, 0.06);
          
          --color-accent: #7FA0FF;
          --color-accent-hover: #5B7CFA;
          
          --color-text-primary: #ffffff;
          --color-text-secondary: rgba(255, 255, 255, 0.78);
          --color-text-muted: rgba(255, 255, 255, 0.45);
          
          --color-success: #9AE6B4;
          --color-danger: #FCA5A5;
          --color-warning: #FCD34D;
          
          /* Effects — subtila skuggor, ingen glow */
          --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.15);
          --shadow-md: 0 4px 8px -1px rgb(0 0 0 / 0.25);
          --shadow-lg: 0 8px 16px -3px rgb(0 0 0 / 0.3);
          --shadow-xl: 0 16px 24px -5px rgb(0 0 0 / 0.35);
          
          /* Borders */
          --border-radius-sm: 14px;
          --border-radius-md: 20px;
          --border-radius-lg: 28px;
          
          /* Transitions */
          --transition-fast: 150ms ease-out;
          --transition-base: 220ms ease-in-out;
          --transition-slow: 320ms ease-in-out;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: var(--anchor-page-gradient);
          color: var(--color-text-primary);
          min-height: 100vh;
          min-height: 100dvh;
        }

        .anchor-app {
          background: var(--anchor-page-gradient);
          color: var(--color-text-primary);
        }

        html, body, #root {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        img, video, svg, canvas {
          max-width: 100%;
          height: auto;
        }

        button, a, input, select, textarea {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        input, select, textarea {
          font-size: 16px;
        }
        
        /* Business mode — light premium */
        [data-mode='business'] body,
        [data-mode='business'] {
          background: #F4F6F8;
          color: #1A2332;
        }
        [data-mode='business'] .dark-card {
          background: #FFFFFF;
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        [data-mode='business'] .dark-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.10);
        }
        [data-mode='business'] input, [data-mode='business'] select, [data-mode='business'] textarea {
          background: #F8FAFB !important;
          border: 1px solid #DDE1E7 !important;
          color: #1A2332 !important;
        }
        [data-mode='business'] input::placeholder, [data-mode='business'] textarea::placeholder {
          color: #9AA5B4 !important;
        }
        
        #root {
          min-height: 100vh;
          min-height: 100dvh;
        }

        html.anchor-embedded #root,
        html.anchor-embedded body {
          min-height: 0;
          height: 100%;
        }
        
        @media (max-width: 640px) {
          .mobile-safe-area {
            padding-bottom: env(safe-area-inset-bottom, 20px);
          }
        }

        /* Animations */
        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        /* Glass Effect */
        .glass-effect {
          background: linear-gradient(165deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 38%, rgba(6,14,32,0.78) 100%);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 22px 48px rgba(2, 8, 26, 0.35), inset 0 1px 0 rgba(255,255,255,0.08);
          border-radius: var(--border-radius-lg);
        }
        
        /* Card Effect — same as anchor-glass-card */
        .dark-card {
          background: linear-gradient(165deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 38%, rgba(6,14,32,0.78) 100%);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: var(--border-radius-lg);
          box-shadow: 0 22px 48px rgba(2, 8, 26, 0.35), inset 0 1px 0 rgba(255,255,255,0.08);
          transition: border-color var(--transition-base), box-shadow var(--transition-base);
        }
        
        .dark-card:hover {
          border-color: rgba(255, 255, 255, 0.20);
          box-shadow: 0 24px 52px rgba(2, 8, 26, 0.45), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        
        /* Input Styling */
        input, textarea, select {
          background: var(--color-surface) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--color-text-primary) !important;
          transition: all var(--transition-fast) !important;
        }
        
        input:focus, textarea:focus, select:focus {
          outline: none !important;
          border-color: rgba(255, 255, 255, 0.28) !important;
          box-shadow: 0 0 0 2px rgba(127, 160, 255, 0.15) !important;
        }
        
        input::placeholder, textarea::placeholder {
          color: var(--color-text-muted) !important;
        }
        
        /* Button Styling */
        button {
          transition: all var(--transition-fast) !important;
        }
        
        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: var(--color-background-secondary);
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--color-surface);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: var(--color-card);
        }
        
        /* Skeleton Loading */
        .skeleton {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
        
        /* Selection */
        ::selection {
          background: rgba(59, 130, 246, 0.3);
          color: var(--color-text-primary);
        }
      `}</style>
      
      <main
        className={cn(
          embedded ? 'anchor-app-main' : !hideNav ? 'overflow-y-auto overflow-x-hidden' : 'overflow-x-hidden',
        )}
        style={
          !embedded && !hideNav
            ? { paddingBottom: 'var(--anchor-page-pad-bottom)' }
            : {}
        }
      >
        {children}
      </main>



      {/* Voice Assistant */}
      {!hideNav && (
        <>
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setVoiceOpen(true)}
            className={cn(
              'rounded-full flex items-center justify-center w-12 h-12 border border-white/12 hover:border-white/20 transition-colors',
              embedded ? 'anchor-voice-fab' : 'fixed z-40 right-4 sm:right-6',
              !embedded && !isMobile && 'bottom-24',
            )}
            style={{
              background: 'var(--color-surface)',
              ...(!embedded && isMobile ? { bottom: 'var(--anchor-voice-fab-bottom)' } : {}),
            }}
            aria-label="Open voice assistant"
          >
            <Mic className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
          </motion.button>
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

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav
          className={cn(
            'anchor-bottom-nav left-0 right-0 mobile-safe-area border-t border-white/10 backdrop-blur-xl',
            embedded ? 'relative w-full' : 'fixed bottom-0 z-50',
          )}
          style={{ background: 'rgba(6, 14, 32, 0.82)' }}
        >
          <div className="flex items-center justify-between py-2 max-w-lg mx-auto px-2 sm:px-3">
            {navItems.map((item, idx) => {
              // Center FAB
              if (item === null || item === undefined) {
                return (
                  <motion.button
                    key="fab"
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setActionMenuOpen(v => !v)}
                    className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-[0_12px_28px_rgba(0,0,0,0.35)] -mt-5 bg-white text-slate-900"
                    aria-label="Open quick actions"
                  >
                    <motion.div animate={{ rotate: actionMenuOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                      <Plus className="w-6 h-6 text-slate-900" />
                    </motion.div>
                  </motion.button>
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
                  className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11"
                  aria-label={item.label || item.page}
                  onMouseEnter={() => prefetchKey && prefetchRoute(prefetchKey)}
                  onFocus={() => prefetchKey && prefetchRoute(prefetchKey)}
                  onTouchStart={() => prefetchKey && prefetchRoute(prefetchKey)}
                >
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all"
                    style={{ background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{
                        color: isActive ? '#ffffff' : 'var(--color-text-muted)',
                        strokeWidth: isActive ? 2.5 : 1.8,
                      }}
                    />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}