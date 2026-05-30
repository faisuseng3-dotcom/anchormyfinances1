const STORAGE_PREFIX = 'anchor_planned_events_';

export function loadLocalPlannedEvents(profileId) {
  if (!profileId || typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${profileId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalPlannedEvents(profileId, events) {
  if (!profileId || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${profileId}`, JSON.stringify(events || []));
  } catch {
    /* quota / private mode */
  }
}

export function mergePlannedEvents(profile) {
  const fromProfile = profile?.plannedEvents;
  if (Array.isArray(fromProfile) && fromProfile.length > 0) return fromProfile;
  return loadLocalPlannedEvents(profile?.id);
}
