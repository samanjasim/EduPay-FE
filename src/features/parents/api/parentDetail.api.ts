import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types';

type ParentDashboardChild = {
  studentId: string;
  fullNameEn: string;
  fullNameAr: string;
  studentCode: string;
  gradeName: string;
  status: string;
  pendingFees: number;
  pendingAmount: number;
  overdueFees: number;
  overdueAmount: number;
};

type ParentDashboard = {
  totalChildren: number;
  totalPendingFees: number;
  totalPendingAmount: number;
  totalOverdueFees: number;
  totalOverdueAmount: number;
  totalPaidFees: number;
  totalPaidAmount: number;
  totalOrders: number;
  currency: string;
  children: ParentDashboardChild[];
};

type ParentChild = {
  studentId: string;
  fullNameEn: string;
  fullNameAr: string;
  studentCode: string;
  schoolId: string;
  schoolName: string;
  gradeName: string;
  sectionName?: string | null;
  relation: string;
  status: string;
  linkedAt: string;
  /** Outstanding amount (Pending + Overdue) for this child, in IQD. */
  outstandingAmountIqd: number;
  /** ISO currency code, "IQD" for v1. */
  currency: string;
};

type ParentFee = {
  feeInstanceId: string;
  feeName: string;
  studentName: string;
  amount: number;
  currency: string;
  discountAmount: number;
  dueDate: string;
  status: string;
};

type ParentOrder = {
  orderId: string;
  receiptNumber: string;
  studentName: string;
  type: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
};

type FeesParams = { pageNumber: number; pageSize: number; studentId?: string; status?: string };
type OrdersParams = FeesParams;

export function useParentDashboard(parentUserId: string) {
  return useQuery<ParentDashboard>({
    queryKey: ['parent', parentUserId, 'dashboard'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ParentDashboard>>(
        API_ENDPOINTS.PARENTS.DASHBOARD(parentUserId)
      );
      return response.data.data;
    },
    enabled: !!parentUserId,
  });
}

export function useParentChildren(parentUserId: string) {
  return useQuery<ParentChild[]>({
    queryKey: ['parent', parentUserId, 'children'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ParentChild[]>>(
        API_ENDPOINTS.PARENTS.CHILDREN_FOR_PARENT(parentUserId)
      );
      return response.data.data;
    },
    enabled: !!parentUserId,
  });
}

export function useParentFees(parentUserId: string, params: FeesParams) {
  return useQuery<PaginatedResponse<ParentFee>>({
    queryKey: ['parent', parentUserId, 'fees', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<ParentFee>>(
        API_ENDPOINTS.PARENTS.FEES(parentUserId),
        { params }
      );
      return response.data;
    },
    enabled: !!parentUserId,
  });
}

export function useParentOrders(parentUserId: string, params: OrdersParams) {
  return useQuery<PaginatedResponse<ParentOrder>>({
    queryKey: ['parent', parentUserId, 'orders', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<ParentOrder>>(
        API_ENDPOINTS.PARENTS.ORDERS(parentUserId),
        { params }
      );
      return response.data;
    },
    enabled: !!parentUserId,
  });
}
