import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { studentsApi } from './students.api';
import { queryKeys } from '@/lib/query';
import { useUIStore } from '@/stores/ui.store';
import type {
  StudentListParams,
  CreateStudentData,
  UpdateStudentData,
  ChangeStudentStatusData,
} from '@/types';

// --- Queries ---

export function useStudents(params?: StudentListParams) {
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);
  return useQuery({
    queryKey: queryKeys.students.list({ ...params, schoolId: activeSchoolId }),
    queryFn: () => studentsApi.getStudents(params),
    placeholderData: keepPreviousData,
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: queryKeys.students.detail(id),
    queryFn: () => studentsApi.getStudentById(id),
    enabled: !!id,
  });
}

// --- Mutations ---

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudentData) => studentsApi.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success('Student created successfully');
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentData }) =>
      studentsApi.updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success('Student updated successfully');
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentsApi.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success('Student deleted successfully');
    },
  });
}

export function useChangeStudentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangeStudentStatusData }) =>
      studentsApi.changeStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success('Student status updated');
    },
  });
}

export function useEnrollParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: string; data: Record<string, unknown> }) =>
      studentsApi.enrollParent(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success('Parent enrolled successfully');
    },
  });
}

export function useUnlinkParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, parentUserId }: { studentId: string; parentUserId: string }) =>
      studentsApi.unlinkParent(studentId, parentUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success('Parent unlinked successfully');
    },
  });
}
