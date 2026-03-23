import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { gradesApi } from './grades.api';
import { queryKeys } from '@/lib/query';
import { useUIStore } from '@/stores/ui.store';
import type {
  GradeListParams,
  CreateGradeData,
  UpdateGradeData,
  AddSectionData,
  UpdateSectionData,
  ToggleStatusData,
} from '@/types';

// --- Queries ---

export function useGrades(params?: GradeListParams) {
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);
  return useQuery({
    queryKey: queryKeys.grades.list({ ...params, schoolId: activeSchoolId }),
    queryFn: () => gradesApi.getGrades(params),
    placeholderData: keepPreviousData,
  });
}

export function useGrade(id: string) {
  return useQuery({
    queryKey: queryKeys.grades.detail(id),
    queryFn: () => gradesApi.getGradeById(id),
    enabled: !!id,
  });
}

// --- Grade Mutations ---

export function useCreateGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGradeData) => gradesApi.createGrade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grades.all });
      toast.success('Grade created successfully');
    },
  });
}

export function useUpdateGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGradeData }) =>
      gradesApi.updateGrade(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grades.all });
      toast.success('Grade updated successfully');
    },
  });
}

export function useDeleteGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gradesApi.deleteGrade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grades.all });
      toast.success('Grade deleted successfully');
    },
  });
}

export function useToggleGradeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ToggleStatusData }) =>
      gradesApi.toggleGradeStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grades.all });
      toast.success('Grade status updated');
    },
  });
}

// --- Section Mutations ---

export function useAddSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gradeId, data }: { gradeId: string; data: AddSectionData }) =>
      gradesApi.addSection(gradeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grades.all });
      toast.success('Section added successfully');
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gradeId, sectionId, data }: { gradeId: string; sectionId: string; data: UpdateSectionData }) =>
      gradesApi.updateSection(gradeId, sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grades.all });
      toast.success('Section updated successfully');
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gradeId, sectionId }: { gradeId: string; sectionId: string }) =>
      gradesApi.deleteSection(gradeId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grades.all });
      toast.success('Section deleted successfully');
    },
  });
}

export function useToggleSectionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gradeId, sectionId, data }: { gradeId: string; sectionId: string; data: ToggleStatusData }) =>
      gradesApi.toggleSectionStatus(gradeId, sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grades.all });
      toast.success('Section status updated');
    },
  });
}
