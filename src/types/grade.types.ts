export interface GradeSummaryDto {
  id: string;
  schoolId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  sectionCount: number;
  studentCount: number;
  createdAt: string;
}

export interface SectionDto {
  id: string;
  name: string;
  capacity: number | null;
  isActive: boolean;
}

export interface GradeDetailDto {
  id: string;
  schoolId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  sections: SectionDto[];
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateSectionInput {
  name: string;
  capacity?: number | null;
}

export interface CreateGradeData {
  name: string;
  sortOrder: number;
  sections?: CreateSectionInput[] | null;
}

export interface UpdateGradeData {
  name: string;
  sortOrder: number;
}

export interface AddSectionData {
  name: string;
  capacity?: number | null;
}

export interface UpdateSectionData {
  name: string;
  capacity?: number | null;
}

export interface ToggleStatusData {
  isActive: boolean;
}

export interface SectionWithStatsDto {
  id: string;
  name: string;
  capacity: number | null;
  isActive: boolean;
  studentCount: number;
  capacityUsagePercent: number;
}

export interface GradeWithStatsDto {
  id: string;
  schoolId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  sectionCount: number;
  studentCount: number;
  paidFeesAmount: number;
  unpaidFeesAmount: number;
  sections: SectionWithStatsDto[];
  createdAt: string;
  modifiedAt: string | null;
}

export interface GradeListParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}
