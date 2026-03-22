import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  FeeTypeSummaryDto,
  CreateFeeTypeData,
  UpdateFeeTypeData,
  ToggleStatusData,
  FeeTypeListParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const feeTypesApi = {
  getFeeTypes: async (params?: FeeTypeListParams): Promise<PaginatedResponse<FeeTypeSummaryDto>> => {
    const response = await apiClient.get<PaginatedResponse<FeeTypeSummaryDto>>(
      API_ENDPOINTS.FEE_TYPES.LIST,
      { params }
    );
    return response.data;
  },

  getFeeTypeById: async (id: string): Promise<FeeTypeSummaryDto> => {
    const response = await apiClient.get<ApiResponse<FeeTypeSummaryDto>>(
      API_ENDPOINTS.FEE_TYPES.DETAIL(id)
    );
    return response.data.data;
  },

  createFeeType: async (data: CreateFeeTypeData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(
      API_ENDPOINTS.FEE_TYPES.LIST,
      data
    );
    return response.data.data;
  },

  updateFeeType: async (id: string, data: UpdateFeeTypeData): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.FEE_TYPES.DETAIL(id), data);
  },

  deleteFeeType: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.FEE_TYPES.DETAIL(id));
  },

  toggleFeeTypeStatus: async (id: string, data: ToggleStatusData): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.FEE_TYPES.STATUS(id), data);
  },
};
