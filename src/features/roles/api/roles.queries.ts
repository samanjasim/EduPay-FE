import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { rolesApi } from './roles.api';
import { queryKeys } from '@/lib/query/keys';
import type { CreateRoleData, UpdateRoleData, UpdateRolePermissionsData } from '@/types';

export function useRoles(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.roles.lists(),
    queryFn: () => rolesApi.getRoles(),
    enabled: options?.enabled,
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id),
    queryFn: () => rolesApi.getRoleById(id),
    enabled: !!id,
  });
}

export function useAllPermissions(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.permissions.list(),
    queryFn: () => rolesApi.getPermissions(),
    enabled: options?.enabled,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleData) => rolesApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      toast.success('Role created successfully');
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleData }) => rolesApi.updateRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(variables.id) });
      toast.success('Role updated successfully');
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      toast.success('Role deleted successfully');
    },
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRolePermissionsData }) =>
      rolesApi.updateRolePermissions(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      toast.success('Permissions updated successfully');
    },
  });
}

export function useAssignUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, userId }: { roleId: string; userId: string }) =>
      rolesApi.assignUserToRole(roleId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      toast.success('Role assigned successfully');
    },
  });
}

export function useRemoveUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, userId }: { roleId: string; userId: string }) =>
      rolesApi.removeUserFromRole(roleId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      toast.success('Role removed successfully');
    },
  });
}
