// ─── Enums ───

export type ProductType = 'Activity' | 'Trip' | 'Uniform' | 'Books' | 'Lab' | 'Transport' | 'Other';

/**
 * Full product status union — matches BE EduPay.Domain.Products.ProductStatus.
 *
 * Note: legacy code may only emit Draft / Active / Archived. The Disabled status
 * was added when the product catalog purchase loop introduced soft-disable.
 */
export type ProductStatus = 'Draft' | 'Active' | 'Disabled' | 'Archived';

// ─── Legacy DTO (kept for back-compat with existing list/detail pages) ───

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

// ─── New DTOs (mirror BE Product*Dto from the catalog purchase loop slice) ───

export interface ProductSummaryDto {
  id: string;
  schoolId: string;
  nameEn: string;
  nameAr: string | null;
  nameKu: string | null;
  type: string;
  status: ProductStatus;
  currency: string;
  minPrice: number;
  maxPrice: number;
  applicableGradeId: string | null;
  applicableGradeName: string | null;
  availableFrom: string | null;
  availableUntil: string | null;
  primaryImageFileId: string | null;
  createdAt: string;
}

export interface ProductOptionValueDto {
  id: string;
  valueEn: string;
  valueAr: string | null;
  valueKu: string | null;
  sortOrder: number;
}

export interface ProductOptionGroupDto {
  id: string;
  nameEn: string;
  nameAr: string | null;
  nameKu: string | null;
  sortOrder: number;
  values: ProductOptionValueDto[];
}

export interface ProductVariantDto {
  id: string;
  displayNameEn: string;
  displayNameAr: string | null;
  displayNameKu: string | null;
  sku: string | null;
  finalPrice: number;
  currency: string;
  status: 'Active' | 'Disabled';
  sortOrder: number;
  optionValueIds: string[];
}

export interface ProductImageDto {
  id: string;
  fileId: string;
  variantId: string | null;
  altTextEn: string | null;
  altTextAr: string | null;
  altTextKu: string | null;
  isPrimary: boolean;
  sortOrder: number;
  downloadUrl: string;
}

export interface ProductDetailDto {
  id: string;
  schoolId: string;
  nameEn: string;
  nameAr: string | null;
  nameKu: string | null;
  description: string | null;
  type: string;
  status: ProductStatus;
  currency: string;
  academicYearId: string;
  academicYearName: string;
  applicableGradeId: string | null;
  applicableGradeName: string | null;
  applicableSectionId: string | null;
  applicableSectionName: string | null;
  maxQuantityPerPurchase: number | null;
  maxQuantityPerStudent: number | null;
  availableFrom: string | null;
  availableUntil: string | null;
  variants: ProductVariantDto[];
  optionGroups: ProductOptionGroupDto[];
  images: ProductImageDto[];
  createdAt: string;
  modifiedAt: string | null;
}

// ─── Checkout / purchase result (mirror BE GatewayFeePayInitResultDto) ───

export interface ProductCheckoutResultDto {
  orderId: string;
  receiptNumber: string;
  alreadyPaid: boolean;
  paymentId: string | null;
  attemptId: string | null;
  transactionId: string | null;
  paymentUrl: string | null;
}

// ─── Purchase stats ───

export interface TopProductDto {
  productId: string;
  nameEn: string;
  revenue: number;
  units: number;
}

export interface TopVariantDto {
  variantId: string;
  labelEn: string;
  units: number;
  revenue: number;
}

export interface RecentPurchaseDto {
  orderId: string;
  studentName: string;
  productName: string;
  amount: number;
  paidAt: string;
}

export interface DailyRevenuePointDto {
  day: string;
  revenue: number;
  currency: string;
}

export interface ProductPurchaseStatsDto {
  revenueByCurrency: Record<string, number>;
  paidOrderCount: number;
  unitsSold: number;
  topProductsByRevenue: TopProductDto[];
  topVariantsByUnits: TopVariantDto[];
  recentPurchases: RecentPurchaseDto[];
  revenueTrend: DailyRevenuePointDto[];
}

// ─── Purchase / checkout requests ───

export type ManualPurchasePayerType = 'Parent' | 'Student';
export type ManualPurchasePaymentSource = 'Cash' | 'ParentWallet' | 'StudentWallet';

export interface ManualPurchaseItemRequest {
  variantId: string;
  quantity: number;
}

export interface ManualPurchaseRequest {
  studentId: string;
  items: ManualPurchaseItemRequest[];
  payerType: ManualPurchasePayerType;
  paymentSource: ManualPurchasePaymentSource;
  payerUserId?: string;
  clientIdempotencyKey: string;
  note?: string;
}

export type CheckoutPaymentMethod = 'Wallet' | 'Gateway';

export interface CheckoutItemRequest {
  variantId: string;
  quantity: number;
}

export interface CheckoutRequest {
  childId: string;
  items: CheckoutItemRequest[];
  paymentMethod: CheckoutPaymentMethod;
  clientIdempotencyKey: string;
  gateway?: string;
}

// ─── Filters used by parent catalog & stats queries ───

export interface ParentCatalogFilters {
  type?: string;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ProductStatsFilters {
  schoolId?: string;
  from?: string;
  to?: string;
  productId?: string;
  gradeId?: string;
}

export interface ParentProductOrderFilters {
  childId?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

// ─── Variant / image upload payloads ───

export interface UpsertVariantOptionValue {
  optionGroupId: string;
  valueId: string;
}

export interface UpsertProductVariantData {
  id?: string;
  displayNameEn: string;
  displayNameAr?: string | null;
  displayNameKu?: string | null;
  sku?: string | null;
  finalPrice: number;
  currency: string;
  status: 'Active' | 'Disabled';
  sortOrder: number;
  optionValueIds: string[];
}

export interface UpdateProductVariantsRequest {
  variants: UpsertProductVariantData[];
}

export interface UploadProductImageOptions {
  variantId?: string | null;
  altTextEn?: string | null;
  altTextAr?: string | null;
  altTextKu?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

// ─── Legacy create/update (kept for back-compat with existing pages) ───

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

export interface UpdateProductStatusData {
  status: ProductStatus;
}

// ─── Query Params ───

export interface ProductListParams {
  schoolId: string;
  type?: ProductType | string;
  status?: ProductStatus;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

/**
 * Filters for the new /Products list endpoint backed by ProductSummaryDto.
 * Distinct from ProductListParams which targets the legacy DTO.
 */
export interface ProductListFilters {
  schoolId?: string;
  type?: string;
  status?: ProductStatus;
  gradeId?: string;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}
