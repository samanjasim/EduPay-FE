export interface SchoolSetupStatus {
  settingsConfigured: boolean;
  gradesCount: number;
  sectionsCount: number;
  feeStructuresCount: number;
  studentsCount: number;
  academicYearLinked: boolean;
  currentAcademicYear: string | null;
  setupWizardCompleted: boolean;
}

export interface FeeCollectionSummary {
  totalDue: number;
  totalCollected: number;
  totalOverdue: number;
  collectionRate: number;
}

export interface FeeStatusBreakdown {
  pending: number;
  paid: number;
  overdue: number;
  waived: number;
  cancelled: number;
}

export interface RecentFeeInstance {
  id: string;
  studentName: string;
  feeStructureName: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

export interface SchoolStaffDto {
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
  isPrimary: boolean;
  status: string;
  assignedAt: string;
}

export interface InviteStaffData {
  email: string;
  fullName: string;
  roleName: 'SchoolAdmin' | 'CashCollector';
}

export interface SchoolDashboardData {
  totalStudents: number;
  activeStudents: number;
  activeFeeStructures: number;
  feeCollection: FeeCollectionSummary;
  feeStatusBreakdown: FeeStatusBreakdown;
  recentFeeInstances: RecentFeeInstance[];
}
