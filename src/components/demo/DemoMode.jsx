import React, { createContext, useContext, useState, useEffect } from 'react';
import { ALEX_PROFILE, ALEX_TRANSACTIONS } from '@/lib/alexDemoData';
import { isAlexMode, toggleAlexMode, registerAlexModeShortcut } from '@/lib/alexMode';
import { queryClientInstance } from '@/lib/query-client';

const DemoContext = createContext(null);

// ── Gammalt demo-dataset (bakåtkompatibilitet) ──
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
  { id: 'd1', label: 'ICA Maxi', amount: -890, category: 'food', type: 'expense', paymentMethod: 'Konto', context: 'PERSONAL', created_date: '2026-04-15' },
  { id: 'd2', label: 'Lön April', amount: 42000, category: 'income', type: 'income', paymentMethod: 'Konto', context: 'PERSONAL', created_date: '2026-04-25' },
  { id: 'd3', label: 'SL Månadskort', amount: -890, category: 'transport', type: 'expense', paymentMethod: 'Konto', context: 'PERSONAL', created_date: '2026-04-01' },
  { id: 'd4', label: 'Restaurang K25', amount: -345, category: 'entertainment', type: 'expense', paymentMethod: 'Kredit', context: 'PERSONAL', created_date: '2026-04-13' },
  { id: 'd5', label: 'Apoteket', amount: -189, category: 'health', type: 'expense', paymentMethod: 'Kredit', context: 'PERSONAL', created_date: '2026-04-10' },
];

export function DemoProvider({ children }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  // Initialisera synkront från localStorage – viktigt för att undvika flash
  const [isAlex, setIsAlex] = useState(() => isAlexMode());

  useEffect(() => {
    // Om Alex Mode redan är aktivt vid mount, rensa cachen direkt
    if (isAlexMode()) {
      queryClientInstance.clear();
    }

    const handler = (e) => {
      const active = e.detail.active;
      setIsAlex(active);

      // KRITISKT: Rensa HELA TanStack Query-cachen synkront
      // så att ingen riktig användardata finns kvar i minnet
      queryClientInstance.clear();

      // Stoppa alla pågående queries omedelbart
      queryClientInstance.cancelQueries();
    };

    window.addEventListener('anchor:alex_mode', handler);

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
  const effectiveDemoMode = isDemoMode || isAlex;
  const activeProfile = isAlex ? ALEX_PROFILE : (isDemoMode ? DEMO_PROFILE : null);
  const activeTransactions = isAlex ? ALEX_TRANSACTIONS : (isDemoMode ? DEMO_TRANSACTIONS : null);

  return (
    <DemoContext.Provider value={{
      isDemoMode: effectiveDemoMode,
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