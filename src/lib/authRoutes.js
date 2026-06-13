/** Publika sidor — ingen inloggning krävs. */
export const PUBLIC_PATHS = new Set([
  '/',
  '/Landing',
  '/Login',
  '/SignIn',
  '/CreateAccount',
  '/ForgotPassword',
  '/ResetPassword',
  '/PrivacyPolicy',
  '/TermsOfService',
]);

export function isPublicPath(pathname) {
  return PUBLIC_PATHS.has(pathname);
}

export function loginPathWithReturn(pathname, search = '') {
  const returnPath = `${pathname}${search || ''}`;
  return `/Login?return=${encodeURIComponent(returnPath)}`;
}
