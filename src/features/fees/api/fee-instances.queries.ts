import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { feeInstancesApi } from './fee-instances.api';
import { queryKeys } from '@/lib/query';
import { useUIStore } from '@/stores/ui.store';
import type { FeeInstanceListParams, PayFeeWithCashData } from '@/types';

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

export function useApplyDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { discountAmount: number; reason: string } }) =>
      feeInstancesApi.applyDiscount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feeInstances.all });
      toast.success('Discount applied successfully');
    },
  });
}

export function useWaiveFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { reason: string } }) =>
      feeInstancesApi.waiveFee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feeInstances.all });
      toast.success('Fee waived successfully');
    },
  });
}

export function useCancelFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { reason: string } }) =>
      feeInstancesApi.cancelFee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feeInstances.all });
      toast.success('Fee cancelled successfully');
    },
  });
}

export function usePayFeeWithCash() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, schoolId }: { id: string; data: PayFeeWithCashData; schoolId?: string }) =>
      feeInstancesApi.payWithCash(id, data, schoolId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feeInstances.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success(`Cash payment recorded. Receipt: ${result.receiptNumber}`);
    },
  });
}

export function useDetectOverdue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => feeInstancesApi.detectOverdue(),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feeInstances.all });
      toast.success(`${count} fees marked as overdue`);
    },
  });
}
