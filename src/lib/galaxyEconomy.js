import { getMonthlyMargin, getTotalFixedCosts } from '@/lib/financialUtils';
import { fmtKr, getSavingsPct, getSpendItems } from '@/lib/galaxyProfiles';

/** Budgetnycklar som Budget-sidan förstår */
export const TRACKED_BUDGET_KEYS = new Set([
  'food',
  'transport',
  'entertainment',
  'travel',
  'health',
  'home',
  'shopping',
  'other',
]);

const BUDGET_LABELS = {
  food: 'Mat',
  transport: 'Transport',
  entertainment: 'Nöje',
  travel: 'Resor',
  health: 'Hälsa',
  home: 'Boende',
  shopping: 'Shopping',
  other: 'Övrigt',
};

const BUDGET_COLORS = {
  food: '#F6AD55',
  transport: '#7FA0FF',
  entertainment: '#A78BFA',
  travel: '#5B8CFF',
  health: '#9AE6B4',
  home: '#FF6B6B',
  shopping: '#F06292',
  other: '#94A3B8',
  fixed: '#FF6B6B',
  savings: '#9AE6B4',
};

const pctOf = (amount, income) => (income > 0 ? Math.round((amount / income) * 100) : 0);

export function inferGalaxyTags(occupation, financialProfile) {
  const tags = [];
  const occ = (occupation || '').trim();
  if (occ) tags.push(occ);
  if (financialProfile?.mode === 'student' && !tags.includes('Student')) tags.push('Student');
  const income = financialProfile?.income || 0;
  if (income > 0 && income < 20000 && !tags.includes('Student')) tags.push('Student');
  if (income >= 45000) tags.push('Höginkomsttagare');
  if (/programmer|utveckl|tech|ingenjör/i.test(occ)) tags.push('Programmerare');
  if (/egenföretag|frilans|konsult/i.test(occ)) tags.push('Egenföretagare');
  return [...new Set(tags)];
}

/**
 * Bygger en publicerbar ögonblicksbild från FinancialProfile + integritetsnivå.
 */
export function buildEconomySnapshot(financialProfile, privacyLevel = 'hybrid') {
  const income = financialProfile?.income || 0;
  if (!income || privacyLevel === 'ghost') return null;

  const showKr = privacyLevel === 'full';
  const fixed = getTotalFixedCosts(financialProfile);
  const budgetLimits = financialProfile.budgetLimits || {};
  const margin = Math.max(0, getMonthlyMargin(financialProfile));

  const items = [];
  const budget_template = {};

  if (fixed > 0) {
    const pct = pctOf(fixed, income);
    items.push({
      label: 'Fasta kostnader',
      key: 'fixed',
      budgetKey: null,
      pct,
      amount: showKr ? fixed : null,
      color: BUDGET_COLORS.fixed,
    });
  }

  Object.entries(budgetLimits).forEach(([key, amount]) => {
    if (!amount || amount <= 0) return;
    const pct = pctOf(amount, income);
    if (TRACKED_BUDGET_KEYS.has(key)) {
      budget_template[key] = pct;
    }
    items.push({
      label: BUDGET_LABELS[key] || key,
      key,
      budgetKey: TRACKED_BUDGET_KEYS.has(key) ? key : null,
      pct,
      amount: showKr ? amount : null,
      color: BUDGET_COLORS[key] || BUDGET_COLORS.other,
    });
  });

  if (margin > 0) {
    const pct = pctOf(margin, income);
    items.push({
      label: 'Kvar till sparande',
      key: 'savings',
      budgetKey: null,
      pct,
      amount: showKr ? margin : null,
      color: BUDGET_COLORS.savings,
    });
  }

  if (items.length === 0) return null;

  const savings_rate = pctOf(margin, income);

  return {
    income: showKr ? income : null,
    items,
    savings_rate,
    budget_template,
    updated_at: new Date().toISOString(),
  };
}

export function budgetLimitsFromTemplate(template, userIncome) {
  if (!userIncome || !template) return {};
  const limits = {};
  Object.entries(template).forEach(([key, pct]) => {
    if (TRACKED_BUDGET_KEYS.has(key) && typeof pct === 'number') {
      limits[key] = Math.round((pct / 100) * userIncome);
    }
  });
  return limits;
}

/** Applicera en annan persons fördelning på användarens inkomst. */
export function applyEconomyTemplate(sourceProfile, userIncome) {
  if (!userIncome) return {};

  const snap = sourceProfile.economy_snapshot;
  if (snap?.budget_template && Object.keys(snap.budget_template).length > 0) {
    return budgetLimitsFromTemplate(snap.budget_template, userIncome);
  }

  const limits = {};
  getSpendItems(sourceProfile).forEach((item) => {
    const key = item.budgetKey || item.key;
    if (key && TRACKED_BUDGET_KEYS.has(key)) {
      limits[key] = Math.round((item.pct / 100) * userIncome);
    }
  });
  return limits;
}

export function highlightFromSnapshot(snapshot) {
  if (!snapshot) return '';
  if (snapshot.savings_rate > 0) {
    return `${snapshot.savings_rate} % till sparande`;
  }
  const top = [...(snapshot.items || [])].sort((a, b) => b.pct - a.pct)[0];
  return top ? `${top.pct} % till ${top.label.toLowerCase()}` : 'Publicerad budget';
}

/** SocialProfile → profil i Jämför-listan */
export function socialProfileToGalaxy(social, currentUserId) {
  if (
    !social?.username ||
    social.privacy_level === 'ghost' ||
    !social.economy_published ||
    !social.economy_snapshot?.items?.length
  ) {
    return null;
  }

  const snap = social.economy_snapshot;
  const items = snap.items;
  const savings_rate = snap.savings_rate ?? getSavingsPct(items);

  return {
    id: social.id,
    user_id: social.user_id,
    username: social.username,
    display_name: social.display_name || social.username,
    age: social.age,
    occupation: social.occupation || '',
    city: social.city || '',
    bio: social.bio || '',
    trait: social.occupation || '',
    tags: social.galaxy_tags?.length
      ? social.galaxy_tags
      : inferGalaxyTags(social.occupation, null),
    privacy_level: social.privacy_level || 'hybrid',
    avatar_config: social.avatar_config || social.avatar_style || {},
    highlight: highlightFromSnapshot(snap),
    savings_rate,
    economy_snapshot: snap,
    finance: {
      income: snap.income,
      items,
    },
    isOwn: social.user_id === currentUserId,
    isDemo: false,
  };
}

export function canPublishEconomy(financialProfile, socialProfile) {
  if (!financialProfile?.income) {
    return { ok: false, reason: 'Lägg in din månadsinkomst under Inställningar först.' };
  }
  if (!socialProfile?.username?.trim()) {
    return { ok: false, reason: 'Skapa ett användarnamn under Social → Profil (@namn).' };
  }
  if (socialProfile.privacy_level === 'ghost') {
    return {
      ok: false,
      reason: 'Byt från Ghost-läge under Social → Integritet om du vill dela din ekonomi.',
    };
  }
  const snap = buildEconomySnapshot(financialProfile, socialProfile.privacy_level);
  if (!snap) {
    return { ok: false, reason: 'Lägg in budget eller fasta kostnader innan du publicerar.' };
  }
  return { ok: true, snapshot: snap };
}

export { fmtKr };
