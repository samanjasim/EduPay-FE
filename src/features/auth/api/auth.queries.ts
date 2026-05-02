import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi, type RequestOtpPayload, type VerifyOtpPayload } from './auth.api';
import { queryKeys } from '@/lib/query/keys';
import { useAuthStore, useUIStore } from '@/stores';
import { storage } from '@/utils';
import { ROUTES } from '@/config';
import { getSchoolPortalDefaultRoute, isParentOnly } from '@/components/guards';
import type { LoginCredentials, RegisterData, ChangePasswordData, User } from '@/types';

/**
 * Resolves the route a freshly-authenticated user should land on.
 * Single source of truth used by both email/password and phone-OTP login paths.
 */
function resolveLandingRoute(user: User): string {
  const schoolRoute = getSchoolPortalDefaultRoute(user);
  if (schoolRoute) return schoolRoute;
  if (isParentOnly(user) && user.hasSeenParentOnboarding === false) {
    return ROUTES.PARENT.ONBOARDING;
  }
  return ROUTES.DASHBOARD;
}

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
    onSuccess: async (loginResponse) => {
      useUIStore.getState().setActiveSchoolId(null);
      storage.setTokens(loginResponse.accessToken, loginResponse.refreshToken);

      const tokens = {
        accessToken: loginResponse.accessToken,
        refreshToken: loginResponse.refreshToken,
      };

      // Fetch full user with permissions from /me
      const fullUser = await authApi.getMe(loginResponse.accessToken);

      login(fullUser, tokens);
      queryClient.setQueryData(queryKeys.auth.me(), fullUser);
      toast.success(`Welcome back, ${fullUser.firstName}!`);
      navigate(resolveLandingRoute(fullUser));
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
    useUIStore.getState().setActiveSchoolId(null);
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

export function useRequestOtp() {
  return useMutation({
    mutationFn: (payload: RequestOtpPayload) => authApi.requestOtp(payload),
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { login, setLoading } = useAuthStore();

  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authApi.verifyOtp(payload),
    onSuccess: async (response) => {
      useUIStore.getState().setActiveSchoolId(null);
      storage.setTokens(response.accessToken, response.refreshToken);

      const tokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };

      const fullUser = await authApi.getMe(response.accessToken);
      login(fullUser, tokens);
      queryClient.setQueryData(queryKeys.auth.me(), fullUser);
      toast.success(`Welcome${fullUser.firstName ? `, ${fullUser.firstName}` : ''}!`);
      navigate(resolveLandingRoute(fullUser));
    },
    onError: () => {
      setLoading(false);
    },
  });
}
