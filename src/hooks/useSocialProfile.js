import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useSocialProfile(options = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['socialProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const results = await base44.entities.SocialProfile.filter({ user_id: user.id });
      return results[0] || null;
    },
    enabled,
  });

  const saveSocialProfile = useCallback(
    async (patch) => {
      const user = await base44.auth.me();
      if (query.data?.id) {
        await base44.entities.SocialProfile.update(query.data.id, patch);
      } else {
        await base44.entities.SocialProfile.create({ ...patch, user_id: user.id });
      }
      await queryClient.invalidateQueries({ queryKey: ['socialProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['galaxyProfiles'] });
    },
    [query.data?.id, queryClient],
  );

  return {
    socialProfile: query.data ?? null,
    isLoading: query.isLoading,
    saveSocialProfile,
    refetch: query.refetch,
  };
}
