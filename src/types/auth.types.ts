import type { User } from './user.types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: User;
}

export interface LoginCredentials {
  /** Either an email (legacy) or an E.164 phone number. Server accepts both via `identifier`. */
  email: string;
  password: string;
  /** Optional phone-or-email identifier. When set, takes precedence over `email`. */
  identifier?: string;
}

/** OTP login + first-time password setup (parent flow). */
export type OtpPurpose = 'Login' | 'ForgotPassword';

export interface RequestOtpData {
  identifier: string; // phone (E.164) or email
  purpose: OtpPurpose;
}

export interface VerifyOtpData {
  identifier: string;
  code: string;
  purpose: OtpPurpose;
}

export interface OtpVerifyResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  /** True when the user has no password yet — FE should redirect to "set password" screen. */
  requiresPasswordSetup: boolean;
  user: User;
}

export interface SetPasswordData {
  newPassword: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface RefreshTokenData {
  accessToken: string;
  refreshToken: string;
}
