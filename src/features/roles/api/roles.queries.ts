import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { rolesApi } from './roles.api';
import { queryKeys } from '@/lib/query/keys';
import type { CreateRoleData, UpdateRoleData } from '@/types';

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

export function usePermissions() {
  return useQuery({
    queryKey: queryKeys.permissions.list(),
    queryFn: () => rolesApi.getPermissions(),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
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
