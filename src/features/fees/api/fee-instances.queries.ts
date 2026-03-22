import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { feeInstancesApi } from './fee-instances.api';
import { queryKeys } from '@/lib/query';
import { useUIStore } from '@/stores/ui.store';
import type { FeeInstanceListParams } from '@/types';

export function useFeeInstances(params?: FeeInstanceListParams) {
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);
  return useQuery({
    queryKey: queryKeys.feeInstances.list({ ...params, schoolId: activeSchoolId }),
    queryFn: () => feeInstancesApi.getFeeInstances(params),
    placeholderData: keepPreviousData,
  });
}

export function useFeeInstance(id: string) {
  return useQuery({
    queryKey: queryKeys.feeInstances.detail(id),
    queryFn: () => feeInstancesApi.getFeeInstanceById(id),
    enabled: !!id,
  });
}
