import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  FeeInstanceSummaryDto,
  FeeInstanceDetailDto,
  FeeInstanceListParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const feeInstancesApi = {
  getFeeInstances: async (params?: FeeInstanceListParams): Promise<PaginatedResponse<FeeInstanceSummaryDto>> => {
    const response = await apiClient.get<PaginatedResponse<FeeInstanceSummaryDto>>(
      API_ENDPOINTS.FEE_INSTANCES.LIST,
      { params }
    );
    return response.data;
  },

  getFeeInstanceById: async (id: string): Promise<FeeInstanceDetailDto> => {
    const response = await apiClient.get<ApiResponse<FeeInstanceDetailDto>>(
      API_ENDPOINTS.FEE_INSTANCES.DETAIL(id)
    );
    return response.data.data;
  },
};
