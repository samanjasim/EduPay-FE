import { useCallback } from 'react';
import { useAuthStore } from '@/stores';
import type { Permission } from '@/constants';

export function usePermissions() {
  const permissions = useAuthStore((state) => state.user?.permissions ?? []);

  const hasPermission = useCallback(
    (permission: Permission) => permissions.includes(permission),
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (perms: Permission[]) => perms.some((p) => permissions.includes(p)),
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (perms: Permission[]) => perms.every((p) => permissions.includes(p)),
    [permissions]
  );

  return { permissions, hasPermission, hasAnyPermission, hasAllPermissions };
}
