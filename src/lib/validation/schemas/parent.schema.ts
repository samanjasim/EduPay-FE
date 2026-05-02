import { z } from 'zod';
import type { TFunction } from 'i18next';

export const enrollParentSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(1, t('validation.required', { field: t('parents.email') }))
      .email(t('validation.invalidEmail'))
      .max(256, t('validation.maxLength', { field: t('parents.email'), max: 256 })),
    firstName: z
      .string()
      .max(100, t('validation.maxLength', { field: t('parents.firstName'), max: 100 }))
      .optional()
      .or(z.literal('')),
    lastName: z
      .string()
      .max(100, t('validation.maxLength', { field: t('parents.lastName'), max: 100 }))
      .optional()
      .or(z.literal('')),
    // Phone is now REQUIRED — it's the parent's identifier for OTP login
    phoneNumber: z
      .string()
      .min(1, t('validation.required', { field: t('parents.phoneNumber') }))
      .regex(/^\+?[1-9]\d{6,14}$/, t('validation.invalidPhone')),
    // Password is optional — admin can leave it blank and the parent will set
    // their own via the mobile app's OTP flow
    password: z
      .string()
      .min(8, t('validation.minLength', { field: t('parents.password'), min: 8 }))
      .optional()
      .or(z.literal('')),
    relation: z.enum(['Father', 'Mother', 'Guardian'], {
      message: t('validation.required', { field: t('parents.relation') }),
    }),
  });

export const linkParentSchema = (t: TFunction) =>
  z.object({
    parentUserId: z.string().min(1, t('validation.required', { field: t('parents.selectParent') })),
    relation: z.enum(['Father', 'Mother', 'Guardian'], {
      message: t('validation.required', { field: t('parents.relation') }),
    }),
  });

export type EnrollParentFormData = z.infer<ReturnType<typeof enrollParentSchema>>;
export type LinkParentFormData = z.infer<ReturnType<typeof linkParentSchema>>;
