// ─── Enums ───

export type BillingCycle = 'Monthly' | 'Quarterly' | 'Annual' | 'Lifetime';
export type SubscriptionStatus = 'Active' | 'Expired' | 'Cancelled' | 'PendingPayment';

// ─── Response DTOs (match BE SubscriptionPlanDto / SchoolSubscriptionDto) ───

export interface SubscriptionPlanDto {
  id: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  isPublic: boolean;
  isCustom: boolean;
  price: number;
  billingCycle: BillingCycle;
  maxStudents: number;
  allowPartialPayments: boolean;
  allowInstallments: boolean;
  maxInstallments: number;
  lateFeePercentage: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  subscriptionCount: number;
}

export interface SchoolSubscriptionDto {
  id: string;
  schoolId: string;
  schoolName?: string | null;
  planId: string;
  planName?: string | null;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt?: string | null;
  cancelledAt?: string | null;
  notes?: string | null;
}

// ─── Create Plan (match BE CreatePlanRequest) ───

export interface CreatePlanData {
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  isCustom: boolean;
  price: number;
  billingCycle: BillingCycle;
  maxStudents: number;
  allowPartialPayments: boolean;
  allowInstallments: boolean;
  maxInstallments: number;
  lateFeePercentage: number;
  sortOrder: number;
}

// ─── Update Plan (match BE UpdatePlanRequest — no isDefault) ───

export interface UpdatePlanData {
  name: string;
  description?: string;
  isPublic: boolean;
  isCustom: boolean;
  price: number;
  billingCycle: BillingCycle;
  maxStudents: number;
  allowPartialPayments: boolean;
  allowInstallments: boolean;
  maxInstallments: number;
  lateFeePercentage: number;
  sortOrder: number;
}

// ─── Assign Plan to School (match BE AssignPlanToSchoolRequest) ───

export interface AssignPlanToSchoolData {
  expiresAt?: string;
  notes?: string;
}

// ─── Query Params (match BE GetPlansQuery) ───

export interface PlanListParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}
