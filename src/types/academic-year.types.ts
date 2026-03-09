export type AcademicYearStatus = 'Planned' | 'Active' | 'Completed';

export interface AcademicYearSummaryDto {
  id: string;
  startYear: number;
  endYear: number;
  label: string;
  isCurrent: boolean;
  status: AcademicYearStatus;
  linkedSchoolCount: number;
  createdAt: string;
}

export interface LinkedSchoolDto {
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  isCurrent: boolean;
  status: 'Active' | 'Closed';
  startedAt: string | null;
  closedAt: string | null;
}

export interface AcademicYearDetailDto {
  id: string;
  startYear: number;
  endYear: number;
  label: string;
  isCurrent: boolean;
  status: AcademicYearStatus;
  linkedSchools: LinkedSchoolDto[];
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateAcademicYearData {
  startYear: number;
  endYear: number;
  isCurrent: boolean;
}

export interface UpdateAcademicYearData {
  startYear: number;
  endYear: number;
}

export interface LinkSchoolData {
  schoolId: string;
  isCurrent: boolean;
}

export interface AcademicYearListParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: AcademicYearStatus;
  isCurrent?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}
