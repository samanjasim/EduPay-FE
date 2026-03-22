import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { feeTypesApi } from './fee-types.api';
import { queryKeys } from '@/lib/query';
import type {
  FeeTypeListParams,
  CreateFeeTypeData,
  UpdateFeeTypeData,
  ToggleStatusData,
} from '@/types';

// --- Queries ---

export function useFeeTypes(params?: FeeTypeListParams) {
  return useQuery({
    queryKey: queryKeys.feeTypes.list(params),
    queryFn: () => feeTypesApi.getFeeTypes(params),
    placeholderData: keepPreviousData,
  });
}

export function useFeeType(id: string) {
  return useQuery({
    queryKey: queryKeys.feeTypes.detail(id),
    queryFn: () => feeTypesApi.getFeeTypeById(id),
    enabled: !!id,
  });
}

// --- Mutations ---

export function useCreateFeeType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFeeTypeData) => feeTypesApi.createFeeType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feeTypes.all });
      toast.success('Fee type created successfully');
    },
  });
}

export function useUpdateFeeType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeeTypeData }) =>
      feeTypesApi.updateFeeType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feeTypes.all });
      toast.success('Fee type updated successfully');
    },
  });
}

export function useDeleteFeeType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => feeTypesApi.deleteFeeType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feeTypes.all });
      toast.success('Fee type deleted successfully');
    },
  });
}

export function useToggleFeeTypeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ToggleStatusData }) =>
      feeTypesApi.toggleFeeTypeStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feeTypes.all });
      toast.success('Fee type status updated');
    },
  });
}
