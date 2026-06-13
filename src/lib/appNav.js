import { createPageUrl } from '@/utils';

/** Sidor som ska döljas från navigation (legacy-routes redirectas). */
export const HIDDEN_NAV_PAGES = new Set([
  'Galaxy',
  'Social',
  'ResellScanner',
  'LedgerVault',
  'FinancialHistory',
  'Pulse',
  'WhatIf',
]);

export const OVERVIEW_NAV = [
  { id: 'Dashboard', label: 'Hem', icon: 'home', href: createPageUrl('Dashboard') },
  { id: 'Budget', label: 'Budget', icon: 'budget', href: '/Budget' },
  { id: 'FuturePulse', label: 'Din Framtid', icon: 'future', href: createPageUrl('FuturePulse') },
  { id: 'AnchorAnalysis', label: 'AI-Coach', icon: 'coach', href: createPageUrl('AnchorAnalysis') },
];

export const TOOLS_NAV = [
  { id: 'SavingsGoals', label: 'Sparmål', icon: 'goals', href: createPageUrl('SavingsGoals') },
  { id: 'Subscriptions', label: 'Prenumerationer', icon: 'subscriptions', href: createPageUrl('Subscriptions') },
  { id: 'BusinessDashboard', label: 'Business', icon: 'business', href: '/BusinessDashboard' },
  { id: 'Squads', label: 'Squads', icon: 'squads', href: createPageUrl('Squads') },
  { id: 'AnchorAcademy', label: 'Anchor Academy', icon: 'academy', href: createPageUrl('AnchorAcademy') },
];

/** Sidor som använder app-shell (sidebar + topbar). */
export const SHELL_PAGES = new Set([
  'Dashboard',
  'BudgetDashboard',
  'FuturePulse',
  'AnchorAnalysis',
  'SavingsGoals',
  'Squads',
  'AnchorAcademy',
  'Loans',
  'PurchaseSimulator',
  'TransactionHistory',
  'BusinessDashboard',
  'YearEndClosing',
  'Settings',
  'Pricing',
  'Insights',
  'Subscriptions',
  'ProTools',
  'Import',
  'TravelPlanner',
]);

export function isNavActive(itemId, pathname) {
  const page = pathname.split('/').filter(Boolean).pop() || 'Dashboard';
  if (itemId === 'Budget') return page === 'Budget' || page === 'BudgetDashboard';
  if (itemId === 'BusinessDashboard') return page === 'BusinessDashboard';
  return page === itemId;
}
