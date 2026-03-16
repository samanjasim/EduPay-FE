import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type { CreateParentData, LinkParentData, ApiResponse } from '@/types';

export const parentsApi = {
  createParent: async (data: CreateParentData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(
      API_ENDPOINTS.PARENTS.CREATE,
      data,
      { headers: { 'X-School-Id': '' } },
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
