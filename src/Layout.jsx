import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, ShoppingBag, TrendingUp, Settings, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import VoiceAssistant from '@/components/voice/VoiceAssistant';

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
      <style>{`
        :root {
          --color-primary: #6366f1;
          --color-primary-dark: #4f46e5;
          --color-accent: #10b981;
          --color-bg-dark: #0a0e1a;
          --color-bg-card: #111827;
          --color-bg-elevated: #1f2937;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          background: linear-gradient(135deg, #0a0e1a 0%, #111827 100%);
        }
        
        @media (max-width: 640px) {
          .mobile-safe-area {
            padding-bottom: env(safe-area-inset-bottom, 20px);
          }
        }

        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.5); }
        }

        .glass-effect {
          background: rgba(31, 41, 55, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
      
      <main className={!hideNav ? 'pb-20' : ''}>
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