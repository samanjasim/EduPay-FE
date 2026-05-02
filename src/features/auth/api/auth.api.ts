import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type {
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  User,
  AuthTokens,
  LoginResponse,
  ApiResponse,
  RequestOtpData,
  VerifyOtpData,
  OtpVerifyResponse,
  SetPasswordData,
} from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data.data;
  },

  register: async (data: RegisterData): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<AuthTokens> => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken }
    );
    return response.data.data;
  },

  getMe: async (token?: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data.data;
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  /** Phone-or-email OTP login (parent flow). Always returns 200 — anti-enumeration. */
  requestOtp: async (data: RequestOtpData): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.OTP_REQUEST, data);
  },

  /** Verify the 6-digit OTP and receive a JWT plus `requiresPasswordSetup` flag. */
  verifyOtp: async (data: VerifyOtpData): Promise<OtpVerifyResponse> => {
    const response = await apiClient.post<ApiResponse<OtpVerifyResponse>>(
      API_ENDPOINTS.AUTH.OTP_VERIFY,
      data
    );
    return response.data.data;
  },

  /**
   * Set the initial password (allowed when account has none) or reset after a
   * forgot-password OTP login (JWT must carry `pwd_reset=true`).
   */
  setPassword: async (data: SetPasswordData): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.PASSWORD_SET,
      data
    );
    return response.data.data;
  },
};
