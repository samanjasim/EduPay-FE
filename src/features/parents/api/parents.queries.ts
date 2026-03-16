import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parentsApi } from './parents.api';
import { queryKeys } from '@/lib/query';
import type { CreateParentData, LinkParentData } from '@/types';

export function useCreateParent() {
  return useMutation({
    mutationFn: (data: CreateParentData) => parentsApi.createParent(data),
    onSuccess: () => {
      toast.success('Parent account created successfully');
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
      toast.success('Parent unlinked successfully');
    },
  });
}
