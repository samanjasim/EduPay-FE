import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/stores';
import { queryKeys } from '@/lib/query/keys';
import {
  parentPortalApi,
  type ConfirmChangePhonePayload,
  type RequestChangePhonePayload,
} from './parent-portal.api';

const KEYS = {
  homeDashboard: (activeChildId?: string | null) =>
    ['parent-portal', 'home', activeChildId ?? null] as const,
  childDetail: (childId: string) => ['parent-portal', 'child', childId] as const,
};

export function useParentHomeDashboard(activeChildId?: string | null) {
  return useQuery({
    queryKey: KEYS.homeDashboard(activeChildId),
    queryFn: () => parentPortalApi.getHomeDashboard(activeChildId),
    staleTime: 30 * 1000,
  });
}

export function useParentChildDetail(childId: string | undefined) {
  return useQuery({
    queryKey: childId ? KEYS.childDetail(childId) : ['parent-portal', 'child', 'noop'],
    queryFn: () => parentPortalApi.getChildDetail(childId!),
    enabled: !!childId,
    staleTime: 30 * 1000,
  });
}

export function useMarkFeeTypeSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feeTypeId: string) => parentPortalApi.markFeeTypeSeen(feeTypeId),
    onSuccess: () => {
      // Invalidate every cached dashboard variant so the unseen-change dot clears immediately.
      queryClient.invalidateQueries({ queryKey: ['parent-portal', 'home'] });
    },
  });
}

export function useRequestChangePhoneOtp() {
  return useMutation({
    mutationFn: (payload: RequestChangePhonePayload) =>
      parentPortalApi.requestChangePhoneOtp(payload),
  });
}

export function useConfirmChangePhone() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (payload: ConfirmChangePhonePayload) => parentPortalApi.confirmChangePhone(payload),
    onSuccess: async () => {
      const fresh = await authApi.getMe();
      setUser(fresh);
      queryClient.setQueryData(queryKeys.auth.me(), fresh);
      queryClient.invalidateQueries({ queryKey: ['parent-portal'] });
      toast.success('Phone updated.');
    },
  });
}
