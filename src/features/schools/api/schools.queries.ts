import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { schoolsApi } from './schools.api';
import { queryKeys } from '@/lib/query';
import type {
  SchoolListParams,
  CreateSchoolData,
  UpdateSchoolData,
  UpdateSchoolStatusData,
  UpdateSchoolSettingsData,
  AssignSchoolAdminData,
} from '@/types';

// --- Queries ---

export function useSchools(params?: SchoolListParams) {
  return useQuery({
    queryKey: queryKeys.schools.list(params),
    queryFn: () => schoolsApi.getSchools(params),
    placeholderData: keepPreviousData,
  });
}

export function useSchool(id: string) {
  return useQuery({
    queryKey: queryKeys.schools.detail(id),
    queryFn: () => schoolsApi.getSchoolById(id),
    enabled: !!id,
  });
}

export function useMySchool() {
  return useQuery({
    queryKey: queryKeys.schools.mySchool(),
    queryFn: () => schoolsApi.getMySchool(),
  });
}

// --- Mutations ---

export function useCreateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSchoolData) => schoolsApi.createSchool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.all });
      toast.success('School created successfully');
    },
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSchoolData }) =>
      schoolsApi.updateSchool(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.all });
      toast.success('School updated successfully');
    },
  });
}

export function useUpdateSchoolStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSchoolStatusData }) =>
      schoolsApi.updateSchoolStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.all });
      toast.success('School status updated');
    },
  });
}

export function useUpdateSchoolSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSchoolSettingsData }) =>
      schoolsApi.updateSchoolSettings(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.all });
      toast.success('School settings updated');
    },
  });
}

export function useAssignSchoolAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, data }: { schoolId: string; data: AssignSchoolAdminData }) =>
      schoolsApi.assignAdmin(schoolId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.all });
      toast.success('Admin assigned successfully');
    },
  });
}

export function useRemoveSchoolAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, userId }: { schoolId: string; userId: string }) =>
      schoolsApi.removeAdmin(schoolId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.all });
      toast.success('Admin removed successfully');
    },
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schoolsApi.deleteSchool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.all });
      toast.success('School deleted successfully');
    },
  });
}
