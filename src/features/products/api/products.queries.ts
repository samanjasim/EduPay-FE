import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productsApi } from './products.api';
import { queryKeys } from '@/lib/query';
import type {
  ProductListParams,
  CreateProductData,
  UpdateProductData,
  UpdateProductStatusData,
  UpdateProductVariantsRequest,
  UploadProductImageOptions,
  ParentCatalogFilters,
  ParentProductOrderFilters,
  CheckoutRequest,
  ManualPurchaseRequest,
  ProductStatsFilters,
} from '@/types';

// ─── Legacy product CRUD ───

export function useProducts(params?: ProductListParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsApi.getProducts(params),
    placeholderData: keepPreviousData,
    enabled: !!params?.schoolId,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsApi.getProductById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductData) => productsApi.createProduct(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.products.all }); toast.success('Product created'); },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) => productsApi.updateProduct(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.products.all }); toast.success('Product updated'); },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.products.all }); toast.success('Product deleted'); },
  });
}

export function useUpdateProductStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductStatusData }) => productsApi.updateStatus(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.products.all }); toast.success('Product status updated'); },
  });
}

// ─── Variants & images ───

export function useUpdateProductVariants() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: UpdateProductVariantsRequest }) =>
      productsApi.updateVariants(productId, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.products.detail(vars.productId) });
      qc.invalidateQueries({ queryKey: queryKeys.products.lists() });
      toast.success('Product variants updated');
    },
  });
}

export function useUploadProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      file,
      options,
    }: {
      productId: string;
      file: File;
      options?: UploadProductImageOptions;
    }) => productsApi.uploadImage(productId, file, options),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.products.detail(vars.productId) });
      toast.success('Image uploaded');
    },
  });
}

export function useDeleteProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
      productsApi.deleteImage(productId, imageId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.products.detail(vars.productId) });
      toast.success('Image deleted');
    },
  });
}

// ─── Parent self-service ───

export function useParentCatalog(childId: string, filters?: ParentCatalogFilters) {
  return useQuery({
    queryKey: queryKeys.products.parentCatalog(childId, filters),
    queryFn: () => productsApi.getParentChildProducts(childId, filters),
    placeholderData: keepPreviousData,
    enabled: !!childId,
  });
}

export function useParentProductDetail(childId: string, productId: string) {
  return useQuery({
    queryKey: queryKeys.products.parentDetail(childId, productId),
    queryFn: () => productsApi.getParentChildProductDetail(childId, productId),
    enabled: !!childId && !!productId,
  });
}

export function useParentCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckoutRequest) => productsApi.parentCheckout(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
      qc.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

export function useParentProductOrders(filters?: ParentProductOrderFilters) {
  return useQuery({
    queryKey: queryKeys.products.parentOrders(filters),
    queryFn: () => productsApi.getParentProductOrders(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCancelParentProductOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      productsApi.cancelParentProductOrder(orderId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
      qc.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Order cancelled');
    },
  });
}

// ─── Manual purchase + stats ───

export function useRecordManualPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ManualPurchaseRequest) => productsApi.recordManualPurchase(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
      qc.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Manual purchase recorded');
    },
  });
}

export function useProductStats(filters?: ProductStatsFilters) {
  return useQuery({
    queryKey: queryKeys.products.stats(filters),
    queryFn: () => productsApi.getStats(filters),
    placeholderData: keepPreviousData,
  });
}

// ─── Shared order cancel ───

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      productsApi.cancelOrder(orderId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.all });
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success('Order cancelled');
    },
  });
}
