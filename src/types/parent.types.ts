import type { ParentRelation } from './student.types';
import type { UpdateUserData } from './user.types';

export type UpdateParentData = UpdateUserData;

// Enroll = atomic create-or-reuse + link
export interface EnrollParentData {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phoneNumber?: string | null;
  password?: string | null;
  relation: ParentRelation;
}

export interface EnrollParentResult {
  parentUserId: string;
  isNewAccount: boolean;
  parentName: string | null;
}

// Direct link (existing parent → student)
export interface LinkParentData {
  parentUserId: string;
  relation: ParentRelation;
}

// School-scoped parent list item
export interface ParentSummary {
  parentUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  linkedStudentCount: number;
  firstLinkedAt: string;
}

// List query params
export interface ParentListParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}
