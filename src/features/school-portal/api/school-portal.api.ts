import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type { ApiResponse } from '@/types';
import type { SchoolSetupStatus, SchoolDashboardData } from '@/types/school-portal.types';

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
};
