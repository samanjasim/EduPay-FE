import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  AcademicYearSummaryDto,
  AcademicYearDetailDto,
  CreateAcademicYearData,
  UpdateAcademicYearData,
  LinkSchoolData,
  AcademicYearListParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const academicYearsApi = {
  getAcademicYears: async (params?: AcademicYearListParams): Promise<PaginatedResponse<AcademicYearSummaryDto>> => {
    const response = await apiClient.get<PaginatedResponse<AcademicYearSummaryDto>>(
      API_ENDPOINTS.ACADEMIC_YEARS.LIST,
      { params }
    );
    return response.data;
  },

  getAcademicYearById: async (id: string): Promise<AcademicYearDetailDto> => {
    const response = await apiClient.get<ApiResponse<AcademicYearDetailDto>>(
      API_ENDPOINTS.ACADEMIC_YEARS.DETAIL(id)
    );
    return response.data.data;
  },

  createAcademicYear: async (data: CreateAcademicYearData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(
      API_ENDPOINTS.ACADEMIC_YEARS.LIST,
      data
    );
    return response.data.data;
  },

  updateAcademicYear: async (id: string, data: UpdateAcademicYearData): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.ACADEMIC_YEARS.DETAIL(id), data);
  },

  deleteAcademicYear: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ACADEMIC_YEARS.DETAIL(id));
  },

  activate: async (id: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.ACADEMIC_YEARS.ACTIVATE(id));
  },

  complete: async (id: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.ACADEMIC_YEARS.COMPLETE(id));
  },

  setCurrent: async (id: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.ACADEMIC_YEARS.SET_CURRENT(id));
  },

  linkSchool: async (id: string, data: LinkSchoolData): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.ACADEMIC_YEARS.LINK_SCHOOL(id), data);
  },
};
