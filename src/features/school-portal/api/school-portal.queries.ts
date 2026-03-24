import { useQuery } from '@tanstack/react-query';
import { schoolPortalApi } from './school-portal.api';

export const schoolPortalKeys = {
  all: ['school-portal'] as const,
  setupStatus: (schoolId: string) => [...schoolPortalKeys.all, 'setup-status', schoolId] as const,
  dashboard: (schoolId: string) => [...schoolPortalKeys.all, 'dashboard', schoolId] as const,
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
