// ─── Enums ───

export type OrderType = 'Purchase' | 'WalletTopUp' | 'FeePay' | 'Mixed';
export type OrderStatus = 'Pending' | 'Paid' | 'PartiallyPaid' | 'Cancelled';
export type OrderItemType = 'Product' | 'Fee';
export type OrderPaymentMethod = 'Cash' | 'Wallet' | 'Gateway';
export type OrderPaymentStatus = 'Pending' | 'Successful' | 'Failed';
export type OrderGatewayStatus = 'Initiated' | 'Processing' | 'Successful' | 'Failed' | 'Timeout';

// ─── Summary (list rows) ───

export interface OrderSummaryDto {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  type: OrderType;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  receiptNumber: string;
  walletId: string | null;
  paidAt: string | null;
  createdAt: string;
}

// ─── Detail shape ───

export interface OrderItemDetailDto {
  id: string;
  itemType: OrderItemType;
  productId: string | null;
  productName: string | null;
  feeInstanceId: string | null;
  feeTypeName: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderPaymentCashDto {
  collectedByUserId: string;
  collectedByUserName: string | null;
  note: string | null;
}

export interface OrderGatewayAttemptDto {
  id: string;
  gateway: string;
  status: OrderGatewayStatus;
  transactionRef: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface OrderPaymentDto {
  id: string;
  method: OrderPaymentMethod;
  amount: number;
  currency: string;
  status: OrderPaymentStatus;
  createdAt: string;
  cash: OrderPaymentCashDto | null;
  gatewayAttempts: OrderGatewayAttemptDto[];
}

export interface OrderWalletDto {
  walletId: string;
  userId: string;
  currency: string;
  currentBalance: number;
  status: string;
}

export interface OrderDetailDto {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  orderedByUserId: string;
  orderedByUserName: string | null;
  type: OrderType;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  receiptNumber: string;
  idempotencyKey: string;
  expiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
  items: OrderItemDetailDto[];
  payments: OrderPaymentDto[];
  wallet: OrderWalletDto | null;
}

// ─── Legacy alias (kept in case other code imports this name) ───

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
