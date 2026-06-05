import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDemoMode } from '@/components/demo/DemoMode';
import { prefetchDashboardHub } from '@/lib/prefetchHub';

/**
 * Laddar Budget, Historik/insikter och Planera i bakgrunden när Hem är redo.
 */
export function useDashboardPrefetch(profile) {
  const queryClient = useQueryClient();
  const { isDemoMode } = useDemoMode();
  const startedFor = useRef(null);

  useEffect(() => {
    if (!profile?.id || isDemoMode) return;
    if (startedFor.current === profile.id) return;
    startedFor.current = profile.id;
    prefetchDashboardHub(queryClient, { profile, isDemoMode });
  }, [profile?.id, isDemoMode, queryClient]);
}
