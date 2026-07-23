import {
  ShoppingCart,
  Car,
  Film,
  Plane,
  Heart,
  Home,
  ShoppingBag,
  Package,
} from 'lucide-react';

export const TRACKED_BUDGET_CATEGORIES = [
  'food',
  'transport',
  'entertainment',
  'travel',
  'health',
  'home',
  'shopping',
  'other',
];

// Kategorier särskiljs via ikonform + etikett, inte färg — en enda neutral
// ikonton och accentfärgen reserveras för budgetstatus (under/nära/över).
const NEUTRAL_ICON = 'rgba(255,255,255,0.75)';

export const BUDGET_CATEGORY_META = {
  food: { label: 'Mat', Icon: ShoppingCart, color: NEUTRAL_ICON },
  transport: { label: 'Transport', Icon: Car, color: NEUTRAL_ICON },
  entertainment: { label: 'Nöje', Icon: Film, color: NEUTRAL_ICON },
  travel: { label: 'Resa', Icon: Plane, color: NEUTRAL_ICON },
  health: { label: 'Hälsa', Icon: Heart, color: NEUTRAL_ICON },
  home: { label: 'Bostad', Icon: Home, color: NEUTRAL_ICON },
  shopping: { label: 'Shopping', Icon: ShoppingBag, color: NEUTRAL_ICON },
  other: { label: 'Övrigt', Icon: Package, color: NEUTRAL_ICON },
};

export function getBudgetBarColor(pct) {
  if (pct >= 1) return '#e2857a';
  if (pct >= 0.8) return '#d9b25c';
  return '#4fae82';
}

export function getBudgetStatusText(pct, remaining) {
  if (pct >= 1) return `${Math.abs(remaining).toLocaleString('sv-SE')} kr över`;
  return `${remaining.toLocaleString('sv-SE')} kr kvar`;
}
