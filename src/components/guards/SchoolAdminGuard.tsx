import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '@/config';
import { LoadingScreen } from '@/components/common';
import { useSchoolContext } from '@/features/school-portal/hooks/useSchoolContext';

const PLATFORM_ADMIN_ROLES = ['SuperAdmin', 'Admin'];

export function SchoolAdminGuard() {
  const { isLoading, isSchoolAdmin, schoolId } = useSchoolContext();

  // If not a school admin, redirect to main dashboard
  if (!isSchoolAdmin) {
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
 * Returns true if user is SchoolAdmin and NOT also a platform admin.
 */
export function shouldRedirectToSchoolPortal(user: { roles?: string[] } | null): boolean {
  if (!user?.roles) return false;
  const isSchoolAdmin = user.roles.includes('SchoolAdmin');
  const isPlatformAdmin = user.roles.some((r) => PLATFORM_ADMIN_ROLES.includes(r));
  return isSchoolAdmin && !isPlatformAdmin;
}
