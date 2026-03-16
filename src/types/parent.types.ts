export interface ParentChildDto {
  studentId: string;
  schoolId: string;
  fullNameAr: string;
  fullNameEn: string;
  studentCode: string;
  gradeName: string;
  sectionName?: string | null;
  gender: string;
  status: string;
  relation: string;
  linkedAt: string;
}

export interface ChildFeeDto {
  feeInstanceId: string;
  studentId: string;
  studentName: string;
  feeName: string;
  amount: number;
  currency: string;
  discountAmount: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

export interface ChildOrderDto {
  orderId: string;
  studentId: string;
  studentName: string;
  type: string;
  totalAmount: number;
  currency: string;
  receiptNumber: string;
  status: string;
  paidAt?: string | null;
  createdAt: string;
}

export interface ParentChildSummaryDto {
  studentId: string;
  fullNameAr: string;
  fullNameEn: string;
  studentCode: string;
  gradeName: string;
  status: string;
  pendingFees: number;
  pendingAmount: number;
  overdueFees: number;
  overdueAmount: number;
}

export interface ParentDashboardDto {
  totalChildren: number;
  totalPendingFees: number;
  totalPendingAmount: number;
  totalOverdueFees: number;
  totalOverdueAmount: number;
  totalPaidFees: number;
  totalPaidAmount: number;
  totalOrders: number;
  currency: string;
  children: ParentChildSummaryDto[];
}

export interface ParentFeesParams {
  studentId?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ParentOrdersParams {
  studentId?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}
