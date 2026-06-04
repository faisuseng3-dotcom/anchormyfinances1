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

export const BUDGET_CATEGORY_META = {
  food: { label: 'Mat', Icon: ShoppingCart, color: '#F6AD55' },
  transport: { label: 'Transport', Icon: Car, color: '#7FA0FF' },
  entertainment: { label: 'Nöje', Icon: Film, color: '#A78BFA' },
  travel: { label: 'Resa', Icon: Plane, color: '#5B8CFF' },
  health: { label: 'Hälsa', Icon: Heart, color: '#9AE6B4' },
  home: { label: 'Bostad', Icon: Home, color: '#FF8A9A' },
  shopping: { label: 'Shopping', Icon: ShoppingBag, color: '#F06292' },
  other: { label: 'Övrigt', Icon: Package, color: '#94A3B8' },
};

export function getBudgetBarColor(pct) {
  if (pct >= 1) return '#FF8A9A';
  if (pct >= 0.8) return '#FCD34D';
  return '#6B9FFF';
}

export function getBudgetStatusText(pct, remaining) {
  if (pct >= 1) return `${Math.abs(remaining).toLocaleString('sv-SE')} kr över`;
  return `${remaining.toLocaleString('sv-SE')} kr kvar`;
}
