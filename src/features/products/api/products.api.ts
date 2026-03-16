import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type { ProductDto, CreateProductData, UpdateProductData, UpdateProductStatusData, ProductListParams, ApiResponse, PaginatedResponse } from '@/types';

export const productsApi = {
  getProducts: async (params?: ProductListParams): Promise<PaginatedResponse<ProductDto>> => {
    const response = await apiClient.get<PaginatedResponse<ProductDto>>(API_ENDPOINTS.PRODUCTS.LIST, { params });
    return response.data;
  },
  getProductById: async (id: string): Promise<ProductDto> => {
    const response = await apiClient.get<ApiResponse<ProductDto>>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
    return response.data.data;
  },
  createProduct: async (data: CreateProductData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.PRODUCTS.LIST, data);
    return response.data.data;
  },
  updateProduct: async (id: string, data: UpdateProductData): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.PRODUCTS.DETAIL(id), data);
  },
  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  },
  updateStatus: async (id: string, data: UpdateProductStatusData): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.PRODUCTS.STATUS(id), data);
  },
};
