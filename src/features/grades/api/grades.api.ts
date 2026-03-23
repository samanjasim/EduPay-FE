import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  GradeSummaryDto,
  GradeDetailDto,
  CreateGradeData,
  UpdateGradeData,
  AddSectionData,
  UpdateSectionData,
  ToggleStatusData,
  GradeListParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const gradesApi = {
  getGrades: async (params?: GradeListParams): Promise<PaginatedResponse<GradeSummaryDto>> => {
    const response = await apiClient.get<PaginatedResponse<GradeSummaryDto>>(
      API_ENDPOINTS.GRADES.LIST,
      { params }
    );
    return response.data;
  },

  getGradeById: async (id: string): Promise<GradeDetailDto> => {
    const response = await apiClient.get<ApiResponse<GradeDetailDto>>(
      API_ENDPOINTS.GRADES.DETAIL(id)
    );
    return response.data.data;
  },

  createGrade: async (data: CreateGradeData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(
      API_ENDPOINTS.GRADES.LIST,
      data
    );
    return response.data.data;
  },

  updateGrade: async (id: string, data: UpdateGradeData): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.GRADES.DETAIL(id), data);
  },

  deleteGrade: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.GRADES.DETAIL(id));
  },

  toggleGradeStatus: async (id: string, data: ToggleStatusData): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.GRADES.STATUS(id), data);
  },

  // --- Sections ---

  addSection: async (gradeId: string, data: AddSectionData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(
      API_ENDPOINTS.GRADES.SECTIONS(gradeId),
      data
    );
    return response.data.data;
  },

  updateSection: async (gradeId: string, sectionId: string, data: UpdateSectionData): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.GRADES.SECTION(gradeId, sectionId), data);
  },

  deleteSection: async (gradeId: string, sectionId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.GRADES.SECTION(gradeId, sectionId));
  },

  toggleSectionStatus: async (gradeId: string, sectionId: string, data: ToggleStatusData): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.GRADES.SECTION_STATUS(gradeId, sectionId), data);
  },
};
