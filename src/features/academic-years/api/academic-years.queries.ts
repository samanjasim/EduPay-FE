import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { academicYearsApi } from './academic-years.api';
import { queryKeys } from '@/lib/query';
import type {
  AcademicYearListParams,
  CreateAcademicYearData,
  UpdateAcademicYearData,
  LinkSchoolData,
} from '@/types';

// --- Queries ---

export function useAcademicYears(params?: AcademicYearListParams) {
  return useQuery({
    queryKey: queryKeys.academicYears.list(params),
    queryFn: () => academicYearsApi.getAcademicYears(params),
    placeholderData: keepPreviousData,
  });
}

export function useAcademicYear(id: string) {
  return useQuery({
    queryKey: queryKeys.academicYears.detail(id),
    queryFn: () => academicYearsApi.getAcademicYearById(id),
    enabled: !!id,
  });
}

// --- Mutations ---

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAcademicYearData) => academicYearsApi.createAcademicYear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.all });
      toast.success('Academic year created successfully');
    },
  });
}

export function useUpdateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAcademicYearData }) =>
      academicYearsApi.updateAcademicYear(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.all });
      toast.success('Academic year updated successfully');
    },
  });
}

export function useDeleteAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicYearsApi.deleteAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.all });
      toast.success('Academic year deleted successfully');
    },
  });
}

export function useActivateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicYearsApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.all });
      toast.success('Academic year activated');
    },
  });
}

export function useCompleteAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicYearsApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.all });
      toast.success('Academic year completed');
    },
  });
}

export function useSetCurrentAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicYearsApi.setCurrent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.all });
      toast.success('Academic year set as current');
    },
  });
}

export function useLinkSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ academicYearId, data }: { academicYearId: string; data: LinkSchoolData }) =>
      academicYearsApi.linkSchool(academicYearId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.all });
      toast.success('School linked successfully');
    },
  });
}
