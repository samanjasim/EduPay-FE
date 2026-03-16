import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  ParentDashboardDto,
  ParentChildDto,
  ChildFeeDto,
  ChildOrderDto,
  ParentFeesParams,
  ParentOrdersParams,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const parentsApi = {
  // ─── By Parent ID (admin view) ────────────────────
  getDashboard: async (parentUserId: string): Promise<ParentDashboardDto> => {
    const response = await apiClient.get<ApiResponse<ParentDashboardDto>>(
      API_ENDPOINTS.PARENTS.DASHBOARD(parentUserId)
    );
    return response.data.data;
  },

  getChildren: async (parentUserId: string): Promise<ParentChildDto[]> => {
    const response = await apiClient.get<ApiResponse<ParentChildDto[]>>(
      API_ENDPOINTS.PARENTS.CHILDREN(parentUserId)
    );
    return response.data.data;
  },

  getFees: async (parentUserId: string, params?: ParentFeesParams): Promise<PaginatedResponse<ChildFeeDto>> => {
    const response = await apiClient.get<PaginatedResponse<ChildFeeDto>>(
      API_ENDPOINTS.PARENTS.FEES(parentUserId),
      { params }
    );
    return response.data;
  },

  getOrders: async (parentUserId: string, params?: ParentOrdersParams): Promise<PaginatedResponse<ChildOrderDto>> => {
    const response = await apiClient.get<PaginatedResponse<ChildOrderDto>>(
      API_ENDPOINTS.PARENTS.ORDERS(parentUserId),
      { params }
    );
    return response.data;
  },
};
