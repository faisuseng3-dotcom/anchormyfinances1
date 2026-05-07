/**
 * Alex Mode — Demo Dataset
 * Alla datum är relativa till "idag" för att alltid se aktuella ut.
 */

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysAhead(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

export const ALEX_PROFILE = {
  // Identitet
  _alexMode: true,
  _name: 'Alex',
  _age: 27,
  _occupation: 'Marknadskoordinator',
  _bio: 'Ambition att spara, men lever ett aktivt liv',
  _housing: 'Hyresrätt, Stockholm',

  // Ekonomi
  income: 32500,
  housingCost: 9500,
  buffer: 28500,          // 3 månader täckta
  savingsGoal: 40000,
  savingsGoalName: 'Japan-resa',
  savingsGoalEmoji: '✈️',
  savingsCurrentBalance: 25000,

  // Sparmål #2 (konflikt)
  secondaryGoalName: 'Ny Macbook',
  secondaryGoalAmount: 3000, // kr/mån extra = konflikttrigger

  onboardingCompleted: true,
  userGoals: ['save', 'control', 'improve'],
  primaryGoal: 'save',
  mode: 'smart',

  fixedCostItems: [
    { id: 'a1', label: 'Hyra', amount: 9500 },
    { id: 'a2', label: 'SL Månadskort', amount: 1020 },
    { id: 'a3', label: 'Folksam Hemförsäkring', amount: 159 },
    { id: 'a4', label: 'CSN', amount: 850 },
    { id: 'a5', label: 'Netflix', amount: 149 },
    { id: 'a6', label: 'Spotify', amount: 119 },
    { id: 'a7', label: 'Disney+', amount: 89 },
  ],

  budgetLimits: {
    food: 4500,
    entertainment: 2000,
    transport: 1200,
    shopping: 1500,
    health: 500,
  },

  subscriptions: [
    { name: 'Netflix', amount: 149, category: 'streaming' },
    { name: 'Spotify', amount: 119, category: 'streaming' },
    { name: 'Disney+', amount: 89, category: 'streaming', aiNote: 'Ej använt på 2 månader – AI föreslår att avsluta' },
  ],

  loans: [
    { name: 'Studielån (CSN)', totalAmount: 180000, interestRate: 0.45, monthlyPayment: 850 },
  ],

  totalXP: 2850,
  level: 5,
  dailyLoginStreak: 12,
  unlockedBadges: ['first_login', 'budget_beginner', 'streak_3', 'streak_7', 'saver_start'],
  // Galaxy: "Star Cadet"
  galaxyLevel: 'Star Cadet',
  nextAchievement: { name: 'Buffert-kungen', remaining: 500 },

  // MLI override
  _mliOverride: 72,

  // Safe-to-spend override
  _safeToSpend: 3840,

  // Hyra kommer fredag
  _upcomingRent: { amount: 9500, daysUntil: 3 },
};

export const ALEX_TRANSACTIONS = [
  // ── Fasta kostnader ──
  {
    id: 'ax_rent',
    label: 'Hyra',
    vendor: 'Hyresvärd Stockholm',
    amount: -9500,
    category: 'home',
    type: 'expense',
    paymentMethod: 'Konto',
    context: 'PERSONAL',
    _pending: true,
    _dueDate: daysAhead(3),
    created_date: daysAhead(3),
    aiNote: 'Kommande – dras automatiskt fredag',
  },
  {
    id: 'ax_sl',
    label: 'SL Månadskort',
    vendor: 'SL',
    amount: -1020,
    category: 'transport',
    type: 'expense',
    paymentMethod: 'Konto',
    context: 'PERSONAL',
    created_date: daysAgo(1),
  },
  {
    id: 'ax_insurance',
    label: 'Folksam Hemförsäkring',
    vendor: 'Folksam',
    amount: -159,
    category: 'home',
    type: 'expense',
    paymentMethod: 'Konto',
    context: 'PERSONAL',
    created_date: daysAgo(3),
  },
  {
    id: 'ax_csn',
    label: 'CSN Studielån',
    vendor: 'CSN',
    amount: -850,
    category: 'other',
    type: 'expense',
    paymentMethod: 'Konto',
    context: 'PERSONAL',
    created_date: daysAgo(5),
  },

  // ── Vardagsutgifter ──
  {
    id: 'ax_ica',
    label: 'ICA Kvantum',
    vendor: 'ICA Kvantum',
    amount: -642,
    category: 'food',
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: daysAgo(2),
    aiNote: 'Söndagslyx – något över veckosnittet',
  },
  {
    id: 'ax_wolt',
    label: 'Wolt',
    vendor: 'Wolt',
    amount: -245,
    category: 'food',
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: daysAgo(4),
  },
  {
    id: 'ax_coffee',
    label: 'Espresso House',
    vendor: 'Espresso House',
    amount: -54,
    category: 'food',
    type: 'expense',
    paymentMethod: 'Swish',
    context: 'PERSONAL',
    created_date: daysAgo(1),
  },
  {
    id: 'ax_gymshark',
    label: 'Gymshark',
    vendor: 'Gymshark',
    amount: -890,
    category: 'shopping',
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: daysAgo(3),
    aiNote: 'Köpångest-skydd triggades – Alex bekräftade köpet',
  },
  {
    id: 'ax_okq8',
    label: 'OKQ8',
    vendor: 'OKQ8',
    amount: -420,
    category: 'transport',
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: daysAgo(6),
  },

  // ── Abonnemang ──
  {
    id: 'ax_netflix',
    label: 'Netflix',
    vendor: 'Netflix',
    amount: -149,
    category: 'entertainment',
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: daysAgo(7),
  },
  {
    id: 'ax_spotify',
    label: 'Spotify',
    vendor: 'Spotify',
    amount: -119,
    category: 'entertainment',
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: daysAgo(7),
  },
  {
    id: 'ax_disney',
    label: 'Disney+',
    vendor: 'Disney+',
    amount: -89,
    category: 'entertainment',
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: daysAgo(7),
    aiNote: 'Ej använt på 2 månader — AI: "Vill du att jag avslutar prenumerationen?"',
    _aiSuggestion: 'cancel_subscription',
  },

  // ── Ohanterade köp (MLI-triggers) ──
  {
    id: 'ax_u1',
    label: 'ZETTLE RESTAURANG',
    vendor: 'ZETTLE RESTAURANG',
    amount: -450,
    category: null,
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: daysAgo(2),
    _uncategorized: true,
  },
  {
    id: 'ax_u2',
    label: 'APPLE.COM/BILL',
    vendor: 'Apple',
    amount: -29,
    category: null,
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: daysAgo(2),
    _uncategorized: true,
  },
  {
    id: 'ax_u3',
    label: 'KIOSK',
    vendor: 'KIOSK',
    amount: -85,
    category: null,
    type: 'expense',
    paymentMethod: 'Kontant',
    context: 'PERSONAL',
    created_date: daysAgo(3),
    _uncategorized: true,
  },
  {
    id: 'ax_u4',
    label: 'AMZN Mktp',
    vendor: 'Amazon',
    amount: -312,
    category: null,
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: daysAgo(4),
    _uncategorized: true,
    aiNote: 'AI: "Hittade ett Amazon-köp — ska jag kategorisera det som Shopping?"',
  },

  // ── Inkomst ──
  {
    id: 'ax_income',
    label: 'Lön — Marknadskoordinator',
    vendor: 'Arbetsgivare',
    amount: 32500,
    category: 'income',
    type: 'income',
    paymentMethod: 'Konto',
    context: 'PERSONAL',
    created_date: daysAgo(10),
  },

  // ── Sparinsättning ──
  {
    id: 'ax_savings',
    label: 'Sparinsättning — Japan-resa',
    vendor: 'Anchor Sparande',
    amount: -2500,
    category: 'savings',
    type: 'savings_deposit',
    paymentMethod: 'Konto',
    context: 'PERSONAL',
    created_date: daysAgo(9),
  },
];