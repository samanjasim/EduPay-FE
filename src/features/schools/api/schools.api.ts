import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  SchoolSummaryDto,
  SchoolDto,
  CreateSchoolData,
  UpdateSchoolData,
  UpdateSchoolStatusData,
  UpdateSchoolSettingsData,
  AssignSchoolAdminData,
  SchoolListParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const schoolsApi = {
  getSchools: async (params?: SchoolListParams): Promise<PaginatedResponse<SchoolSummaryDto>> => {
    const response = await apiClient.get<PaginatedResponse<SchoolSummaryDto>>(
      API_ENDPOINTS.SCHOOLS.LIST,
      { params }
    );
    return response.data;
  },

  getSchoolById: async (id: string): Promise<SchoolDto> => {
    const response = await apiClient.get<ApiResponse<SchoolDto>>(
      API_ENDPOINTS.SCHOOLS.DETAIL(id)
    );
    return response.data.data;
  },

  getMySchool: async (): Promise<SchoolDto> => {
    const response = await apiClient.get<ApiResponse<SchoolDto>>(
      API_ENDPOINTS.SCHOOLS.MY_SCHOOL
    );
    return response.data.data;
  },

  createSchool: async (data: CreateSchoolData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(
      API_ENDPOINTS.SCHOOLS.LIST,
      data
    );
    return response.data.data;
  },

  updateSchool: async (id: string, data: UpdateSchoolData): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.SCHOOLS.DETAIL(id), data);
  },

  updateSchoolStatus: async (id: string, data: UpdateSchoolStatusData): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.SCHOOLS.STATUS(id), data);
  },

  updateSchoolSettings: async (id: string, data: UpdateSchoolSettingsData): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.SCHOOLS.SETTINGS(id), data);
  },

  assignAdmin: async (schoolId: string, data: AssignSchoolAdminData): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.SCHOOLS.ADMINS(schoolId), data);
  },

  removeAdmin: async (schoolId: string, userId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.SCHOOLS.REMOVE_ADMIN(schoolId, userId));
  },

  deleteSchool: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.SCHOOLS.DETAIL(id));
  },
};
