import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config';
import type { ApiResponse } from '@/types';

export type OnboardingIconKey = 'school-bag' | 'card-stack' | 'gift-box' | string;
export type OnboardingCtaAction = 'next' | 'register' | 'login' | string;

export interface OnboardingCta {
  label: string;
  action: OnboardingCtaAction;
}

export interface OnboardingSlide {
  key: string;
  iconKey: OnboardingIconKey;
  title: string;
  highlight: string | null;
  subtitle: string | null;
  body: string;
  primaryCta: OnboardingCta;
  secondaryCta: OnboardingCta | null;
}

export interface OnboardingResponse {
  version: string;
  slides: OnboardingSlide[];
}

export const onboardingApi = {
  getParent: async (lng?: string): Promise<OnboardingResponse> => {
    const response = await apiClient.get<ApiResponse<OnboardingResponse>>(
      API_ENDPOINTS.ONBOARDING.PARENT,
      lng ? { params: { lng } } : undefined
    );
    return response.data.data;
  },

  completeParent: async (version: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.ONBOARDING.PARENT_COMPLETE, { version });
  },
};
