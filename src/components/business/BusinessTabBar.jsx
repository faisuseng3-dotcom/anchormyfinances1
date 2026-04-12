import React from 'react';
import { motion } from 'framer-motion';
import { Home, Receipt, BarChart3, Archive, User } from 'lucide-react';

const TABS = [
  { id: 'home', label: 'Hem', icon: Home },
  { id: 'skatt', label: 'Skatt & Moms', icon: Receipt },
  { id: 'rapporter', label: 'Rapporter', icon: BarChart3 },
  { id: 'arkiv', label: 'Arkiv', icon: Archive },
  { id: 'profil', label: 'Profil', icon: User },
];

export default function BusinessTabBar({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid rgba(0,0,0,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}>
      <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-md mx-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 px-2 py-1 rounded-2xl relative"
              style={{ minWidth: 56 }}
            >
              {isActive && (
                <motion.div layoutId="tab-pill"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'rgba(13,115,119,0.08)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <Icon
                className="w-5 h-5 relative z-10"
                style={{
                  color: isActive ? '#0D7377' : '#9AA5B4',
                  strokeWidth: isActive ? 2.2 : 1.6,
                }}
              />
              <span className="text-[10px] font-semibold relative z-10 leading-tight text-center"
                style={{ color: isActive ? '#0D7377' : '#9AA5B4' }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}