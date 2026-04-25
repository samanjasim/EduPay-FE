import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ordersApi } from './orders.api';
import { queryKeys } from '@/lib/query';
import { useUIStore } from '@/stores/ui.store';
import type { OrderListParams } from '@/types';

export function useOrders(params?: OrderListParams) {
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);
  return useQuery({
    queryKey: queryKeys.orders.list({ ...params, schoolId: activeSchoolId }),
    queryFn: () => ordersApi.getOrders(params),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !!id,
  });
}
