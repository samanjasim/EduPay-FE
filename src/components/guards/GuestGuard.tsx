import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated, selectIsLoading, selectUser } from '@/stores';
import { ROUTES } from '@/config';
import { LoadingScreen } from '@/components/common';
import { getSchoolPortalDefaultRoute } from './SchoolAdminGuard';

export function GuestGuard() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const user = useAuthStore(selectUser);
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname
      || getSchoolPortalDefaultRoute(user)
      || ROUTES.DASHBOARD;
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
