import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  ProductDto,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateProductStatusData,
  ProductListParams,
  UpdateProductVariantsRequest,
  UploadProductImageOptions,
  ProductImageDto,
  ParentCatalogFilters,
  ProductSummaryDto,
  ProductListFilters,
  ProductDetailDto,
  CheckoutRequest,
  ProductCheckoutResultDto,
  ParentProductOrderFilters,
  ManualPurchaseRequest,
  ProductStatsFilters,
  ProductPurchaseStatsDto,
  OrderSummaryDto,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const productsApi = {
  // ─── Legacy product CRUD ───

  getProducts: async (params?: ProductListParams): Promise<PaginatedResponse<ProductDto>> => {
    const response = await apiClient.get<PaginatedResponse<ProductDto>>(API_ENDPOINTS.PRODUCTS.LIST, { params });
    return response.data;
  },

  /**
   * Fetches the catalog list as ProductSummaryDto (multilingual + price range +
   * primary image). Same /Products endpoint, but typed for the richer DTO that
   * the catalog purchase loop slice serves.
   */
  getProductSummaries: async (
    params?: ProductListFilters
  ): Promise<PaginatedResponse<ProductSummaryDto>> => {
    const response = await apiClient.get<PaginatedResponse<ProductSummaryDto>>(
      API_ENDPOINTS.PRODUCTS.LIST,
      { params }
    );
    return response.data;
  },

  getProductById: async (id: string): Promise<ProductDto> => {
    const response = await apiClient.get<ApiResponse<ProductDto>>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
    return response.data.data;
  },

  /**
   * Fetches the full product detail (variants + images + multilingual fields)
   * via the same /Products/{id} endpoint. Server returns the richer
   * ProductDetailDto for staff scope; the legacy ProductDto getter is kept
   * for back-compat with older callers.
   */
  getProductDetailById: async (id: string): Promise<ProductDetailDto> => {
    const response = await apiClient.get<ApiResponse<ProductDetailDto>>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
    return response.data.data;
  },

  createProduct: async (data: CreateProductRequest): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.PRODUCTS.LIST, data);
    return response.data.data;
  },

  updateProduct: async (id: string, data: UpdateProductRequest): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.PRODUCTS.DETAIL(id), data);
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  },

  updateStatus: async (id: string, data: UpdateProductStatusData): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.PRODUCTS.STATUS(id), data);
  },

  // ─── Variants & images (catalog management) ───

  updateVariants: async (productId: string, payload: UpdateProductVariantsRequest): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.PRODUCTS.VARIANTS(productId), payload);
  },

  uploadImage: async (
    productId: string,
    file: File,
    options?: UploadProductImageOptions
  ): Promise<ProductImageDto> => {
    const form = new FormData();
    form.append('file', file);
    if (options?.variantId) form.append('variantId', options.variantId);
    if (options?.altTextEn != null) form.append('altTextEn', options.altTextEn);
    if (options?.altTextAr != null) form.append('altTextAr', options.altTextAr);
    if (options?.altTextKu != null) form.append('altTextKu', options.altTextKu);
    if (options?.isPrimary != null) form.append('isPrimary', String(options.isPrimary));
    if (options?.sortOrder != null) form.append('sortOrder', String(options.sortOrder));

    const response = await apiClient.post<ApiResponse<ProductImageDto>>(
      API_ENDPOINTS.PRODUCTS.IMAGES(productId),
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },

  deleteImage: async (productId: string, imageId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.IMAGE(productId, imageId));
  },

  // ─── Parent self-service (browse & checkout) ───

  getParentChildProducts: async (
    childId: string,
    filters?: ParentCatalogFilters
  ): Promise<PaginatedResponse<ProductSummaryDto>> => {
    const response = await apiClient.get<PaginatedResponse<ProductSummaryDto>>(
      API_ENDPOINTS.PARENTS.CHILDREN_PRODUCTS(childId),
      { params: filters }
    );
    return response.data;
  },

  getParentChildProductDetail: async (
    childId: string,
    productId: string
  ): Promise<ProductDetailDto> => {
    const response = await apiClient.get<ApiResponse<ProductDetailDto>>(
      API_ENDPOINTS.PARENTS.CHILDREN_PRODUCT_DETAIL(childId, productId)
    );
    return response.data.data;
  },

  parentCheckout: async (payload: CheckoutRequest): Promise<ProductCheckoutResultDto> => {
    const response = await apiClient.post<ApiResponse<ProductCheckoutResultDto>>(
      API_ENDPOINTS.PARENTS.PRODUCT_CHECKOUT,
      payload
    );
    return response.data.data;
  },

  getParentProductOrders: async (
    filters?: ParentProductOrderFilters
  ): Promise<PaginatedResponse<OrderSummaryDto>> => {
    const response = await apiClient.get<PaginatedResponse<OrderSummaryDto>>(
      API_ENDPOINTS.PARENTS.PRODUCT_ORDERS,
      { params: filters }
    );
    return response.data;
  },

  cancelParentProductOrder: async (orderId: string, reason?: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.PARENTS.PRODUCT_ORDER_CANCEL(orderId), { reason });
  },

  // ─── Manual purchase + stats (school staff) ───

  recordManualPurchase: async (payload: ManualPurchaseRequest): Promise<ProductCheckoutResultDto> => {
    const response = await apiClient.post<ApiResponse<ProductCheckoutResultDto>>(
      API_ENDPOINTS.PRODUCT_PURCHASES.MANUAL,
      payload,
    );
    return response.data.data;
  },

  getStats: async (filters?: ProductStatsFilters): Promise<ProductPurchaseStatsDto> => {
    const response = await apiClient.get<ApiResponse<ProductPurchaseStatsDto>>(
      API_ENDPOINTS.PRODUCT_PURCHASES.STATS,
      { params: filters }
    );
    return response.data.data;
  },

  // ─── Order cancellation (shared) ───

  cancelOrder: async (orderId: string, reason?: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.ORDERS.CANCEL(orderId), { reason });
  },
};
