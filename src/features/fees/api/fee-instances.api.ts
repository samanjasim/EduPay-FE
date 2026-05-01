import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  FeeInstanceSummaryDto,
  FeeInstanceDetailDto,
  FeeInstanceListParams,
  PayFeeWithCashData,
  CashFeePayResultDto,
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

  payWithCash: async (
    id: string,
    data: PayFeeWithCashData,
    schoolId?: string
  ): Promise<CashFeePayResultDto> => {
    const response = await apiClient.post<ApiResponse<CashFeePayResultDto>>(
      API_ENDPOINTS.FEE_INSTANCE_PAYMENTS.PAY_WITH_CASH(id),
      data,
      schoolId ? { headers: { 'X-School-Id': schoolId } } : undefined
    );
    return response.data.data;
  },

  detectOverdue: async (): Promise<number> => {
    const response = await apiClient.post<ApiResponse<number>>(API_ENDPOINTS.FEE_INSTANCES.DETECT_OVERDUE);
    return response.data.data;
  },
};
