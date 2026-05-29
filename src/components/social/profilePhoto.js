/** URL till uppladdad profilbild (SocialProfile). */
export function profilePhotoUrl(profile) {
  if (!profile) return null;
  return profile.profile_photo_url || profile.avatar_url || null;
}
