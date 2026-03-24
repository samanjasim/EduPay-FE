import type { FeeInstanceStatus, StudentStatus } from '@/types';

export const FEE_INSTANCE_STATUS_BADGE: Record<FeeInstanceStatus, 'success' | 'warning' | 'error' | 'default'> = {
  Pending: 'warning',
  Paid: 'success',
  Overdue: 'error',
  Waived: 'default',
  Cancelled: 'default',
};

export const STUDENT_STATUS_BADGE: Record<StudentStatus, 'success' | 'warning' | 'primary' | 'default' | 'error'> = {
  Active: 'success',
  Suspended: 'warning',
  Graduated: 'primary',
  Transferred: 'default',
  Withdrawn: 'error',
};

export const STUDENT_STATUS_TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
  Active: ['Suspended', 'Graduated', 'Transferred', 'Withdrawn'],
  Suspended: ['Active'],
  Graduated: [],
  Transferred: [],
  Withdrawn: [],
};
