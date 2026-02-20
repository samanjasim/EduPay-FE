import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '@/hooks';
import { ROUTES } from '@/config';
import type { Permission } from '@/constants';

interface PermissionGuardProps {
  permission?: Permission;
  permissions?: Permission[];
  mode?: 'any' | 'all';
  redirectTo?: string;
}

export function PermissionGuard({
  permission,
  permissions: permissionList,
  mode = 'any',
  redirectTo = ROUTES.DASHBOARD,
}: PermissionGuardProps) {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();

  const allPerms = [
    ...(permission ? [permission] : []),
    ...(permissionList ?? []),
  ];

  const isAllowed =
    allPerms.length === 0 ||
    (mode === 'all' ? hasAllPermissions(allPerms) : hasAnyPermission(allPerms));

  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
