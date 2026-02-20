import { useAuthStore } from '@/stores';

/** @deprecated Use `usePermissions` from `@/hooks` instead. */
export function useUserRole() {
  const user = useAuthStore((state) => state.user);
  const roles = user?.roles ?? [];

  return {
    roles,
    isSuperAdmin: roles.includes('SuperAdmin'),
    isAdmin: roles.includes('Admin'),
    isSchoolAdmin: roles.includes('SchoolAdmin'),
    isPlatformAdmin: roles.includes('SuperAdmin') || roles.includes('Admin'),
    hasRole: (role: string) => roles.includes(role),
  };
}
