import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productsApi } from './products.api';
import { queryKeys } from '@/lib/query';
import type { ProductListParams, CreateProductData, UpdateProductData, UpdateProductStatusData } from '@/types';

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
