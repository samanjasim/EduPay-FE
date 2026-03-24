// ─── Enums ───

export type OrderType = 'Purchase' | 'WalletTopUp' | 'FeePay' | 'Mixed';
export type OrderStatus = 'Pending' | 'Paid' | 'PartiallyPaid' | 'Cancelled';
export type OrderItemType = 'Product' | 'Fee';

// ─── Response DTOs (prepared for BE — domain exists, API layer pending) ───

export interface OrderItemDto {
  id: string;
  orderId: string;
  itemType: OrderItemType;
  productId?: string | null;
  feeInstanceId?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
}

export interface OrderDto {
  id: string;
  schoolId: string;
  studentId: string;
  orderedByUserId: string;
  idempotencyKey: string;
  type: OrderType;
  walletId?: string | null;
  totalAmount: number;
  currency: string;
  receiptNumber: string;
  status: OrderStatus;
  expiresAt?: string | null;
  paidAt?: string | null;
  orderItems: OrderItemDto[];
  createdAt: string;
}

// ─── Create (based on Order.Create domain method) ───

export interface CreateOrderItemData {
  itemType: OrderItemType;
  productId?: string;
  feeInstanceId?: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderData {
  schoolId: string;
  studentId: string;
  type: OrderType;
  currency: string;
  walletId?: string;
  items: CreateOrderItemData[];
}

// ─── Query Params ───

export interface OrderListParams {
  schoolId?: string;
  studentId?: string;
  type?: OrderType;
  status?: OrderStatus;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}
