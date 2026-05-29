import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useDemoMode } from '@/components/demo/DemoMode';
import { isGuestMode, loadGuestProfile } from '@/components/guestStorage';
/**
 * Single source for the active financial profile (API, guest, or demo/Alex preview).
 * Demo edits are kept in memory; real users persist via Base44.
 */
export function useFinancialProfile(options = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const { isDemoMode, demoProfile } = useDemoMode();
  const [demoPatches, setDemoPatches] = useState({});

  const query = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      if (isGuestMode()) return loadGuestProfile() || null;
      const profiles = await base44.entities.FinancialProfile.list();
      if (profiles.length > 0) return profiles[0];
      return null;
    },
    enabled: enabled && !isDemoMode,
  });

  const profile = useMemo(() => {
    if (isDemoMode) return { ...demoProfile, ...demoPatches };
    return query.data ?? null;
  }, [isDemoMode, demoProfile, demoPatches, query.data]);

  const updateProfile = useCallback(
    async (patch) => {
      if (isDemoMode) {
        setDemoPatches((prev) => ({ ...prev, ...patch }));
        return;
      }
      const id = query.data?.id;
      if (!id) return;
      await base44.entities.FinancialProfile.update(id, patch);
      await queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
    },
    [isDemoMode, query.data?.id, queryClient],
  );

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
  }, [queryClient]);

  return {
    profile,
    isLoading: !isDemoMode && query.isLoading,
    isDemoMode,
    isPersisted: !isDemoMode && Boolean(query.data?.id),
    updateProfile,
    invalidate,
    refetch: query.refetch,
  };
}
