import { useCallback, useMemo } from 'react';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { loadLocalPlannedEvents, saveLocalPlannedEvents, mergePlannedEvents } from '@/lib/plannedEventsStorage';

export function usePlannedEvents() {
  const { profile, updateProfile } = useFinancialProfile();

  const plannedEvents = useMemo(
    () => mergePlannedEvents(profile),
    [profile, profile?.plannedEvents, profile?.id],
  );

  const profileWithEvents = useMemo(
    () => (profile ? { ...profile, plannedEvents } : null),
    [profile, plannedEvents],
  );

  const savePlannedEvents = useCallback(
    async (events) => {
      if (profile?.id) {
        saveLocalPlannedEvents(profile.id, events);
      }
      try {
        if (profile?.id && updateProfile) {
          await updateProfile({ plannedEvents: events });
        }
      } catch (err) {
        console.warn('Kunde inte spara planerade händelser till profil, använder lokal backup:', err?.message);
      }
    },
    [profile?.id, updateProfile],
  );

  const syncFromLocalIfEmpty = useCallback(async () => {
    if (!profile?.id) return;
    const local = loadLocalPlannedEvents(profile.id);
    const remote = profile.plannedEvents || [];
    if (local.length > 0 && remote.length === 0 && updateProfile) {
      try {
        await updateProfile({ plannedEvents: local });
      } catch {
        /* schema not deployed yet — local backup is enough */
      }
    }
  }, [profile?.id, profile?.plannedEvents, updateProfile]);

  return {
    plannedEvents,
    profileWithEvents,
    savePlannedEvents,
    syncFromLocalIfEmpty,
  };
}
