import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type { ApiResponse } from '@/types';
import type { SchoolSetupStatus, SchoolDashboardData, SchoolStaffDto, InviteStaffData } from '@/types/school-portal.types';

export const schoolPortalApi = {
  getSetupStatus: async (schoolId: string): Promise<SchoolSetupStatus> => {
    const response = await apiClient.get<ApiResponse<SchoolSetupStatus>>(
      API_ENDPOINTS.SCHOOLS.SETUP_STATUS(schoolId)
    );
    return response.data.data;
  },

  getDashboard: async (schoolId: string): Promise<SchoolDashboardData> => {
    const response = await apiClient.get<ApiResponse<SchoolDashboardData>>(
      API_ENDPOINTS.SCHOOLS.DASHBOARD(schoolId)
    );
    return response.data.data;
  },

  completeSetup: async (schoolId: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.SCHOOLS.COMPLETE_SETUP(schoolId));
  },

  getStaff: async (schoolId: string): Promise<SchoolStaffDto[]> => {
    const response = await apiClient.get<ApiResponse<SchoolStaffDto[]>>(
      API_ENDPOINTS.SCHOOLS.STAFF(schoolId)
    );
    return response.data.data;
  },

  inviteStaff: async (schoolId: string, data: InviteStaffData): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.SCHOOLS.INVITE(schoolId), data);
  },

  removeStaff: async (schoolId: string, userId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.SCHOOLS.REMOVE_ADMIN(schoolId, userId));
  },
};
