/**
 * Alex Mode — Demo Dataset
 * Fasta datum baserade på maj 2026 för att se äkta och konsekventa ut.
 */

// Returnerar lokal ISO-sträng (YYYY-MM-DDTHH:mm:ss) — undviker UTC-offsetfel
// t.ex. Stockholm +02:00: new Date(2026,4,8).toISOString() = "2026-05-07T22:00:00Z" (fel månad!)
function fixedDate(year, month, day) {
  const pad = n => String(n).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}T12:00:00`;
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
  buffer: 28500,
  savingsGoal: 55000,
  savingsGoalName: 'Kontantinsats buffert',
  savingsGoalEmoji: '🎯',
  savingsCurrentBalance: 25000,
  savingsGoalDeadline: '2026-12-20',
  savingsGoalDailyTarget: 170,
  savingsGoalMonthlyTarget: 5200,
  savingsDailyMicroAmount: 60,
  savingsMotivationStreak: 9,
  impulseShieldEnabled: true,
  impulseCooldownHours: 48,
  impulseThreshold: 900,

  secondaryGoalName: 'Ny Macbook',
  secondaryGoalAmount: 3000,

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
  galaxyLevel: 'Star Cadet',
  nextAchievement: { name: 'Buffert-kungen', remaining: 500 },

  _mliOverride: 72,
  _safeToSpend: 3840,
  _upcomingRent: { amount: 9500, daysUntil: 3 },
};

export const ALEX_TRANSACTIONS = [
  // ── Inkomst ──
  {
    id: 'ax_income',
    label: 'Lön — Marknadskoordinator',
    vendor: 'Arbetsgivare AB',
    amount: 32500,
    category: 'income',
    type: 'income',
    paymentMethod: 'Konto',
    context: 'PERSONAL',
    is_recurring: true,
    created_date: fixedDate(2026, 5, 25),
  },

  // ── Hyra (schemalagd/kommande) ──
  {
    id: 'ax_rent',
    label: 'Hyra — Hyresvärd AB',
    vendor: 'Hyresvärd AB',
    amount: -9500,
    category: 'home',
    type: 'expense',
    paymentMethod: 'Konto',
    context: 'PERSONAL',
    _pending: true,
    _dueDate: fixedDate(2026, 6, 1),
    created_date: fixedDate(2026, 6, 1),
    aiNote: 'Schemalagd — dras automatiskt 1 juni',
  },

  // ── Fasta kostnader ──
  {
    id: 'ax_sl',
    label: 'SL Månadskort',
    vendor: 'SL Stockholm',
    amount: -1020,
    category: 'transport',
    type: 'expense',
    paymentMethod: 'Konto',
    context: 'PERSONAL',
    is_recurring: true,
    created_date: fixedDate(2026, 5, 27),
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
    is_recurring: true,
    created_date: fixedDate(2026, 5, 27),
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
    is_recurring: true,
    created_date: fixedDate(2026, 5, 26),
  },

  // ── Vardagsutgifter (exakt enligt spec) ──
  {
    id: 'ax_ica',
    label: 'ICA Kvantum',
    vendor: 'ICA Kvantum',
    amount: -642.50,
    category: 'food',
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: fixedDate(2026, 5, 28),
    aiNote: 'Söndagslyx – något över veckosnittet',
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
    created_date: fixedDate(2026, 5, 29),
  },
  {
    id: 'ax_bolt',
    label: 'Bolt Technology',
    vendor: 'Bolt Technology',
    amount: -145,
    category: 'transport',
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: fixedDate(2026, 5, 30),
  },
  {
    id: 'ax_urban_deli',
    label: 'Urban Deli',
    vendor: 'Urban Deli',
    amount: -890,
    category: 'food',
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: fixedDate(2026, 5, 30),
    aiNote: 'Restaurangbesök – lite lyxigare än snitt',
  },

  // ── Manuell inmatning (röststyrning-demo) ──
  {
    id: 'ax_swish_erik',
    label: 'Swish till Erik (Lunch)',
    vendor: 'Swish',
    amount: -120,
    category: 'food',
    type: 'expense',
    paymentMethod: 'Swish',
    context: 'PERSONAL',
    created_date: fixedDate(2026, 5, 30),
    aiNote: 'Manuell inmatning via röststyrning',
    _manual: true,
  },

  // ── Shopping ──
  {
    id: 'ax_gymshark',
    label: 'Gymshark',
    vendor: 'Gymshark',
    amount: -890,
    category: 'shopping',
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: fixedDate(2026, 5, 27),
    aiNote: 'Köpångest-skydd triggades – Alex bekräftade köpet',
  },
  {
    id: 'ax_hm',
    label: 'H&M',
    vendor: 'H&M',
    amount: -350,
    category: 'shopping',
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: fixedDate(2026, 5, 24),
  },

  // ── Extra mat ──
  {
    id: 'ax_hemkop',
    label: 'Hemköp',
    vendor: 'Hemköp',
    amount: -120,
    category: 'food',
    type: 'expense',
    paymentMethod: 'Konto',
    context: 'PERSONAL',
    created_date: fixedDate(2026, 5, 26),
  },
  {
    id: 'ax_foodora',
    label: 'Foodora',
    vendor: 'Foodora',
    amount: -220,
    category: 'food',
    type: 'expense',
    paymentMethod: 'Kredit',
    context: 'PERSONAL',
    created_date: fixedDate(2026, 5, 23),
    aiNote: 'Matleverans — tredje gången denna månad',
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
    created_date: fixedDate(2026, 5, 26),
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
    created_date: fixedDate(2026, 5, 26),
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
    created_date: fixedDate(2026, 5, 30),
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
    created_date: fixedDate(2026, 5, 29),
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
    created_date: fixedDate(2026, 5, 28),
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
    created_date: fixedDate(2026, 5, 27),
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
    created_date: fixedDate(2026, 5, 26),
    _uncategorized: true,
    aiNote: 'AI: "Hittade ett Amazon-köp — ska jag kategorisera det som Shopping?"',
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
    created_date: fixedDate(2026, 5, 25),
  },
];