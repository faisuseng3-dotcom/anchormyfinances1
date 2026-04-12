import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, TrendingUp, Settings, Mic, ClipboardList, Activity, Plus, PlusCircle, ArrowLeftRight, PiggyBank } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import ProfileSwitcher from '@/components/ProfileSwitcher';
import ImpulseTrigger from '@/components/ImpulseTrigger';
import GuestBanner from '@/components/GuestBanner';
import { isGuestMode } from '@/components/guestStorage';
import { useAuth } from '@/lib/AuthContext';
import ActionMenu from '@/components/nav/ActionMenu';
import PushNotificationManager from '@/components/notifications/PushNotificationManager';
import ModeSwitch from '@/components/modes/ModeSwitch';
import { useModeContext } from '@/components/modes/ModeContext';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { icon: Home, page: 'Dashboard' },
  { icon: Activity, page: 'Pulse' },
  null, // placeholder for center FAB
  { icon: ClipboardList, page: 'TransactionHistory' },
  { icon: Settings, page: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const { isBusiness, toggleMode } = useModeContext();
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const hideNav = currentPageName === 'Onboarding' || (!isLoadingAuth && !isAuthenticated);

  // Route to business or personal dashboard based on mode
  React.useEffect(() => {
    if (!hideNav && isBusiness && currentPageName === 'Dashboard') {
      navigate('/BusinessDashboard', { replace: true });
    } else if (!hideNav && !isBusiness && currentPageName === 'BusinessDashboard') {
      navigate('/', { replace: true });
    }
  }, [isBusiness]);

  const handleAction = (actionId) => {
    // Dispatch a custom event that Dashboard listens to
    window.dispatchEvent(new CustomEvent('anchor:action', { detail: { action: actionId } }));
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background-primary)' }}>
      <ProfileSwitcher />
      <ImpulseTrigger />
      {isGuestMode() && !hideNav && <GuestBanner />}
      <style>{`
        :root {
          /* Premium Teal — Starling/Revolut inspiration */
          --color-background-primary: #F4F6F8;
          --color-background-secondary: #ECEEF1;
          --color-surface: #FFFFFF;
          --color-card: #FFFFFF;
          
          /* Accent — Starling teal */
          --color-accent: #0D7377;
          --color-accent-hover: #0a5f63;
          
          /* Text */
          --color-text-primary: #1A2332;
          --color-text-secondary: #4A5568;
          --color-text-muted: #8896A5;
          
          /* Status */
          --color-success: #0D7377;
          --color-danger: #E53E3E;
          --color-warning: #D69E2E;
          
          /* Effects — subtila skuggor, ingen glow */
          --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.15);
          --shadow-md: 0 4px 8px -1px rgb(0 0 0 / 0.25);
          --shadow-lg: 0 8px 16px -3px rgb(0 0 0 / 0.3);
          --shadow-xl: 0 16px 24px -5px rgb(0 0 0 / 0.35);
          
          /* Borders */
          --border-radius-sm: 12px;
          --border-radius-md: 16px;
          --border-radius-lg: 24px;
          
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
          background: var(--color-background-primary);
          color: var(--color-text-primary);
          min-height: 100vh;
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
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        
        /* Card Effect */
        .dark-card {
          background: var(--color-card);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--border-radius-md);
          transition: all var(--transition-base);
        }
        
        .dark-card:hover {
          border-color: rgba(255, 255, 255, 0.10);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
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
          border-color: var(--color-accent) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
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
        className={!hideNav ? 'overflow-y-auto' : ''}
        style={!hideNav ? { paddingBottom: 'max(5rem, calc(env(safe-area-inset-bottom) + 5rem))' } : {}}
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
            className="fixed bottom-24 right-6 w-12 h-12 rounded-full flex items-center justify-center z-40 border border-white/12 hover:border-white/20 transition-colors"
            style={{ background: 'var(--color-surface)' }}
          >
            <Mic className="w-6 h-6 text-white" />
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

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 mobile-safe-area z-50 border-t border-white/6" style={{ background: 'var(--color-background-secondary)' }}>
          <div className="flex items-center justify-around py-3 max-w-md mx-auto px-4">
            {navItems.map((item, idx) => {
              // Center FAB
              if (item === null) {
                return (
                  <motion.button
                    key="fab"
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setActionMenuOpen(v => !v)}
                    className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg -mt-5"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    <motion.div animate={{ rotate: actionMenuOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                      <Plus className="w-6 h-6 text-white" />
                    </motion.div>
                  </motion.button>
                );
              }

              const Icon = item.icon;
              const isActive = currentPageName === item.page;

              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className="relative flex items-center justify-center w-12 h-12"
                >
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className="flex items-center justify-center w-10 h-10 rounded-full transition-all"
                    style={{ background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{
                        color: isActive ? '#fff' : 'var(--color-text-muted)',
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