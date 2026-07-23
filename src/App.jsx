import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import PageSeo from '@/components/PageSeo'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ModeProvider } from '@/components/modes/ModeContext';
import BusinessTheme from '@/components/business/BusinessTheme';
import BusinessDashboard from './pages/BusinessDashboard';
import BusinessOnboarding from './pages/BusinessOnboarding';
import Import from './pages/Import';
import BudgetDashboard from './pages/BudgetDashboard';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { DemoProvider } from '@/components/demo/DemoMode';
import DashboardSkeleton from '@/components/loading/DashboardSkeleton';
import { LEGACY_REDIRECTS } from '@/lib/appStructure';
import { isPublicPath, loginPathWithReturn, GUEST_MODE_ONLY } from '@/lib/authRoutes';
import {
  RequireAuth,
  RequireGuestForSignup,
  RequireGuestForAuth,
  RequireOnboardingAccess,
  RequireBusinessOnboardingAccess,
} from '@/components/auth/AuthRouteGuards';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AUTH_GUEST_PAGES = new Set(['Login', 'ForgotPassword', 'ResetPassword']);
const SIGNUP_PAGE = 'CreateAccount';
const ONBOARDING_PAGE = 'Onboarding';

function wrapPage(path, Page) {
  // Inloggning tillfälligt avstängd (GUEST_MODE_ONLY i authRoutes.js) — dessa
  // sidor finns kvar men är inte nåbara förrän flaggan slås av igen.
  if (GUEST_MODE_ONLY && (AUTH_GUEST_PAGES.has(path) || path === SIGNUP_PAGE)) {
    return <Navigate to="/Dashboard" replace />;
  }

  if (AUTH_GUEST_PAGES.has(path)) {
    return (
      <RequireGuestForAuth>
        <Page />
      </RequireGuestForAuth>
    );
  }

  if (path === SIGNUP_PAGE) {
    return (
      <RequireGuestForSignup>
        <Page />
      </RequireGuestForSignup>
    );
  }

  if (path === ONBOARDING_PAGE) {
    return (
      <RequireOnboardingAccess>
        <Page />
      </RequireOnboardingAccess>
    );
  }

  if (path === 'Landing') {
    return <Page />;
  }

  return (
    <RequireAuth>
      <LayoutWrapper currentPageName={path}>
        <Page />
      </LayoutWrapper>
    </RequireAuth>
  );
}

const AuthenticatedApp = () => {
  const location = useLocation();
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return <DashboardSkeleton />;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    if (authError.type === 'auth_required' && !isPublicPath(location.pathname)) {
      return (
        <Navigate
          to={loginPathWithReturn(location.pathname, location.search)}
          replace
        />
      );
    }
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to="/Dashboard" replace />
            : <Navigate to="/Landing" replace />
        }
      />
      <Route path="/Login" element={wrapPage('Login', Login)} />
      <Route path="/SignIn" element={<Navigate to="/Login" replace />} />
      <Route path="/ForgotPassword" element={wrapPage('ForgotPassword', ForgotPassword)} />
      <Route path="/ResetPassword" element={wrapPage('ResetPassword', ResetPassword)} />
      {Object.entries(Pages).filter(([path]) => path !== 'Login').map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={wrapPage(path, Page)}
        />
      ))}
      {Object.entries(LEGACY_REDIRECTS).map(([page, to]) => (
        <Route
          key={`legacy-${page}`}
          path={`/${page}`}
          element={<Navigate to={to} replace />}
        />
      ))}
      <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
      <Route path="/TermsOfService" element={<TermsOfService />} />
      <Route path="/BusinessDashboard" element={
        <RequireAuth>
          <LayoutWrapper currentPageName="BusinessDashboard">
            <BusinessDashboard />
          </LayoutWrapper>
        </RequireAuth>
      } />
      <Route path="/BusinessOnboarding" element={
        <RequireBusinessOnboardingAccess>
          <BusinessOnboarding />
        </RequireBusinessOnboardingAccess>
      } />
      <Route path="/Import" element={
        <RequireAuth>
          <LayoutWrapper currentPageName="Import">
            <Import />
          </LayoutWrapper>
        </RequireAuth>
      } />
      <Route path="/Budget" element={
        <RequireAuth>
          <LayoutWrapper currentPageName="BudgetDashboard">
            <BudgetDashboard />
          </LayoutWrapper>
        </RequireAuth>
      } />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <DemoProvider>
  <ModeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <BusinessTheme />
            <PageSeo />
            <NavigationTracker />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ModeProvider>
  </DemoProvider>
  )
}

export default App