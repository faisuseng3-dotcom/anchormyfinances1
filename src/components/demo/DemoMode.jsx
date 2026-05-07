import React, { createContext, useContext, useState, useEffect } from 'react';
import { ALEX_PROFILE, ALEX_TRANSACTIONS, isAlexMode, toggleAlexMode, registerAlexModeShortcut } from '@/lib/alexMode';

const DemoContext = createContext(null);

// ── Gammalt demo-dataset (behålls för bakåtkompatibilitet) ──
export const DEMO_PROFILE = {
  income: 42000,
  housingCost: 9500,
  buffer: 38000,
  savingsGoal: 45000,
  savingsGoalName: 'Resa till Japan',
  savingsCurrentBalance: 12400,
  onboardingCompleted: true,
  userGoals: ['save', 'control'],
  primaryGoal: 'save',
  mode: 'smart',
  fixedCostItems: [
    { id: '1', label: 'Hyra', amount: 9500 },
    { id: '2', label: 'El & Internet', amount: 850 },
    { id: '3', label: 'Gym', amount: 399 },
    { id: '4', label: 'Spotify', amount: 129 },
    { id: '5', label: 'Netflix', amount: 169 },
  ],
  subscriptions: [
    { name: 'Spotify', amount: 129, category: 'streaming' },
    { name: 'Netflix', amount: 169, category: 'streaming' },
    { name: 'iCloud+', amount: 29, category: 'other' },
  ],
  loans: [{ name: 'Studielån', totalAmount: 120000, interestRate: 0.7, monthlyPayment: 1800 }],
  monthlyExpenses: [
    { name: 'ICA', amount: 1200, date: '2026-04-15', category: 'food' },
    { name: 'SL Biljett', amount: 890, date: '2026-04-14', category: 'transport' },
    { name: 'Bar & Restaurang', amount: 680, date: '2026-04-12', category: 'entertainment' },
  ],
  totalXP: 1340,
  level: 4,
  dailyLoginStreak: 7,
  unlockedBadges: ['first_login', 'budget_beginner', 'streak_3'],
};

export const DEMO_TRANSACTIONS = [
  { id: 'd1', label: 'ICA Maxi', amount: -890, category: 'food', type: 'expense', created_date: '2026-04-15' },
  { id: 'd2', label: 'Lön April', amount: 42000, category: 'income', type: 'income', created_date: '2026-04-25' },
  { id: 'd3', label: 'SL Månadskort', amount: -890, category: 'transport', type: 'expense', created_date: '2026-04-01' },
  { id: 'd4', label: 'Restaurang K25', amount: -345, category: 'entertainment', type: 'expense', created_date: '2026-04-13' },
  { id: 'd5', label: 'Apoteket', amount: -189, category: 'health', type: 'expense', created_date: '2026-04-10' },
  { id: 'd6', label: 'H&M', amount: -499, category: 'shopping', type: 'expense', created_date: '2026-04-08' },
  { id: 'd7', label: 'Transferring till sparande', amount: -2000, category: 'savings', type: 'savings_deposit', created_date: '2026-04-05' },
  { id: 'd8', label: 'Pressbyrån', amount: -49, category: 'food', type: 'expense', created_date: '2026-04-04' },
  { id: 'd9', label: 'Spotify', amount: -129, category: 'entertainment', type: 'expense', created_date: '2026-04-01' },
  { id: 'd10', label: 'Steam', amount: -249, category: 'entertainment', type: 'expense', created_date: '2026-04-09' },
];

export function DemoProvider({ children }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isAlex, setIsAlex] = useState(() => isAlexMode());

  // Lyssna på Alex Mode-events (dispatcha från tangentbordsgenväg)
  useEffect(() => {
    const handler = (e) => setIsAlex(e.detail.active);
    window.addEventListener('anchor:alex_mode', handler);

    // Registrera Cmd+§ genväg globalt
    const cleanup = registerAlexModeShortcut(() => {
      toggleAlexMode();
    });

    return () => {
      window.removeEventListener('anchor:alex_mode', handler);
      cleanup();
    };
  }, []);

  const toggleDemo = () => setIsDemoMode(v => !v);

  // Alex Mode åsidosätter vanlig demo
  const activeProfile = isAlex ? ALEX_PROFILE : (isDemoMode ? DEMO_PROFILE : null);
  const activeTransactions = isAlex ? ALEX_TRANSACTIONS : (isDemoMode ? DEMO_TRANSACTIONS : null);

  return (
    <DemoContext.Provider value={{
      isDemoMode: isDemoMode || isAlex,
      isAlexMode: isAlex,
      toggleDemo,
      demoProfile: activeProfile || DEMO_PROFILE,
      demoTransactions: activeTransactions || DEMO_TRANSACTIONS,
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemoMode must be used inside DemoProvider');
  return ctx;
}