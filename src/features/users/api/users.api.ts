import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type { User, UserListParams, PaginatedResponse } from '@/types';

export const usersApi = {
  getUsers: async (params?: UserListParams): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      API_ENDPOINTS.USERS.LIST,
      { params },
    );
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<{ data: User }>(API_ENDPOINTS.USERS.DETAIL(id));
    return response.data.data;
  },
};
