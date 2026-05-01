import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  OrderSummaryDto,
  OrderDetailDto,
  OrderListParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const ordersApi = {
  getOrders: async (params?: OrderListParams): Promise<PaginatedResponse<OrderSummaryDto>> => {
    const response = await apiClient.get<PaginatedResponse<OrderSummaryDto>>(
      API_ENDPOINTS.ORDERS.LIST,
      { params }
    );
    return response.data;
  },

  getOrderById: async (id: string): Promise<OrderDetailDto> => {
    const response = await apiClient.get<ApiResponse<OrderDetailDto>>(
      API_ENDPOINTS.ORDERS.DETAIL(id)
    );
    return response.data.data;
  },

  downloadReceipt: async (id: string, receiptNumber?: string): Promise<void> => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.RECEIPT(id), {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${receiptNumber || id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
