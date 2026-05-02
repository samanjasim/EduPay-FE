import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '@/config';
import { LoadingScreen } from '@/components/common';
import { useSchoolContext } from '@/features/school-portal/hooks/useSchoolContext';

const PLATFORM_ADMIN_ROLES = ['SuperAdmin', 'Admin'];

export function SchoolAdminGuard() {
  const { isLoading, isSchoolStaff, schoolId } = useSchoolContext();

  if (!isSchoolStaff) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // Wait for school context to load and activeSchoolId to be set
  if (isLoading || !schoolId) {
    return <LoadingScreen />;
  }

  return <Outlet />;
}

/**
 * Checks if a user should be redirected to the school portal.
 * Returns true if user is school staff and NOT also a platform admin.
 */
export function shouldRedirectToSchoolPortal(user: { roles?: string[] } | null): boolean {
  return getSchoolPortalDefaultRoute(user) !== null;
}

export function getSchoolPortalDefaultRoute(user: { roles?: string[] } | null): string | null {
  if (!user?.roles) return null;
  const isSchoolStaff = user.roles.includes('SchoolAdmin') || user.roles.includes('CashCollector');
  const isPlatformAdmin = user.roles.some((r) => PLATFORM_ADMIN_ROLES.includes(r));
  if (!isSchoolStaff || isPlatformAdmin) {
    return null;
  }

  return user.roles.includes('CashCollector')
    ? ROUTES.SCHOOL.CASH_COLLECTION
    : ROUTES.SCHOOL.DASHBOARD;
}

const PARENT_ONLY_NON_PRIVILEGED_ROLES = ['SuperAdmin', 'Admin', 'SchoolAdmin', 'CashCollector', 'Student'];

/**
 * Returns true if the user has the Parent role and no admin/staff role.
 * Such users land on the parent portal (and the onboarding flow on first login).
 */
export function isParentOnly(user: { roles?: string[] } | null): boolean {
  if (!user?.roles?.length) return false;
  if (!user.roles.includes('Parent')) return false;
  return !user.roles.some((r) => PARENT_ONLY_NON_PRIVILEGED_ROLES.includes(r));
}
