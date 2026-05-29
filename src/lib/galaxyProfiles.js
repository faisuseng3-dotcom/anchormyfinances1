import { getMonthlyMargin } from '@/lib/financialUtils';
import { applyEconomyTemplate } from '@/lib/galaxyEconomy';

/** Demo-profiler och jämförelselogik — ingen AI, bara siffror. */

export const GALAXY_DEMO_PROFILES = [
  {
    id: 'demo_elias',
    username: 'elias_kth',
    display_name: 'Elias',
    age: 22,
    occupation: 'Student',
    city: 'Stockholm',
    bio: 'CSN och extrajobb. Sparar till resa efter examen.',
    trait: 'Sparar lite varje månad',
    tags: ['Student', 'Stockholm'],
    privacy_level: 'full',
    savings_rate: 8,
    highlight: '1 200 kr/mån till sparande',
    economy_snapshot: {
      income: 14500,
      savings_rate: 8,
      budget_template: { home: 36, food: 21, other: 35 },
      items: [
        { label: 'Boende', amount: 5200, pct: 36, color: '#FF6B6B', key: 'home', budgetKey: 'home' },
        { label: 'Mat', amount: 3100, pct: 21, color: '#F6AD55', key: 'food', budgetKey: 'food' },
        { label: 'Sparande', amount: 1200, pct: 8, color: '#9AE6B4', key: 'savings', budgetKey: null },
        { label: 'Övrigt', amount: 5000, pct: 35, color: '#7FA0FF', key: 'other', budgetKey: 'other' },
      ],
    },
    finance: {
      income: 14500,
      items: [
        { label: 'Boende', amount: 5200, pct: 36, color: '#FF6B6B', key: 'home', budgetKey: 'home' },
        { label: 'Mat', amount: 3100, pct: 21, color: '#F6AD55', key: 'food', budgetKey: 'food' },
        { label: 'Sparande', amount: 1200, pct: 8, color: '#9AE6B4', key: 'savings', budgetKey: null },
        { label: 'Övrigt', amount: 5000, pct: 35, color: '#7FA0FF', key: 'other', budgetKey: 'other' },
      ],
    },
  },
  {
    id: 'demo_sarah',
    username: 'sarah_design',
    display_name: 'Sarah',
    age: 31,
    occupation: 'Egenföretagare',
    city: 'Göteborg',
    bio: 'Driver designbyrå. Låga fasta kostnader, buffert först.',
    trait: '20 % marginal kvar',
    tags: ['Egenföretagare', 'Göteborg'],
    privacy_level: 'hybrid',
    savings_rate: 20,
    highlight: '20 % till buffert',
    economy_snapshot: {
      income: null,
      savings_rate: 20,
      budget_template: { home: 25, other: 40, food: 15 },
      items: [
        { label: 'Boende', pct: 25, color: '#FF6B6B', key: 'home', budgetKey: 'home' },
        { label: 'Bolag & verktyg', pct: 40, color: '#7FA0FF', key: 'other', budgetKey: 'other' },
        { label: 'Vardag', pct: 15, color: '#F6AD55', key: 'food', budgetKey: 'food' },
        { label: 'Buffert', pct: 20, color: '#9AE6B4', key: 'savings', budgetKey: null },
      ],
    },
    finance: {
      income: null,
      items: [
        { label: 'Boende', pct: 25, color: '#FF6B6B', key: 'home', budgetKey: 'home' },
        { label: 'Bolag & verktyg', pct: 40, color: '#7FA0FF', key: 'other', budgetKey: 'other' },
        { label: 'Vardag', pct: 15, color: '#F6AD55', key: 'food', budgetKey: 'food' },
        { label: 'Buffert', pct: 20, color: '#9AE6B4', key: 'savings', budgetKey: null },
      ],
    },
  },
  {
    id: 'demo_marcus',
    username: 'marcus_tech',
    display_name: 'Marcus',
    age: 34,
    occupation: 'Programmerare',
    city: 'Stockholm',
    bio: 'Hög inkomst, enkel vardag. Mycket går till sparande och pension.',
    trait: '40 % sparkvot',
    tags: ['Programmerare', 'Stockholm', 'Höginkomsttagare'],
    privacy_level: 'hybrid',
    savings_rate: 40,
    highlight: '40 % sparas varje månad',
    economy_snapshot: {
      income: null,
      savings_rate: 40,
      budget_template: { home: 20, food: 25, other: 15 },
      items: [
        { label: 'Boende', pct: 20, color: '#FF6B6B', key: 'home', budgetKey: 'home' },
        { label: 'Sparande', pct: 40, color: '#9AE6B4', key: 'savings', budgetKey: null },
        { label: 'Vardag', pct: 25, color: '#F6AD55', key: 'food', budgetKey: 'food' },
        { label: 'Övrigt', pct: 15, color: '#7FA0FF', key: 'other', budgetKey: 'other' },
      ],
    },
    finance: {
      income: null,
      items: [
        { label: 'Boende', pct: 20, color: '#FF6B6B', key: 'home', budgetKey: 'home' },
        { label: 'Sparande', pct: 40, color: '#9AE6B4', key: 'savings', budgetKey: null },
        { label: 'Vardag', pct: 25, color: '#F6AD55', key: 'food', budgetKey: 'food' },
        { label: 'Övrigt', pct: 15, color: '#7FA0FF', key: 'other', budgetKey: 'other' },
      ],
    },
  },
];

export const GALAXY_FILTER_TAGS = [
  'Student',
  'Egenföretagare',
  'Programmerare',
  'Stockholm',
  'Göteborg',
  'Malmö',
];

export const fmtKr = (n) => `${Math.round(n || 0).toLocaleString('sv-SE')} kr`;

export function getSpendItems(profile) {
  return (profile?.finance?.items || []).filter((i) => !/inkomst/i.test(i.label));
}

export function getSavingsPct(items) {
  const spend = items.reduce((s, i) => s + (i.pct || 0), 0);
  return Math.max(0, 100 - spend);
}

export function matchScore(userProfile, profile) {
  if (!userProfile) return 0;
  let score = 0;
  const userTags = new Set();
  if (userProfile.mode === 'student') userTags.add('Student');
  if (userProfile.occupation) userTags.add(userProfile.occupation);
  profile.tags?.forEach((t) => {
    if (userTags.has(t)) score += 2;
  });
  const income = userProfile.income || 0;
  if (income < 20000 && profile.tags?.includes('Student')) score += 2;
  if (income >= 45000 && profile.tags?.includes('Höginkomsttagare')) score += 2;
  if (income >= 25000 && profile.tags?.includes('Programmerare')) score += 1;
  return score;
}

export function compareWithUser(userProfile, profile) {
  const userIncome = userProfile?.income || 0;
  const items = getSpendItems(profile);
  const theirSavingsPct = profile.savings_rate ?? getSavingsPct(items);
  const userMargin = getMonthlyMargin(userProfile);
  const userSavingsPct = userIncome > 0 ? Math.round((Math.max(0, userMargin) / userIncome) * 100) : null;

  const rows = items.map((item) => {
    const theirKr =
      item.amount ?? (profile.finance?.income ? Math.round((item.pct / 100) * profile.finance.income) : null);
    const yourKr = userIncome > 0 ? Math.round((item.pct / 100) * userIncome) : null;
    return { ...item, theirKr, yourKr, deltaKr: yourKr != null && theirKr != null ? theirKr - yourKr : null };
  });

  const templateSavingsKr = userIncome > 0 ? Math.round((theirSavingsPct / 100) * userIncome) : 0;
  const yourMarginKr = Math.max(0, userMargin);

  return {
    userIncome,
    theirSavingsPct,
    userSavingsPct,
    rows,
    templateSavingsKr,
    yourMarginKr,
    savingsDeltaKr: templateSavingsKr - yourMarginKr,
  };
}

export function budgetLimitsFromProfile(profile, userIncome) {
  return applyEconomyTemplate(profile, userIncome);
}

export { applyEconomyTemplate };

export function insightLine(comparison) {
  if (!comparison?.userIncome) return null;
  const { savingsDeltaKr, theirSavingsPct, userSavingsPct } = comparison;
  if (userSavingsPct == null) return `Den här profilen sparar cirka ${theirSavingsPct} % av inkomsten.`;
  if (savingsDeltaKr > 500) {
    return `Med samma fördelning på din lön skulle du kunna avsätta cirka ${fmtKr(savingsDeltaKr)} mer per månad till sparande.`;
  }
  if (savingsDeltaKr < -500) {
    return `Du har redan mer marginal (${fmtKr(comparison.yourMarginKr)}) än den här fördelningen ger (${fmtKr(comparison.templateSavingsKr)}).`;
  }
  return `Er sparnivå ligger nära varandra — du cirka ${userSavingsPct} %, de ${theirSavingsPct} %.`;
}
