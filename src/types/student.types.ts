export type StudentStatus = 'Active' | 'Suspended' | 'Graduated' | 'Transferred' | 'Withdrawn';
export type Gender = 'Male' | 'Female';
export type ParentRelation = 'Father' | 'Mother' | 'Guardian';

export interface StudentSummaryDto {
  id: string;
  schoolId: string;
  fullNameAr: string;
  fullNameEn: string;
  studentCode: string;
  gradeName: string;
  sectionName: string | null;
  status: StudentStatus;
  gender: Gender;
  isActive: boolean;
  createdAt: string;
}

export interface StudentParentDto {
  parentUserId: string;
  parentName: string;
  relation: ParentRelation;
  linkedAt: string;
}

export interface StudentDetailDto {
  id: string;
  schoolId: string;
  fullNameAr: string;
  fullNameEn: string;
  nationalId: string | null;
  studentCode: string;
  gradeId: string;
  gradeName: string;
  sectionId: string | null;
  sectionName: string | null;
  dateOfBirth: string;
  gender: Gender;
  status: StudentStatus;
  enrollmentAcademicYearId: string;
  academicYearLabel: string;
  userId: string | null;
  isActive: boolean;
  parents: StudentParentDto[];
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateStudentData {
  fullNameAr: string;
  fullNameEn: string;
  nationalId?: string | null;
  studentCode: string;
  gradeId: string;
  sectionId?: string | null;
  dateOfBirth: string;
  gender: Gender;
  enrollmentAcademicYearId: string;
}

export interface UpdateStudentData {
  fullNameAr: string;
  fullNameEn: string;
  nationalId?: string | null;
  studentCode: string;
  gradeId: string;
  sectionId?: string | null;
  dateOfBirth: string;
  gender: Gender;
}

export interface ChangeStudentStatusData {
  status: StudentStatus;
}

export interface StudentListParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  gradeId?: string;
  sectionId?: string;
  status?: StudentStatus;
  gender?: Gender;
  isActive?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}
