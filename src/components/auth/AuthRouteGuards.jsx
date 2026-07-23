import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { isGuestMode, setGuestMode } from '@/components/guestStorage';
import { resolvePostAuthPath, fetchOnboardingProfile, isOnboardingComplete, isPersonalWizardComplete } from '@/lib/authFlow';
import { getDashboardPath, isBusinessMode, isBusinessOnboarded, ensureOnboardingMode } from '@/lib/onboardingRouter';
import { isBusinessUserType } from '@/lib/onboardingWizard';
import { loginPathWithReturn, GUEST_MODE_ONLY } from '@/lib/authRoutes';
import DashboardSkeleton from '@/components/loading/DashboardSkeleton';

/** Kräver inloggning (gästläge tillåts fortfarande). */
export function RequireAuth({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (!isLoadingAuth && !isAuthenticated && GUEST_MODE_ONLY && !isGuestMode()) {
    setGuestMode(true);
  }

  if (isLoadingAuth) return <DashboardSkeleton />;
  if (!isAuthenticated && !isGuestMode()) {
    return (
      <Navigate
        to={loginPathWithReturn(location.pathname, location.search)}
        replace
      />
    );
  }
  return children;
}

/** Login / återställning — redan inloggade skickas vidare. */
export function RequireGuestForAuth({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    resolvePostAuthPath().then(setRedirectTo);
  }, [isAuthenticated]);

  if (isLoadingAuth || (isAuthenticated && !redirectTo)) return <DashboardSkeleton />;
  if (isAuthenticated && redirectTo) return <Navigate to={redirectTo} replace />;
  return children;
}

/** /CreateAccount — endast utloggade. */
export function RequireGuestForSignup({ children }) {
  return <RequireGuestForAuth>{children}</RequireGuestForAuth>;
}

/** /Onboarding — kräver inloggning; klara användare till dashboard. */
export function RequireOnboardingAccess({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [ready, setReady] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    if (isLoadingAuth) return;

    if (!isAuthenticated && !isGuestMode()) {
      if (GUEST_MODE_ONLY) {
        setGuestMode(true);
      } else {
        setRedirectTo(loginPathWithReturn('/Onboarding', ''));
        return;
      }
    }

    if (isGuestMode()) {
      setReady(true);
      return;
    }

    fetchOnboardingProfile().then((profile) => {
      if (isOnboardingComplete(profile)) {
        setRedirectTo(getDashboardPath());
      } else if (isPersonalWizardComplete(profile) && isBusinessUserType(profile.userType)) {
        setRedirectTo('/BusinessOnboarding');
      } else {
        setReady(true);
      }
    });
  }, [isAuthenticated, isLoadingAuth]);

  if (isLoadingAuth || (!ready && !redirectTo)) return <DashboardSkeleton />;
  if (redirectTo) return <Navigate to={redirectTo} replace />;
  return children;
}

/** /BusinessOnboarding — kräver inloggning och företagsgren. */
export function RequireBusinessOnboardingAccess({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [ready, setReady] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    if (isLoadingAuth) return;

    if (!isAuthenticated && !isGuestMode()) {
      if (GUEST_MODE_ONLY) {
        setGuestMode(true);
      } else {
        setRedirectTo(loginPathWithReturn('/BusinessOnboarding', ''));
        return;
      }
    }

    if (!isBusinessMode()) {
      fetchOnboardingProfile().then((profile) => {
        if (!isPersonalWizardComplete(profile)) {
          setRedirectTo('/Onboarding');
        } else if (isBusinessUserType(profile?.userType)) {
          ensureOnboardingMode('business');
          if (isBusinessOnboarded()) {
            setRedirectTo(getDashboardPath('business'));
          } else {
            setReady(true);
          }
        } else {
          setRedirectTo(getDashboardPath('personal'));
        }
      });
      return;
    }

    if (isBusinessOnboarded()) {
      setRedirectTo(getDashboardPath('business'));
      return;
    }

    setReady(true);
  }, [isAuthenticated, isLoadingAuth]);

  if (isLoadingAuth || (!ready && !redirectTo)) return <DashboardSkeleton />;
  if (redirectTo) return <Navigate to={redirectTo} replace />;
  return children;
}
