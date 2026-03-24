import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { plansApi } from './plans.api';
import { queryKeys } from '@/lib/query';
import type { PlanListParams, CreatePlanData, UpdatePlanData, AssignPlanToSchoolData } from '@/types';

export function usePlans(params?: PlanListParams) {
  return useQuery({
    queryKey: queryKeys.plans.list(params),
    queryFn: () => plansApi.getPlans(params),
    placeholderData: keepPreviousData,
  });
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: queryKeys.plans.detail(id),
    queryFn: () => plansApi.getPlanById(id),
    enabled: !!id,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlanData) => plansApi.createPlan(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.plans.all }); toast.success('Plan created'); },
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanData }) => plansApi.updatePlan(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.plans.all }); toast.success('Plan updated'); },
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plansApi.deletePlan(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.plans.all }); toast.success('Plan deleted'); },
  });
}

export function useTogglePlanStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plansApi.toggleStatus(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.plans.all }); toast.success('Plan status toggled'); },
  });
}

export function useAssignPlanToSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, schoolId, data }: { planId: string; schoolId: string; data?: AssignPlanToSchoolData }) =>
      plansApi.assignToSchool(planId, schoolId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.plans.all }); toast.success('Plan assigned to school'); },
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (schoolId: string) => plansApi.cancelSubscription(schoolId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.plans.all }); toast.success('Subscription cancelled'); },
  });
}
