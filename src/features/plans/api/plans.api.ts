import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type { SubscriptionPlanDto, CreatePlanData, UpdatePlanData, AssignPlanToSchoolData, PlanListParams, ApiResponse, PaginatedResponse } from '@/types';

export const plansApi = {
  getPlans: async (params?: PlanListParams): Promise<PaginatedResponse<SubscriptionPlanDto>> => {
    const response = await apiClient.get<PaginatedResponse<SubscriptionPlanDto>>(API_ENDPOINTS.PLANS.LIST, { params });
    return response.data;
  },
  getPlanById: async (id: string): Promise<SubscriptionPlanDto> => {
    const response = await apiClient.get<ApiResponse<SubscriptionPlanDto>>(API_ENDPOINTS.PLANS.DETAIL(id));
    return response.data.data;
  },
  createPlan: async (data: CreatePlanData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.PLANS.LIST, data);
    return response.data.data;
  },
  updatePlan: async (id: string, data: UpdatePlanData): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.PLANS.DETAIL(id), data);
  },
  deletePlan: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PLANS.DETAIL(id));
  },
  toggleStatus: async (id: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.PLANS.TOGGLE_STATUS(id));
  },
  assignToSchool: async (planId: string, schoolId: string, data?: AssignPlanToSchoolData): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.PLANS.ASSIGN_SCHOOL(planId, schoolId), data);
  },
  cancelSubscription: async (schoolId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PLANS.CANCEL_SUBSCRIPTION(schoolId));
  },
};
