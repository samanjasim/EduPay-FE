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
