// ─── Enums ───

export type ProductType = 'Activity' | 'Trip' | 'Uniform' | 'Books' | 'Lab' | 'Transport' | 'Other';
export type ProductStatus = 'Draft' | 'Active' | 'Archived';

// ─── Response DTOs (match BE ProductDto) ───

export interface ProductDto {
  id: string;
  schoolId: string;
  name: string;
  description?: string | null;
  type: ProductType;
  price: number;
  currency: string;
  academicYearStart: number;
  academicYearEnd: number;
  applicableGrade?: string | null;
  applicableSection?: string | null;
  maxQuantity?: number | null;
  availableFrom?: string | null;
  availableUntil?: string | null;
  status: ProductStatus;
  createdAt: string;
}

// ─── Create (match BE CreateProductRequest) ───

export interface CreateProductData {
  schoolId: string;
  name: string;
  description?: string;
  type: ProductType;
  price: number;
  currency: string;
  academicYearStart: number;
  academicYearEnd: number;
  applicableGrade?: string;
  applicableSection?: string;
  maxQuantity?: number;
  availableFrom?: string;
  availableUntil?: string;
}

// ─── Update (match BE UpdateProductRequest) ───

export interface UpdateProductData {
  name: string;
  description?: string;
  type: ProductType;
  price: number;
  currency: string;
  academicYearStart: number;
  academicYearEnd: number;
  applicableGrade?: string;
  applicableSection?: string;
  maxQuantity?: number;
  availableFrom?: string;
  availableUntil?: string;
}

// ─── Update Status (match BE UpdateProductStatusRequest) ───

export interface UpdateProductStatusData {
  status: ProductStatus;
}

// ─── Query Params (match BE GetProductsQuery) ───

export interface ProductListParams {
  schoolId: string;
  type?: ProductType;
  status?: ProductStatus;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}
