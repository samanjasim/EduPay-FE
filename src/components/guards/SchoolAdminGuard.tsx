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
  const isSchoolStaff =
    user.roles.includes('SchoolAdmin') ||
    user.roles.includes('CashCollector') ||
    user.roles.includes('StoreStaff');
  const isPlatformAdmin = user.roles.some((r) => PLATFORM_ADMIN_ROLES.includes(r));
  if (!isSchoolStaff || isPlatformAdmin) {
    return null;
  }

  if (user.roles.includes('CashCollector')) {
    return ROUTES.SCHOOL.CASH_COLLECTION;
  }
  // StoreStaff (without SchoolAdmin) lands on Manual Purchase — their primary task.
  if (user.roles.includes('StoreStaff') && !user.roles.includes('SchoolAdmin')) {
    return ROUTES.SCHOOL.PRODUCTS.MANUAL_PURCHASE;
  }
  return ROUTES.SCHOOL.DASHBOARD;
}
