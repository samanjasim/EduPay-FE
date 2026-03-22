import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { feeStructuresApi } from './fee-structures.api';
import { queryKeys } from '@/lib/query';
import { useUIStore } from '@/stores/ui.store';
import type {
  FeeStructureListParams,
  CreateFeeStructureData,
  UpdateFeeStructureData,
  UpdateFeeStructureStatusData,
} from '@/types';

// --- Queries ---

export function useFeeStructures(params?: FeeStructureListParams) {
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);
  return useQuery({
    queryKey: queryKeys.feeStructures.list({ ...params, schoolId: activeSchoolId }),
    queryFn: () => feeStructuresApi.getFeeStructures(params),
    placeholderData: keepPreviousData,
  });
}

export function useFeeStructure(id: string) {
  return useQuery({
    queryKey: queryKeys.feeStructures.detail(id),
    queryFn: () => feeStructuresApi.getFeeStructureById(id),
    enabled: !!id,
  });
}

// --- Mutations ---

export function useCreateFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFeeStructureData) => feeStructuresApi.createFeeStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feeStructures.all });
      toast.success('Fee structure created successfully');
    },
  });
}

export function useUpdateFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeeStructureData }) =>
      feeStructuresApi.updateFeeStructure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feeStructures.all });
      toast.success('Fee structure updated successfully');
    },
  });
}

export function useDeleteFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => feeStructuresApi.deleteFeeStructure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feeStructures.all });
      toast.success('Fee structure deleted successfully');
    },
  });
}

export function useUpdateFeeStructureStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeeStructureStatusData }) =>
      feeStructuresApi.updateFeeStructureStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feeStructures.all });
      toast.success('Fee structure status updated');
    },
  });
}
