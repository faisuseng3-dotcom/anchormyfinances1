import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, ShoppingBag, TrendingUp, Settings, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import ProfileSwitcher from '@/components/ProfileSwitcher';
import ImpulseTrigger from '@/components/ImpulseTrigger';
import GuestBanner from '@/components/GuestBanner';
import { isGuestMode } from '@/components/guestStorage';

const navItems = [
  { icon: Home, label: 'Hem', page: 'Dashboard' },
  { icon: ShoppingBag, label: 'Köp', page: 'PurchaseSimulator' },
  { icon: TrendingUp, label: 'Utgifter', page: 'Expenses' },
  { icon: Settings, label: 'Inställningar', page: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [voiceOpen, setVoiceOpen] = useState(false);
  
  // Hide nav on onboarding
  const hideNav = currentPageName === 'Onboarding';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#111827] to-[#0a0e1a]">
      <ProfileSwitcher />
      <ImpulseTrigger />
      {isGuestMode() && !hideNav && <GuestBanner />}
      <style>{`
        :root {
          /* Primary Colors */
          --color-background-primary: #0B0F1A;
          --color-background-secondary: #111827;
          --color-surface: #1A2233;
          --color-card: #1F2937;
          
          /* Accent */
          --color-accent: #3B82F6;
          --color-accent-hover: #2563EB;
          
          /* Text */
          --color-text-primary: #F3F4F6;
          --color-text-secondary: #9CA3AF;
          --color-text-muted: #6B7280;
          
          /* Status */
          --color-success: #10B981;
          --color-danger: #EF4444;
          --color-warning: #F59E0B;
          
          /* Effects */
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.2);
          --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3);
          --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.4);
          
          /* Borders */
          --border-radius-sm: 12px;
          --border-radius-md: 16px;
          --border-radius-lg: 20px;
          
          /* Transitions */
          --transition-fast: 150ms ease-out;
          --transition-base: 250ms ease-in-out;
          --transition-slow: 350ms ease-in-out;
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
          background: linear-gradient(135deg, var(--color-background-primary) 0%, var(--color-background-secondary) 100%);
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

        /* Glass Effect */
        .glass-effect {
          background: rgba(31, 41, 55, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Card Effect */
        .dark-card {
          background: var(--color-card);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--border-radius-md);
          transition: all var(--transition-base);
        }
        
        .dark-card:hover {
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
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
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50 flex items-center justify-center z-40"
            style={{ animation: 'pulse-glow 2s infinite' }}
          >
            <Mic className="w-6 h-6 text-white" />
          </motion.button>

          <VoiceAssistant 
            isOpen={voiceOpen} 
            onClose={() => setVoiceOpen(false)} 
          />
        </>
      )}

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 glass-effect mobile-safe-area z-50">
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
                        ? 'text-indigo-400' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                    <span className="text-xs font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
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