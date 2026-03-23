import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parentsApi } from './parents.api';
import { queryKeys } from '@/lib/query';
import type { EnrollParentData, LinkParentData, UpdateParentData, ParentListParams, EnrollParentResult } from '@/types';
import { useUIStore } from '@/stores';

export function useParents(params?: ParentListParams) {
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);
  return useQuery({
    queryKey: queryKeys.parents.list({ ...params, schoolId: activeSchoolId }),
    queryFn: () => parentsApi.getParents(params),
    placeholderData: keepPreviousData,
  });
}

export function useEnrollParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: string; data: EnrollParentData }) =>
      parentsApi.enrollParent(studentId, data),
    onSuccess: (_result: EnrollParentResult) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.parents.all });
    },
  });
}

export function useLinkParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: string; data: LinkParentData }) =>
      parentsApi.linkParent(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.parents.all });
      toast.success('Parent linked successfully');
    },
  });
}

export function useUnlinkParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, parentUserId }: { studentId: string; parentUserId: string }) =>
      parentsApi.unlinkParent(studentId, parentUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.parents.all });
      toast.success('Parent unlinked successfully');
    },
  });
}

export function useUpdateParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ parentUserId, data }: { parentUserId: string; data: UpdateParentData }) =>
      parentsApi.updateParent(parentUserId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parents.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success('Parent updated successfully');
    },
  });
}
