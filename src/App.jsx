import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import PageSeo from '@/components/PageSeo'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Landing from './pages/Landing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ModeProvider } from '@/components/modes/ModeContext';
import BusinessTheme from '@/components/business/BusinessTheme';
import BusinessDashboard from './pages/BusinessDashboard';
import BusinessOnboarding from './pages/BusinessOnboarding';
import LedgerVault from './pages/LedgerVault';
import Import from './pages/Import';
import BudgetDashboard from './pages/BudgetDashboard';
import Social from './pages/Social';
import Galaxy from './pages/Galaxy';
import YearEndClosing from './pages/YearEndClosing';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import { DemoProvider } from '@/components/demo/DemoMode';
import DashboardSkeleton from '@/components/loading/DashboardSkeleton';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const PUBLIC_PATHS = new Set([
  '/',
  '/Landing',
  '/Login',
  '/SignIn',
  '/CreateAccount',
  '/Onboarding',
  '/BusinessOnboarding',
  '/PrivacyPolicy',
  '/TermsOfService',
  '/Pricing',
]);

function isPublicPath(pathname) {
  return PUBLIC_PATHS.has(pathname);
}

const NO_LAYOUT_PAGES = new Set(['Login', 'CreateAccount']);

const AuthenticatedApp = () => {
  const location = useLocation();
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return <DashboardSkeleton />;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required' && !isPublicPath(location.pathname)) {
      return <Landing />;
    }
  }

  return (
    <Routes>
      <Route path="/Login" element={<Login />} />
      <Route path="/SignIn" element={<Login />} />
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).filter(([path]) => path !== 'Login').map(([path, Page]) => {
        const element = NO_LAYOUT_PAGES.has(path)
          ? <Page />
          : (
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          );
        return (
          <Route
            key={path}
            path={`/${path}`}
            element={element}
          />
        );
      })}
      {/* Djupvyer — inte i bottennav */}
      <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
      <Route path="/TermsOfService" element={<TermsOfService />} />
      <Route path="/Pricing" element={<Pricing />} />
      <Route path="/BusinessDashboard" element={
        <LayoutWrapper currentPageName="BusinessDashboard">
          <BusinessDashboard />
        </LayoutWrapper>
      } />
      <Route path="/BusinessOnboarding" element={<BusinessOnboarding />} />
      <Route path="/LedgerVault" element={
        <LayoutWrapper currentPageName="LedgerVault">
          <LedgerVault />
        </LayoutWrapper>
      } />
      <Route path="/Import" element={<Import />} />
      <Route path="/Budget" element={
        <LayoutWrapper currentPageName="BudgetDashboard">
          <BudgetDashboard />
        </LayoutWrapper>
      } />
      <Route path="/Social" element={
        <LayoutWrapper currentPageName="Social">
          <Social />
        </LayoutWrapper>
      } />
      <Route path="/Galaxy" element={
        <LayoutWrapper currentPageName="Galaxy">
          <Galaxy />
        </LayoutWrapper>
      } />
      <Route path="/Jamfor" element={
        <LayoutWrapper currentPageName="Galaxy">
          <Galaxy />
        </LayoutWrapper>
      } />
      <Route path="/YearEndClosing" element={<YearEndClosing />} />
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
