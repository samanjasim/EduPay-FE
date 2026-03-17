import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  EnrollParentData,
  EnrollParentResult,
  LinkParentData,
  ParentListParams,
  ParentSummary,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const parentsApi = {
  getParents: async (params?: ParentListParams): Promise<PaginatedResponse<ParentSummary>> => {
    const response = await apiClient.get<PaginatedResponse<ParentSummary>>(
      API_ENDPOINTS.PARENTS.LIST,
      { params },
    );
    return response.data;
  },

  enrollParent: async (studentId: string, data: EnrollParentData): Promise<EnrollParentResult> => {
    const response = await apiClient.post<ApiResponse<EnrollParentResult>>(
      API_ENDPOINTS.STUDENTS.ENROLL_PARENT(studentId),
      data,
    );
    return response.data.data;
  },

  linkParent: async (studentId: string, data: LinkParentData): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.STUDENTS.PARENTS(studentId), data);
  },

  unlinkParent: async (studentId: string, parentUserId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.STUDENTS.PARENT(studentId, parentUserId));
  },
};
