import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type { ApiResponse } from '@/types';

// Interface matching backend ParentFeeDashboardDto
export interface ParentChildFeeDto {
  studentId: string;
  studentName: string;
  gradeName: string;
  sectionName: string | null;
  outstandingAmount: number;
  paidAmount: number;
  overdueAmount: number;
  fees: ParentFeeItemDto[];
}

export interface ParentFeeItemDto {
  feeInstanceId: string;
  feeTypeName: string;
  feeStructureName: string;
  amount: number;
  discountAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  dueDate: string;
  currency: string;
}

/**
 * Per-fee-type rollup across all the parent's children.
 * Sorted by totalOutstanding descending — saves the FE from grouping client-side.
 */
export interface ParentFeeDashboardCategoryDto {
  feeType: string;
  dueCount: number;
  totalDue: number;
  totalPaid: number;
  totalOutstanding: number;
}

export interface ParentFeeDashboardDto {
  children: ParentChildFeeDto[];
  totalOutstanding: number;
  totalPaid: number;
  totalOverdue: number;
  currency: string;
  byCategory: ParentFeeDashboardCategoryDto[];
}

export const parentFeesApi = {
  getParentFees: async (): Promise<ParentFeeDashboardDto> => {
    const response = await apiClient.get<ApiResponse<ParentFeeDashboardDto>>(
      API_ENDPOINTS.PARENTS.MY_FEES,
    );
    return response.data.data;
  },
};
