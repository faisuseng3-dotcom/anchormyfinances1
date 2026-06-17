import { createPageUrl } from '@/utils';

/** Sidor som ska döljas från huvudnavigation (nås via Mer eller legacy-redirect). */
export const HIDDEN_NAV_PAGES = new Set([
  'Galaxy',
  'Social',
  'ResellScanner',
  'LedgerVault',
  'FinancialHistory',
  'Pulse',
  'WhatIf',
  'Squads',
  'AnchorAcademy',
  'TravelPlanner',
  'SavingsGoals',
  'Subscriptions',
  'ProTools',
  'Insights',
  'Loans',
  'PurchaseSimulator',
  'Import',
  'BusinessDashboard',
]);

/** Huvudnavigation — max 5 punkter för lägre kognitiv belastning. */
export const PRIMARY_NAV = [
  { id: 'Dashboard', label: 'Hem', icon: 'home', href: createPageUrl('Dashboard') },
  { id: 'Budget', label: 'Budget', icon: 'budget', href: '/Budget' },
  { id: 'FuturePulse', label: 'Framtid', icon: 'future', href: createPageUrl('FuturePulse') },
  { id: 'AnchorAnalysis', label: 'Coach', icon: 'coach', href: createPageUrl('AnchorAnalysis') },
  { id: 'Mer', label: 'Mer', icon: 'settings', href: '/Mer' },
];

/** @deprecated Använd PRIMARY_NAV */
export const OVERVIEW_NAV = PRIMARY_NAV.filter((item) => item.id !== 'Mer');

/** Verktyg flyttade till Mer — tom i sidomenyn. */
export const TOOLS_NAV = [];

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
  'Mer',
  'Social',
]);

const MER_ACTIVE_PAGES = new Set([
  'Mer',
  'Settings',
  'Pricing',
  'SecurityInfo',
  'Squads',
  'AnchorAcademy',
  'TravelPlanner',
  'Insights',
  'Social',
  'SavingsGoals',
  'Subscriptions',
  'ProTools',
  'Import',
  'BusinessDashboard',
  'Loans',
  'PurchaseSimulator',
  'TransactionHistory',
  'YearEndClosing',
]);

export function isNavActive(itemId, pathname) {
  const page = pathname.split('/').filter(Boolean).pop() || 'Dashboard';
  if (itemId === 'Budget') return page === 'Budget' || page === 'BudgetDashboard';
  if (itemId === 'BusinessDashboard') return page === 'BusinessDashboard';
  if (itemId === 'Mer') return MER_ACTIVE_PAGES.has(page);
  return page === itemId;
}
