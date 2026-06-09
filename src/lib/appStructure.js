/**
 * App-IA: 6 kärnvyer + dolda djupvyer. Legacy-routes redirectas hit.
 */
import { Home, CalendarDays, ClipboardList, Wrench, Settings, Users, GitBranch, Landmark, ShoppingBag, PieChart, Plane, Shield, FileUp } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { historyTabHref } from '@/lib/historyTabs';
import { planeraTabHref } from '@/lib/planeraTabs';

/** Synliga i bottennav (FAB är snabbåtgärder, inte en vy). */
export const CORE_VIEWS = [
  { id: 'home', page: 'Dashboard', label: 'Hem', icon: Home },
  { id: 'plan', page: 'FuturePulse', label: 'Planera', icon: CalendarDays },
  { id: 'history', page: 'TransactionHistory', label: 'Historik', icon: ClipboardList },
  { id: 'tools', page: 'ProTools', label: 'Verktyg', icon: Wrench },
  { id: 'settings', page: 'Settings', label: 'Inställningar', icon: Settings },
];

/** Nås via hubbar — aldrig i huvudnav. */
export const DEEP_VIEWS = [
  { page: 'Loans', label: 'Lån & skulder', hub: 'Verktyg', icon: Landmark },
  { page: 'PurchaseSimulator', label: 'Köpsimulator', hub: 'Verktyg', icon: ShoppingBag },
  { page: 'Budget', label: 'Budget', hub: 'Verktyg', icon: PieChart },
  { page: 'TravelPlanner', label: 'Resplanering', hub: 'Verktyg', icon: Plane },
  { page: 'Galaxy', label: 'Jämför', hub: 'Inställningar', icon: GitBranch },
  { page: 'Social', label: 'Vänner & profil', hub: 'Inställningar', icon: Users },
  { page: 'Import', label: 'Importera data', hub: 'Hem', icon: FileUp },
  { page: 'SecurityInfo', label: 'Säkerhet & data', hub: 'Inställningar', icon: Shield },
];

/** Gamla bokmärken → rätt kärn- eller djupvy. */
export const LEGACY_REDIRECTS = {
  Pulse: planeraTabHref('nu'),
  WhatIf: planeraTabHref('scenario'),
  Insights: historyTabHref('insights'),
  FinancialHistory: historyTabHref('trends'),
  LedgerVault: historyTabHref('ledger', { includeLedger: true }),
  ResellScanner: createPageUrl('Dashboard'),
  AnchorAnalysis: historyTabHref('insights'),
  AnchorAcademy: createPageUrl('Dashboard'),
  Squads: `${createPageUrl('Social')}?tab=friends`,
  Optimize: `${createPageUrl('ProTools')}?deep=margin`,
  SavingsGoals: createPageUrl('Dashboard'),
  Subscriptions: '/Dashboard?view=subscriptions',
  Prenumerationer: '/Dashboard?view=subscriptions',
  Expenses: historyTabHref('list'),
  Jamfor: createPageUrl('Galaxy'),
  BudgetDashboard: '/Budget',
};

export function isCorePage(pageName) {
  return CORE_VIEWS.some((v) => v.page === pageName);
}

export function coreViewForPage(pageName) {
  return CORE_VIEWS.find((v) => v.page === pageName);
}

export function legacyRedirectTarget(pageName) {
  return LEGACY_REDIRECTS[pageName] || null;
}
