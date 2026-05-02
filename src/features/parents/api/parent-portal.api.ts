import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type { ApiResponse } from '@/types';

// =================== Types — match BE ParentHomeDashboardDto ===================

export type ParentFeeCategoryKey = 'tuition' | 'transport' | 'activities' | 'canteen';
export type ParentFeeIconKey = 'graduation' | 'bus' | 'clock' | 'utensils' | string;
export type ParentFeeStatus = 'Pending' | 'Paid' | 'Overdue' | 'Waived' | 'Cancelled';

export interface ParentHomeUser {
  id: string;
  firstName: string;
  preferredLanguage: string;
  unreadNotificationCount: number;
}

export interface ParentHomeChild {
  id: string;
  displayName: string;
  grade: string;
  schoolId: string;
  schoolName: string;
  duePendingCount: number;
}

export interface ParentHomeDueThisMonth {
  currency: string;
  amount: number;
  pendingCount: number;
  feeInstanceIds: string[];
}

export interface ParentHomeFeeCategory {
  feeTypeId: string | null;
  key: ParentFeeCategoryKey;
  label: string;
  iconKey: ParentFeeIconKey;
  dueCount: number;
  hasUnseenChange: boolean;
}

export interface ParentHomePaymentPlan {
  planId: string;
  installmentIndex: number;
  installmentTotal: number;
}

export interface ParentHomeUpcomingPayment {
  feeInstanceId: string;
  title: string;
  feeStructureName: string;
  schoolName: string;
  categoryKey: ParentFeeCategoryKey;
  amount: number;
  currency: string;
  dueDate: string; // YYYY-MM-DD
  paymentPlan: ParentHomePaymentPlan | null;
  studentId: string;
}

export interface ParentHomeRewards {
  balance: number;
  tier: string;
  redeemableCount: number;
}

export interface ParentHomeDashboard {
  user: ParentHomeUser;
  children: ParentHomeChild[];
  activeChildId: string | null;
  dueThisMonth: ParentHomeDueThisMonth;
  feeCategories: ParentHomeFeeCategory[];
  upcomingPayments: ParentHomeUpcomingPayment[];
  rewards: ParentHomeRewards | null;
}

// =================== Child detail ===================

export interface ParentChildFee {
  feeInstanceId: string;
  feeTypeName: string;
  feeStructureName: string;
  categoryKey: ParentFeeCategoryKey;
  amount: number;
  discount: number;
  paid: number;
  remaining: number;
  currency: string;
  status: ParentFeeStatus;
  dueDate: string;
}

export interface ParentChildReceipt {
  orderId: string;
  receiptNumber: string;
  amount: number;
  currency: string;
  paidAt: string;
  status: string;
}

export interface ParentChildDetail {
  id: string;
  displayName: string;
  grade: string;
  schoolId: string;
  schoolName: string;
  currency: string;
  totalOutstanding: number;
  totalPaid: number;
  overdueCount: number;
  fees: ParentChildFee[];
  recentReceipts: ParentChildReceipt[];
}

// =================== Change phone ===================

export interface RequestChangePhonePayload {
  newPhoneE164: string;
}

export interface RequestChangePhoneResult {
  expiresAt: string;
  resendAvailableInSeconds: number;
}

export interface ConfirmChangePhonePayload {
  newPhoneE164: string;
  code: string;
}

// =================== API surface ===================

export const parentPortalApi = {
  getHomeDashboard: async (activeChildId?: string | null): Promise<ParentHomeDashboard> => {
    const response = await apiClient.get<ApiResponse<ParentHomeDashboard>>(
      API_ENDPOINTS.PARENTS.ME_DASHBOARD,
      activeChildId ? { params: { activeChildId } } : undefined
    );
    return response.data.data;
  },

  getChildDetail: async (childId: string): Promise<ParentChildDetail> => {
    const response = await apiClient.get<ApiResponse<ParentChildDetail>>(
      API_ENDPOINTS.PARENTS.ME_CHILD_DETAIL(childId)
    );
    return response.data.data;
  },

  markFeeTypeSeen: async (feeTypeId: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.PARENTS.ME_MARK_FEE_TYPE_SEEN(feeTypeId));
  },

  requestChangePhoneOtp: async (
    payload: RequestChangePhonePayload
  ): Promise<RequestChangePhoneResult> => {
    const response = await apiClient.post<ApiResponse<RequestChangePhoneResult>>(
      API_ENDPOINTS.AUTH.CHANGE_PHONE_REQUEST,
      payload
    );
    return response.data.data;
  },

  confirmChangePhone: async (payload: ConfirmChangePhonePayload): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PHONE_VERIFY, payload);
  },
};
