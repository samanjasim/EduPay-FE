import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  StudentSummaryDto,
  StudentDetailDto,
  CreateStudentData,
  UpdateStudentData,
  ChangeStudentStatusData,
  StudentListParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const studentsApi = {
  getStudents: async (params?: StudentListParams): Promise<PaginatedResponse<StudentSummaryDto>> => {
    const response = await apiClient.get<PaginatedResponse<StudentSummaryDto>>(
      API_ENDPOINTS.STUDENTS.LIST,
      { params }
    );
    return response.data;
  },

  getStudentById: async (id: string): Promise<StudentDetailDto> => {
    const response = await apiClient.get<ApiResponse<StudentDetailDto>>(
      API_ENDPOINTS.STUDENTS.DETAIL(id)
    );
    return response.data.data;
  },

  createStudent: async (data: CreateStudentData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(
      API_ENDPOINTS.STUDENTS.LIST,
      data
    );
    return response.data.data;
  },

  updateStudent: async (id: string, data: UpdateStudentData): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.STUDENTS.DETAIL(id), data);
  },

  deleteStudent: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.STUDENTS.DETAIL(id));
  },

  changeStatus: async (id: string, data: ChangeStudentStatusData): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.STUDENTS.STATUS(id), data);
  },

  enrollParent: async (studentId: string, data: Record<string, unknown>): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.STUDENTS.ENROLL_PARENT(studentId), data);
  },

  unlinkParent: async (studentId: string, parentUserId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.STUDENTS.PARENT(studentId, parentUserId));
  },
};
