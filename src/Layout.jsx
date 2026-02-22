import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, ShoppingBag, TrendingUp, Settings, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import VoiceAssistant from '@/components/voice/VoiceAssistant';

const navItems = [
  { icon: Home, label: 'Hem', page: 'Dashboard' },
  { icon: ShoppingBag, label: 'Köp', page: 'PurchaseSimulator' },
  { icon: TrendingUp, label: 'Optimera', page: 'Optimize' },
  { icon: Settings, label: 'Inställningar', page: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [voiceOpen, setVoiceOpen] = useState(false);
  
  // Hide nav on onboarding
  const hideNav = currentPageName === 'Onboarding';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <style>{`
        :root {
          --color-primary: #10b981;
          --color-primary-dark: #059669;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        
        @media (max-width: 640px) {
          .mobile-safe-area {
            padding-bottom: env(safe-area-inset-bottom, 20px);
          }
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
            onClick={() => setVoiceOpen(true)}
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg flex items-center justify-center z-40"
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
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 mobile-safe-area z-50">
          <div className="flex items-center justify-around py-2 max-w-md mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                    isActive 
                      ? 'text-emerald-600' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}