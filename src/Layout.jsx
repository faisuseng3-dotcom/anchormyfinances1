import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, ShoppingBag, TrendingUp, Settings, Mic, ClipboardList, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import ProfileSwitcher from '@/components/ProfileSwitcher';
import ImpulseTrigger from '@/components/ImpulseTrigger';
import GuestBanner from '@/components/GuestBanner';
import { isGuestMode } from '@/components/guestStorage';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
  { icon: Home, label: 'Hem', page: 'Dashboard' },
  { icon: Activity, label: 'Pulse', page: 'Pulse' },
  { icon: ClipboardList, label: 'Historik', page: 'TransactionHistory' },
  { icon: TrendingUp, label: 'Utgifter', page: 'Expenses' },
  { icon: Settings, label: 'Inställningar', page: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [voiceOpen, setVoiceOpen] = useState(false);
  
  const { isAuthenticated, isLoadingAuth } = useAuth();
  // Hide nav on onboarding or when not authenticated
  const hideNav = currentPageName === 'Onboarding' || (!isLoadingAuth && !isAuthenticated);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background-primary)' }}>
      <ProfileSwitcher />
      <ImpulseTrigger />
      {isGuestMode() && !hideNav && <GuestBanner />}
      <style>{`
        :root {
          /* Primary Colors — mörkblå istället för svart */
          --color-background-primary: #0F1724;
          --color-background-secondary: #141E2E;
          --color-surface: #1C2B3F;
          --color-card: #1E2D42;
          
          /* Accent — dämpat stålblått, inte neon */
          --color-accent: #4B7CF3;
          --color-accent-hover: #3A6ADE;
          
          /* Text */
          --color-text-primary: #EDF0F5;
          --color-text-secondary: #8B97A8;
          --color-text-muted: #5C6B7D;
          
          /* Status — naturligare toner */
          --color-success: #3DAA7A;
          --color-danger: #D95F5F;
          --color-warning: #C8923A;
          
          /* Effects — subtila skuggor, ingen glow */
          --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.15);
          --shadow-md: 0 4px 8px -1px rgb(0 0 0 / 0.25);
          --shadow-lg: 0 8px 16px -3px rgb(0 0 0 / 0.3);
          --shadow-xl: 0 16px 24px -5px rgb(0 0 0 / 0.35);
          
          /* Borders */
          --border-radius-sm: 10px;
          --border-radius-md: 14px;
          --border-radius-lg: 18px;
          
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

        /* Glass Effect — mjukare, mindre blur-intensiv */
        .glass-effect {
          background: rgba(28, 43, 63, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.07);
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

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 mobile-safe-area z-50 border-t border-white/6" style={{ background: 'var(--color-background-secondary)' }}>
          <div className="flex items-center justify-around py-2 max-w-md mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className="relative"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                      isActive 
                        ? 'text-white' 
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                    <span className="text-xs font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
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