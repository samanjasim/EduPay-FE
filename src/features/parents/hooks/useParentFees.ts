import { useQuery } from '@tanstack/react-query';
import { parentFeesApi } from '../api/parentFees.api';
import { queryKeys } from '@/lib/query';

export function useParentFees() {
  return useQuery({
    queryKey: queryKeys.parents.fees(),
    queryFn: () => parentFeesApi.getParentFees(),
  });
}
