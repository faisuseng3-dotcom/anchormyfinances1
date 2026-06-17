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
import Subscriptions from './pages/Subscriptions';
import FuturePulse from './pages/FuturePulse';
import Landing from './pages/Landing';
import Loans from './pages/Loans';
import PurchaseSimulator from './pages/PurchaseSimulator';
import TravelPlanner from './pages/TravelPlanner';
import SecurityInfo from './pages/SecurityInfo';
import YearEndClosing from './pages/YearEndClosing';
import SavingsGoals from './pages/SavingsGoals';
import Squads from './pages/Squads';
import AnchorAcademy from './pages/AnchorAcademy';
import AnchorAnalysis from './pages/AnchorAnalysis';
import Insights from './pages/Insights';
import Pricing from './pages/Pricing';
import Mer from './pages/Mer';
import Social from './pages/Social';
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
  Subscriptions,
  FuturePulse,
  Landing,
  Loans,
  PurchaseSimulator,
  TravelPlanner,
  SecurityInfo,
  SavingsGoals,
  Squads,
  AnchorAcademy,
  AnchorAnalysis,
  Insights,
  Pricing,
  YearEndClosing,
  Mer,
  Social,
};

export const pagesConfig = {
  mainPage: 'Landing',
  Pages: PAGES,
  Layout: __Layout,
};
