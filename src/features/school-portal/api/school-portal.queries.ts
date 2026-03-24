import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { schoolPortalApi } from './school-portal.api';

import type { InviteStaffData } from '@/types/school-portal.types';

export const schoolPortalKeys = {
  all: ['school-portal'] as const,
  setupStatus: (schoolId: string) => [...schoolPortalKeys.all, 'setup-status', schoolId] as const,
  dashboard: (schoolId: string) => [...schoolPortalKeys.all, 'dashboard', schoolId] as const,
  staff: (schoolId: string) => [...schoolPortalKeys.all, 'staff', schoolId] as const,
};

export function useSchoolSetupStatus(schoolId: string | undefined) {
  return useQuery({
    queryKey: schoolPortalKeys.setupStatus(schoolId!),
    queryFn: () => schoolPortalApi.getSetupStatus(schoolId!),
    enabled: !!schoolId,
  });
}

export function useSchoolDashboard(schoolId: string | undefined) {
  return useQuery({
    queryKey: schoolPortalKeys.dashboard(schoolId!),
    queryFn: () => schoolPortalApi.getDashboard(schoolId!),
    enabled: !!schoolId,
  });
}

export function useSchoolStaff(schoolId: string | undefined) {
  return useQuery({
    queryKey: schoolPortalKeys.staff(schoolId!),
    queryFn: () => schoolPortalApi.getStaff(schoolId!),
    enabled: !!schoolId,
  });
}

export function useInviteStaff(schoolId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteStaffData) => schoolPortalApi.inviteStaff(schoolId!, data),
    onSuccess: () => {
      if (schoolId) {
        queryClient.invalidateQueries({ queryKey: schoolPortalKeys.staff(schoolId) });
      }
      toast.success('Staff member invited successfully');
    },
  });
}

export function useRemoveStaff(schoolId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => schoolPortalApi.removeStaff(schoolId!, userId),
    onSuccess: () => {
      if (schoolId) {
        queryClient.invalidateQueries({ queryKey: schoolPortalKeys.staff(schoolId) });
      }
      toast.success('Staff member removed');
    },
  });
}

export function useCompleteSetup(schoolId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => schoolPortalApi.completeSetup(schoolId!),
    onSuccess: () => {
      if (schoolId) {
        queryClient.invalidateQueries({ queryKey: schoolPortalKeys.setupStatus(schoolId) });
      }
    },
    onError: () => {
      toast.error('Failed to mark setup as complete');
    },
  });
}
