import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from './auth.api';
import { queryKeys } from '@/lib/query/keys';
import { useAuthStore } from '@/stores';
import { storage } from '@/utils';
import { ROUTES } from '@/config';
import type { LoginCredentials, RegisterData, ChangePasswordData } from '@/types';

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authApi.getMe(),
    enabled: !!storage.getAccessToken(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { login, setLoading } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (loginResponse) => {
      storage.setTokens(loginResponse.accessToken, loginResponse.refreshToken);

      const tokens = {
        accessToken: loginResponse.accessToken,
        refreshToken: loginResponse.refreshToken,
      };

      login(loginResponse.user, tokens);
      queryClient.setQueryData(queryKeys.auth.me(), loginResponse.user);
      toast.success(`Welcome back, ${loginResponse.user.firstName}!`);
      navigate(ROUTES.DASHBOARD);
    },
    onError: () => {
      setLoading(false);
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: () => {
      toast.success('Account created successfully! Please log in.');
      navigate(ROUTES.LOGIN);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return () => {
    storage.clearTokens();
    logout();
    queryClient.clear();
    navigate(ROUTES.LOGIN);
  };
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
  });
}
