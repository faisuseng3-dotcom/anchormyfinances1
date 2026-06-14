/** Dev/test: /Onboarding?testFoundations=1 öppnar grundkurs-quiz direkt. */
export function isFoundationTestMode(searchParams) {
  if (!searchParams) return false;
  const v = searchParams.get('testFoundations');
  return v === '1' || v === 'true';
}
