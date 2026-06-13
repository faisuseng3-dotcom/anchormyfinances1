/** Svenska felmeddelanden för Base44 auth. */
export function mapAuthError(error) {
  const status = error?.status ?? error?.response?.status;
  const msg = (error?.message || error?.data?.message || '').toLowerCase();

  if (status === 401 || msg.includes('invalid credentials') || msg.includes('incorrect')) {
    return 'Fel e-post eller lösenord. Försök igen.';
  }
  if (status === 403 && (msg.includes('verified') || msg.includes('otp') || msg.includes('verification'))) {
    return 'E-postadressen är inte verifierad än. Kolla inkorgen efter en kod.';
  }
  if (status === 400 && msg.includes('password')) {
    return 'Lösenordet uppfyller inte kraven. Använd minst 8 tecken.';
  }
  if (status === 400 && (msg.includes('otp') || msg.includes('code'))) {
    return 'Ogiltig eller utgången kod. Begär en ny och försök igen.';
  }
  if (status === 409 || msg.includes('already exists') || msg.includes('already registered')) {
    return 'Det finns redan ett konto med den e-postadressen. Logga in i stället.';
  }
  if (status === 429) {
    return 'För många försök. Vänta en stund och försök igen.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Kunde inte nå servern. Kontrollera nätverket och försök igen.';
  }

  return error?.message || 'Något gick fel. Försök igen.';
}
