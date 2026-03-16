import { useQuery } from '@tanstack/react-query';
import { usersApi } from './users.api';
import { queryKeys } from '@/lib/query/keys';
import type { UserListParams } from '@/types';

export function useUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: () => usersApi.getUsers(),
    enabled: options?.enabled,
  });
}

export function useSearchUsers(params: UserListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersApi.getUsers(params),
    enabled: options?.enabled,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id,
  });
}
