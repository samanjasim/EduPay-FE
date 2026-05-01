import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore, selectUser, useUIStore } from '@/stores';
import { schoolsApi } from '@/features/schools/api';
import type { SchoolDto } from '@/types';

const SCHOOL_CONTEXT_KEY = ['school-portal', 'my-school'] as const;

export function useSchoolContext() {
  const user = useAuthStore(selectUser);
  const setActiveSchoolId = useUIStore((state) => state.setActiveSchoolId);
  const activeSchoolId = useUIStore((state) => state.activeSchoolId);

  const isSchoolAdmin = user?.roles?.includes('SchoolAdmin') ?? false;
  const isCashCollector = user?.roles?.includes('CashCollector') ?? false;
  const isSchoolStaff = isSchoolAdmin || isCashCollector;

  const { data: school, isLoading, error } = useQuery<SchoolDto>({
    queryKey: SCHOOL_CONTEXT_KEY,
    queryFn: () => schoolsApi.getMySchool(),
    enabled: isSchoolStaff,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Auto-set activeSchoolId when school is loaded
  useEffect(() => {
    if (school?.id && school.id !== activeSchoolId) {
      setActiveSchoolId(school.id);
    }
  }, [school?.id, activeSchoolId, setActiveSchoolId]);

  return {
    school,
    schoolId: school?.id ?? activeSchoolId,
    isLoading,
    error,
    isSchoolAdmin,
    isCashCollector,
    isSchoolStaff,
  };
}
