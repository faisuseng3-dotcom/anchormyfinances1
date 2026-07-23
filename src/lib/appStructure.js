/**
 * App-IA: kärnvyer + dolda djupvyer. Legacy-routes redirectas hit.
 */
import { Home, CalendarDays, ClipboardList, Wrench, Settings, Landmark, ShoppingBag, PieChart, Plane, Shield, FileUp } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { historyTabHref } from '@/lib/historyTabs';
import { planeraTabHref } from '@/lib/planeraTabs';

/** Synliga i bottennav (legacy — ersatt av app-shell sidebar). */
export const CORE_VIEWS = [
  { id: 'home', page: 'Dashboard', label: 'Hem', icon: Home },
  { id: 'plan', page: 'FuturePulse', label: 'Din Framtid', icon: CalendarDays },
  { id: 'history', page: 'TransactionHistory', label: 'Historik', icon: ClipboardList },
  { id: 'tools', page: 'ProTools', label: 'Verktyg', icon: Wrench },
  { id: 'settings', page: 'Settings', label: 'Inställningar', icon: Settings },
];

/** Djupvyer — nås via sidebar eller hubbar. */
export const DEEP_VIEWS = [
  { page: 'Loans', label: 'Lån & skulder', hub: 'Verktyg', icon: Landmark },
  { page: 'PurchaseSimulator', label: 'Köpsimulator', hub: 'Verktyg', icon: ShoppingBag },
  { page: 'Budget', label: 'Budget', hub: 'Verktyg', icon: PieChart },
  { page: 'TravelPlanner', label: 'Resplanering', hub: 'Verktyg', icon: Plane },
  { page: 'Import', label: 'Importera data', hub: 'Hem', icon: FileUp },
  { page: 'SecurityInfo', label: 'Säkerhet & data', hub: 'Inställningar', icon: Shield },
  { page: 'Insights', label: 'Insikter', hub: 'Historik', icon: ClipboardList },
  { page: 'AnchorAnalysis', label: 'Coach', hub: 'Översikt', icon: Wrench },
];

/** Gamla bokmärken → kanonisk vy. Dolda sidor redirectas bort från navigation. */
export const LEGACY_REDIRECTS = {
  Pulse: planeraTabHref('nu'),
  WhatIf: planeraTabHref('scenario'),
  Insights: createPageUrl('Insights'),
  FinancialHistory: historyTabHref('trends'),
  LedgerVault: historyTabHref('ledger', { includeLedger: true }),
  ResellScanner: createPageUrl('Dashboard'),
  AnchorAnalysis: createPageUrl('AnchorAnalysis'),
  AnchorAcademy: createPageUrl('AnchorAcademy'),
  Squads: createPageUrl('Squads'),
  Optimize: `${createPageUrl('ProTools')}?deep=margin`,
  SavingsGoals: createPageUrl('SavingsGoals'),
  Subscriptions: createPageUrl('Subscriptions'),
  Prenumerationer: createPageUrl('Subscriptions'),
  Expenses: historyTabHref('list'),
  Jamfor: createPageUrl('Dashboard'),
  Galaxy: createPageUrl('Dashboard'),
  Social: createPageUrl('Dashboard'),
  BudgetDashboard: '/Budget',
};

export function isCorePage(pageName) {
  return CORE_VIEWS.some((v) => v.page === pageName);
}

export function legacyRedirectTarget(pageName) {
  return LEGACY_REDIRECTS[pageName] || null;
}
