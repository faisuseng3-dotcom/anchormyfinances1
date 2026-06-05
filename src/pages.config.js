/**
 * pages.config.js — kärnrouting (6 vyer + auth). Djupvyer registreras i App.jsx.
 */
import CreateAccount from './pages/CreateAccount';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import TransactionHistory from './pages/TransactionHistory';
import ProTools from './pages/ProTools';
import FuturePulse from './pages/FuturePulse';
import Landing from './pages/Landing';
import Loans from './pages/Loans';
import PurchaseSimulator from './pages/PurchaseSimulator';
import TravelPlanner from './pages/TravelPlanner';
import SecurityInfo from './pages/SecurityInfo';
import Pulse from './pages/Pulse';
import WhatIf from './pages/WhatIf';
import Insights from './pages/Insights';
import FinancialHistory from './pages/FinancialHistory';
import ResellScanner from './pages/ResellScanner';
import Optimize from './pages/Optimize';
import Expenses from './pages/Expenses';
import AnchorAcademy from './pages/AnchorAcademy';
import AnchorAnalysis from './pages/AnchorAnalysis';
import Squads from './pages/Squads';
import SavingsGoals from './pages/SavingsGoals';
import __Layout from './Layout.jsx';

export { PAGE_SEO, GLOBAL_PAGE_META, pageSeoFor, sanitizePageTitle } from './lib/pageSeo';

export const PAGES = {
  Login,
  CreateAccount,
  Dashboard,
  Onboarding,
  Settings,
  TransactionHistory,
  ProTools,
  FuturePulse,
  Landing,
  Loans,
  PurchaseSimulator,
  TravelPlanner,
  SecurityInfo,
  Pulse,
  WhatIf,
  Insights,
  FinancialHistory,
  ResellScanner,
  Optimize,
  Expenses,
  AnchorAcademy,
  AnchorAnalysis,
  Squads,
  SavingsGoals,
};

export const pagesConfig = {
  mainPage: 'Landing',
  Pages: PAGES,
  Layout: __Layout,
};
