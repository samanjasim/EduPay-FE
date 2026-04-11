// ─── Fee Types ───

export interface FeeTypeSummaryDto {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateFeeTypeData {
  name: string;
}

export interface UpdateFeeTypeData {
  name: string;
}

// Reuse ToggleStatusData from grade.types.ts for toggle operations

export interface FeeTypeListParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}

// ─── Fee Structures ───

export type FeeFrequency = 'OneTime' | 'Monthly' | 'Quarterly' | 'Semester' | 'Annual';
export type FeeStructureStatus = 'Draft' | 'Active' | 'Archived';

export interface FeeStructureSummaryDto {
  id: string;
  schoolId: string;
  name: string;
  description: string | null;
  feeTypeName: string;
  amount: number;
  currency: string;
  academicYearName: string;
  frequency: FeeFrequency;
  gradeName: string | null;
  sectionName: string | null;
  dueDate: string;
  status: FeeStructureStatus;
  createdAt: string;
}

export interface FeeStructureDetailDto {
  id: string;
  schoolId: string;
  name: string;
  description: string | null;
  feeTypeId: string;
  feeTypeName: string;
  amount: number;
  currency: string;
  academicYearId: string;
  academicYearName: string;
  frequency: FeeFrequency;
  applicableGradeId: string | null;
  gradeName: string | null;
  applicableSectionId: string | null;
  sectionName: string | null;
  dueDate: string;
  lateFeePercentage: number;
  status: FeeStructureStatus;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateFeeStructureData {
  name: string;
  description?: string | null;
  feeTypeId: string;
  amount: number;
  currency: string;
  academicYearId: string;
  frequency: FeeFrequency;
  applicableGradeId?: string | null;
  applicableSectionId?: string | null;
  dueDate: string;
  lateFeePercentage?: number;
}

export interface UpdateFeeStructureData extends CreateFeeStructureData {}

export interface UpdateFeeStructureStatusData {
  status: FeeStructureStatus;
}

// ─── Fee Instances ───

export type FeeInstanceStatus = 'Pending' | 'Paid' | 'Overdue' | 'Waived' | 'Cancelled';

export interface FeeInstanceSummaryDto {
  id: string;
  studentName: string;
  feeStructureName: string;
  feeTypeName: string;
  amount: number;
  discountAmount: number;
  netAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: FeeInstanceStatus;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
}

export interface FeeStatusHistoryDto {
  id: string;
  oldStatus: string;
  newStatus: string;
  reason: string | null;
  changedByUserId: string | null;
  createdAt: string;
}

export interface FeeInstanceDetailDto {
  id: string;
  schoolId: string;
  feeStructureId: string;
  feeStructureName: string;
  studentId: string;
  studentName: string;
  feeTypeName: string;
  amount: number;
  discountAmount: number;
  discountReason: string | null;
  netAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: FeeInstanceStatus;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
  modifiedAt: string | null;
  statusHistory: FeeStatusHistoryDto[];
  paidOrderId: string | null;
  paidOrderReceiptNumber: string | null;
  paidOrderPaymentMethod: string | null;
  paidByUserId: string | null;
  paidByUserName: string | null;
}

export interface FeeInstanceListParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  studentId?: string;
  gradeId?: string;
  sectionId?: string;
  feeStructureId?: string;
  status?: FeeInstanceStatus;
  dueDateFrom?: string;
  dueDateTo?: string;
  academicYearId?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface FeeStructureListParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  feeTypeId?: string;
  gradeId?: string;
  academicYearId?: string;
  status?: FeeStructureStatus;
  sortBy?: string;
  sortDescending?: boolean;
}
