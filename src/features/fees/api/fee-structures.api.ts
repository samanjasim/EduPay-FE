import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  FeeStructureSummaryDto,
  FeeStructureDetailDto,
  CreateFeeStructureData,
  UpdateFeeStructureData,
  UpdateFeeStructureStatusData,
  FeeStructureListParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const feeStructuresApi = {
  getFeeStructures: async (params?: FeeStructureListParams): Promise<PaginatedResponse<FeeStructureSummaryDto>> => {
    const response = await apiClient.get<PaginatedResponse<FeeStructureSummaryDto>>(
      API_ENDPOINTS.FEE_STRUCTURES.LIST,
      { params }
    );
    return response.data;
  },

  getFeeStructureById: async (id: string): Promise<FeeStructureDetailDto> => {
    const response = await apiClient.get<ApiResponse<FeeStructureDetailDto>>(
      API_ENDPOINTS.FEE_STRUCTURES.DETAIL(id)
    );
    return response.data.data;
  },

  createFeeStructure: async (data: CreateFeeStructureData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(
      API_ENDPOINTS.FEE_STRUCTURES.LIST,
      data
    );
    return response.data.data;
  },

  updateFeeStructure: async (id: string, data: UpdateFeeStructureData): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.FEE_STRUCTURES.DETAIL(id), data);
  },

  deleteFeeStructure: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.FEE_STRUCTURES.DETAIL(id));
  },

  updateFeeStructureStatus: async (id: string, data: UpdateFeeStructureStatusData): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.FEE_STRUCTURES.STATUS(id), data);
  },

  generateFeeInstances: async (id: string): Promise<number> => {
    const response = await apiClient.post<ApiResponse<number>>(
      `${API_ENDPOINTS.FEE_STRUCTURES.DETAIL(id)}/generate`
    );
    return response.data.data;
  },
};
