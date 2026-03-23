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

  applyDiscount: async (id: string, data: { discountAmount: number; reason: string }): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.FEE_INSTANCES.DISCOUNT(id), data);
  },

  waiveFee: async (id: string, data: { reason: string }): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.FEE_INSTANCES.WAIVE(id), data);
  },

  cancelFee: async (id: string, data: { reason: string }): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.FEE_INSTANCES.CANCEL(id), data);
  },

  detectOverdue: async (): Promise<number> => {
    const response = await apiClient.post<ApiResponse<number>>(API_ENDPOINTS.FEE_INSTANCES.DETECT_OVERDUE);
    return response.data.data;
  },
};
