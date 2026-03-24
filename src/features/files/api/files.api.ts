import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  FileDto, FileAccessLogDto, FileCategoryDto,
  FileListParams, FileAccessLogListParams,
  UploadFileData, CreateFileCategoryData, UpdateFileCategoryData,
  ApiResponse, PaginatedResponse,
} from '@/types';

export const filesApi = {
  getFiles: async (params?: FileListParams): Promise<PaginatedResponse<FileDto>> => {
    const response = await apiClient.get<PaginatedResponse<FileDto>>(API_ENDPOINTS.FILES.LIST, { params });
    return response.data;
  },
  getFileById: async (id: string): Promise<FileDto> => {
    const response = await apiClient.get<ApiResponse<FileDto>>(API_ENDPOINTS.FILES.DETAIL(id));
    return response.data.data;
  },
  uploadFile: async (data: UploadFileData): Promise<string> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('purpose', data.purpose);
    if (data.schoolId) formData.append('schoolId', data.schoolId);
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    const response = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.FILES.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
  downloadFile: (id: string): string => {
    return `${apiClient.defaults.baseURL}${API_ENDPOINTS.FILES.DOWNLOAD(id)}`;
  },
  deleteFile: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.FILES.DETAIL(id));
  },
  getAccessLogs: async (params: FileAccessLogListParams): Promise<PaginatedResponse<FileAccessLogDto>> => {
    const { fileId, ...rest } = params;
    const response = await apiClient.get<PaginatedResponse<FileAccessLogDto>>(API_ENDPOINTS.FILES.ACCESS_LOGS(fileId), { params: rest });
    return response.data;
  },

  // ─── Categories ───
  getCategories: async (): Promise<FileCategoryDto[]> => {
    const response = await apiClient.get<ApiResponse<FileCategoryDto[]>>(API_ENDPOINTS.FILES.CATEGORIES);
    return response.data.data;
  },
  createCategory: async (data: CreateFileCategoryData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.FILES.CATEGORIES, data);
    return response.data.data;
  },
  updateCategory: async (id: string, data: UpdateFileCategoryData): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.FILES.CATEGORY_DETAIL(id), data);
  },
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.FILES.CATEGORY_DETAIL(id));
  },
};
