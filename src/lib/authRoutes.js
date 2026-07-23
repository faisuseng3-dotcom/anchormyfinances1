/**
 * Tillfällig avstängning av inloggning. Login/CreateAccount-sidorna finns kvar
 * i koden men är inte nåbara — besökare landar i appen i gästläge istället.
 * Sätt till false när appen ska ha riktiga användare igen.
 */
export const GUEST_MODE_ONLY = true;

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
