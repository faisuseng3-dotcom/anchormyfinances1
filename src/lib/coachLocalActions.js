/**
 * Deterministisk coach — hanterar vanliga ändringskommandon utan LLM.
 */
import { BUDGET_CATEGORY_META, TRACKED_BUDGET_CATEGORIES } from '@/lib/budgetCategories';

const CATEGORY_ALIASES = [
  ['matbudgeten', 'food'],
  ['matbudget', 'food'],
  ['livsmedel', 'food'],
  ['mat', 'food'],
  ['transportbudgeten', 'transport'],
  ['transportbudget', 'transport'],
  ['transport', 'transport'],
  ['nojebudgeten', 'entertainment'],
  ['nojebudget', 'entertainment'],
  ['noje', 'entertainment'],
  ['nöje', 'entertainment'],
  ['underhallning', 'entertainment'],
  ['resbudgeten', 'travel'],
  ['resbudget', 'travel'],
  ['resor', 'travel'],
  ['resa', 'travel'],
  ['halsbudget', 'health'],
  ['halsa', 'health'],
  ['hälsa', 'health'],
  ['shoppingbudget', 'shopping'],
  ['shopping', 'shopping'],
  ['ovrigtbudget', 'other'],
  ['ovrigt', 'other'],
  ['övrigt', 'other'],
  ['bostadsbudget', 'home'],
  ['bostad', 'home'],
];

function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function extractAmount(text) {
  const matches = [...text.matchAll(/(\d[\d\s]*)\s*(?:kr|kronor)?/gi)];
  if (!matches.length) return null;

  const tillIdx = text.search(/\btill\b/);
  if (tillIdx >= 0) {
    for (const m of matches) {
      if (m.index >= tillIdx) {
        const val = parseInt(m[1].replace(/\s/g, ''), 10);
        if (!Number.isNaN(val) && val >= 0) return val;
      }
    }
  }

  const last = matches[matches.length - 1];
  const val = parseInt(last[1].replace(/\s/g, ''), 10);
  return Number.isNaN(val) || val < 0 ? null : val;
}

function findCategory(text) {
  const n = normalizeText(text);
  for (const [alias, key] of CATEGORY_ALIASES) {
    if (n.includes(normalizeText(alias))) return key;
  }

  const forMatch = n.match(/budget\s+(?:for|för)\s+(\w+)/);
  if (forMatch?.[1]) {
    const token = forMatch[1];
    for (const [alias, key] of CATEGORY_ALIASES) {
      const a = normalizeText(alias);
      if (a === token || a.startsWith(token) || token.startsWith(a)) return key;
    }
  }
  return null;
}

function isChangeIntent(text) {
  return /\b(satt|satt|andra|andra|uppdatera|justera|gor|stall|ställ|sätt|ändra|gör)\b/.test(text)
    || text.includes('budget');
}

function findSubscription(profile, query) {
  const q = normalizeText(query);
  return (profile.subscriptions || []).find((s) => {
    const name = normalizeText(s.name);
    return name.includes(q) || q.includes(name);
  });
}

/**
 * @returns {{ handled: boolean, answer?: string, profile_patch?: object, off_topic?: boolean }}
 */
export function tryLocalCoachAction(question, profile) {
  const n = normalizeText(question);

  if ((isChangeIntent(n) || n.includes('budget')) && !/(hyra|boendekostnad)/.test(n)) {
    const cat = findCategory(question);
    const amount = extractAmount(question);
    if (cat && amount != null && TRACKED_BUDGET_CATEGORIES.includes(cat)) {
      const label = BUDGET_CATEGORY_META[cat]?.label || cat;
      const prev = profile.budgetLimits?.[cat];
      return {
        handled: true,
        answer: prev != null
          ? `Klart — jag har ändrat din ${label.toLowerCase()}budget från ${prev.toLocaleString('sv-SE')} kr till ${amount.toLocaleString('sv-SE')} kr per månad.`
          : `Klart — jag har satt din ${label.toLowerCase()}budget till ${amount.toLocaleString('sv-SE')} kr per månad.`,
        profile_patch: { budgetLimits: { [cat]: amount } },
      };
    }
  }

  if (/inkomst|lon|salary/.test(n) && isChangeIntent(n)) {
    const amount = extractAmount(question);
    if (amount != null && amount > 0) {
      return {
        handled: true,
        answer: `Jag har uppdaterat din månadsinkomst till ${amount.toLocaleString('sv-SE')} kr.`,
        profile_patch: { income: amount },
      };
    }
  }

  if (/(hyra|boendekostnad|boende\s*kostnad)/.test(n) && isChangeIntent(n)) {
    const amount = extractAmount(question);
    if (amount != null) {
      return {
        handled: true,
        answer: `Jag har satt din boendekostnad till ${amount.toLocaleString('sv-SE')} kr per månad.`,
        profile_patch: { housingCost: amount },
      };
    }
  }

  const removeSub = question.match(
    /(?:ta bort|avsluta|säg upp|sag upp|ta\s+ut)\s+(.+?)(?:\s*(?:prenumeration|abonnemang))?\s*$/i,
  );
  if (removeSub) {
    const match = findSubscription(profile, removeSub[1].trim());
    if (match) {
      return {
        handled: true,
        answer: `Jag har tagit bort ${match.name} (${(match.amount || 0).toLocaleString('sv-SE')} kr/mån) från dina prenumerationer.`,
        profile_patch: { subscription_changes: [{ action: 'remove', name: match.name }] },
      };
    }
  }

  return { handled: false };
}
