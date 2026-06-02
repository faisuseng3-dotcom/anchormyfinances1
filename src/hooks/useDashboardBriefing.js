import { useCallback, useEffect, useState } from 'react';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { hasAdvisorProfileData } from '@/lib/advisorProfile';
import { buildLocalBriefingFallback } from '@/lib/localBriefingFallback';
import { useAdvisorContext } from '@/hooks/useAdvisorContext';

export function useDashboardBriefing(refreshKey = 0) {
  const { profile, transactions, isDemoMode } = useAdvisorContext();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const load = useCallback(async () => {
    if (!hasAdvisorProfileData(profile)) {
      setLoading(false);
      setBriefing(null);
      return;
    }

    setLoading(true);
    setError(false);
    setUsedFallback(false);

    try {
      const data = await askPersonalAdvisor(
        { scenario: 'dashboard_briefing' },
        { profile, transactions, isDemoMode },
      );

      if (data?.needs_profile && hasAdvisorProfileData(profile)) {
        setBriefing(buildLocalBriefingFallback(profile, transactions));
        setUsedFallback(true);
      } else {
        setBriefing(data);
      }
    } catch {
      setBriefing(buildLocalBriefingFallback(profile, transactions));
      setUsedFallback(true);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [profile, transactions, isDemoMode]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return {
    profile,
    briefing,
    loading,
    error,
    usedFallback,
    retry: load,
    hasProfile: hasAdvisorProfileData(profile),
  };
}
