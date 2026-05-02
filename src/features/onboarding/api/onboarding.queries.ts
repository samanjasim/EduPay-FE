import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/stores';
import { onboardingApi } from './onboarding.api';
import { queryKeys } from '@/lib/query/keys';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/stores';

export function useParentOnboarding() {
  const language = useUIStore((s) => s.language);
  return useQuery({
    queryKey: ['onboarding', 'parent', language],
    queryFn: () => onboardingApi.getParent(language),
    staleTime: 60 * 60 * 1000, // 1 hour — slides change rarely
  });
}

export function useCompleteParentOnboarding() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (version: string) => onboardingApi.completeParent(version),
    onSuccess: async () => {
      // Refetch /me so client-side state reflects the new flag and never re-shows onboarding.
      const fresh = await authApi.getMe();
      setUser(fresh);
      queryClient.setQueryData(queryKeys.auth.me(), fresh);
    },
  });
}
