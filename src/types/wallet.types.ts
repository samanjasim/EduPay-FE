export type WalletStatus = 'Active' | 'Frozen' | 'Closed';

export type PaymentGateway = 'ZainCash';

export interface WalletDto {
  id: string;
  schoolId: string;
  userId: string;
  balance: number;
  currency: string;
  status: WalletStatus;
  dailySpendingLimit: number;
  perTransactionLimit: number;
  createdAt: string;
}

export interface WalletListParams {
  pageNumber?: number;
  pageSize?: number;
  status?: WalletStatus;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface CreateWalletData {
  userId: string;
  dailySpendingLimit: number;
  perTransactionLimit: number;
}

export interface UpdateWalletData {
  dailySpendingLimit: number;
  perTransactionLimit: number;
}

export interface UpdateWalletStatusData {
  status: WalletStatus;
}

export interface TopUpCashData {
  amount: number;
  note?: string;
}

export interface TopUpGatewayData {
  amount: number;
  gateway: PaymentGateway;
}

export interface TopUpResultDto {
  orderId: string;
  receiptNumber: string;
  newBalance: number;
}

export interface GatewayTopUpInitResultDto {
  paymentId: string;
  attemptId: string;
  transactionId: string;
  paymentUrl: string;
}

export interface FeePayResultDto {
  orderId: string;
  receiptNumber: string;
}

export interface GatewayFeePayInitResultDto {
  paymentId: string;
  attemptId: string;
  transactionId: string;
  paymentUrl: string;
}

export type WalletTransactionType = 'Credit' | 'Debit';
export type WalletReferenceType = 'TopUp' | 'Payment' | 'Reversal';

export interface WalletTransactionDto {
  id: string;
  walletId: string;
  orderId: string;
  type: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: WalletReferenceType;
  description: string | null;
  createdAt: string;
}

export interface WalletTransactionListParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
  type?: WalletTransactionType;
  referenceType?: WalletReferenceType;
}
