import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { parentsApi } from './parents.api';
import { queryKeys } from '@/lib/query';
import type { ParentFeesParams, ParentOrdersParams } from '@/types';

export function useParentDashboard(parentUserId: string) {
  return useQuery({
    queryKey: [...queryKeys.parents.dashboard(), parentUserId],
    queryFn: () => parentsApi.getDashboard(parentUserId),
    enabled: !!parentUserId,
  });
}

export function useParentChildren(parentUserId: string) {
  return useQuery({
    queryKey: [...queryKeys.parents.children(), parentUserId],
    queryFn: () => parentsApi.getChildren(parentUserId),
    enabled: !!parentUserId,
  });
}

export function useParentFees(parentUserId: string, params?: ParentFeesParams) {
  return useQuery({
    queryKey: [...queryKeys.parents.fees(params), parentUserId],
    queryFn: () => parentsApi.getFees(parentUserId, params),
    placeholderData: keepPreviousData,
    enabled: !!parentUserId,
  });
}

export function useParentOrders(parentUserId: string, params?: ParentOrdersParams) {
  return useQuery({
    queryKey: [...queryKeys.parents.orders(params), parentUserId],
    queryFn: () => parentsApi.getOrders(parentUserId, params),
    placeholderData: keepPreviousData,
    enabled: !!parentUserId,
  });
}
