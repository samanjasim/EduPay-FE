export type SchoolStatus = 'Pending' | 'Active' | 'Suspended' | 'Deactivated';

export interface SchoolSummaryDto {
  id: string;
  name: string;
  code: string;
  city: string;
  logoUrl?: string | null;
  status: SchoolStatus;
  createdAt: string;
}

export interface SchoolSettings {
  currency: string;
  timezone: string;
  defaultLanguage: string;
}

export interface SchoolAdmin {
  userId: string;
  fullName: string;
  email: string;
  isPrimary: boolean;
  assignedAt: string;
}

export interface SchoolDto {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  city: string;
  phone?: string | null;
  contactEmail?: string | null;
  logoUrl?: string | null;
  status: SchoolStatus;
  settings: SchoolSettings;
  admins: SchoolAdmin[];
  createdAt: string;
}

export interface CreateSchoolData {
  name: string;
  code: string;
  city: string;
  address?: string;
  phone?: string;
  contactEmail?: string;
  logoUrl?: string;
}

export interface UpdateSchoolData {
  name: string;
  city: string;
  address?: string;
  phone?: string;
  contactEmail?: string;
  logoUrl?: string;
}

export interface UpdateSchoolStatusData {
  status: SchoolStatus;
}

export interface UpdateSchoolSettingsData {
  currency: string;
  timezone: string;
  defaultLanguage: string;
}

export interface AssignSchoolAdminData {
  userId: string;
  isPrimary?: boolean;
}

export interface SchoolListParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  city?: string;
  status?: SchoolStatus;
  sortBy?: string;
  sortDescending?: boolean;
}
