import {
  ShoppingBag,
  PieChart,
  Landmark,
  History,
  CalendarDays,
  Plane,
  AlarmClock,
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { planeraTabHref } from '@/lib/planeraTabs';

export function toolPageHref(item) {
  if (item.href) return item.href;
  if (item.tab) return planeraTabHref(item.tab);
  return createPageUrl(item.page);
}

/** Snabbkalkylator på Hem (4 kärnval). */
export const KALKYLATOR_TOOLS = [
  {
    id: 'purchase',
    question: 'Kan jag köpa det här?',
    hint: 'Bil, bostad, resa eller större köp',
    icon: ShoppingBag,
    page: 'PurchaseSimulator',
  },
  {
    id: 'loans',
    question: 'Jämför ditt lån',
    hint: 'Ränta, månadskostnad och amortering',
    icon: Landmark,
    page: 'Loans',
  },
  {
    id: 'plan',
    question: 'Din Framtid',
    hint: 'Optimistisk, realistisk eller pessimistisk — justera och dela',
    icon: CalendarDays,
    page: 'FuturePulse',
  },
];

/** Fler verktyg — scenarier (inkl. kalkylator + budget & historik). */
export const PROTOOLS_SCENARIOS = [
  ...KALKYLATOR_TOOLS,
  {
    id: 'budget',
    question: 'Hur mycket har jag kvar i månaden?',
    hint: 'Plan mot utfall per kategori',
    icon: PieChart,
    page: 'Budget',
  },
  {
    id: 'history',
    question: 'Hur har det gått över tid?',
    hint: 'Buffert och skuld senaste halvåret',
    icon: History,
    page: 'TransactionHistory',
    tab: 'trends',
  },
];

export const PROTOOLS_EXPLORE = [
  {
    id: 'travel',
    question: 'Planera en resa',
    hint: 'Budget och kostnad per dag',
    icon: Plane,
    page: 'TravelPlanner',
  },
  {
    id: 'passivity',
    question: 'Vad kostar passivitet?',
    hint: 'Ränta på ränta och priset av att vänta',
    icon: AlarmClock,
    page: 'Dashboard',
    anchorHash: 'passivity',
  },
];

const TOOL_PRIORITY = {
  spending: ['purchase', 'budget', 'plan', 'loans', 'history'],
  debt: ['loans', 'plan', 'purchase', 'budget', 'history'],
  save: ['plan', 'budget', 'purchase', 'loans', 'history'],
  plan: ['plan', 'purchase', 'budget', 'loans', 'history'],
};

export function sortTools(items, topConcern) {
  const order = TOOL_PRIORITY[topConcern];
  if (!order) return items;
  return [...items].sort((a, b) => {
    const ai = order.indexOf(a.id);
    const bi = order.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

/** Rekommenderat läge utifrån onboarding-stress. */
export function getRecommendedMode(topConcern) {
  if (topConcern === 'spending') return 'basic';
  if (topConcern === 'debt' || topConcern === 'save' || topConcern === 'plan') return 'smart';
  return 'smart';
}
