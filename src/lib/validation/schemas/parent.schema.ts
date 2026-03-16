import { z } from 'zod';
import type { TFunction } from 'i18next';

export const createParentSchema = (t: TFunction) =>
  z
    .object({
      firstName: z
        .string()
        .min(1, t('validation.required', { field: t('parents.firstName') }))
        .max(100, t('validation.maxLength', { field: t('parents.firstName'), max: 100 })),
      lastName: z
        .string()
        .min(1, t('validation.required', { field: t('parents.lastName') }))
        .max(100, t('validation.maxLength', { field: t('parents.lastName'), max: 100 })),
      username: z
        .string()
        .min(1, t('validation.required', { field: t('parents.username') }))
        .max(100, t('validation.maxLength', { field: t('parents.username'), max: 100 })),
      email: z
        .string()
        .min(1, t('validation.required', { field: t('parents.email') }))
        .email(t('validation.invalidEmail'))
        .max(256, t('validation.maxLength', { field: t('parents.email'), max: 256 })),
      phoneNumber: z
        .string()
        .regex(/^\+?[1-9]\d{6,14}$/, t('validation.invalidPhone'))
        .optional()
        .or(z.literal('')),
      password: z
        .string()
        .min(1, t('validation.required', { field: t('parents.password') }))
        .min(8, t('validation.minLength', { field: t('parents.password'), min: 8 })),
      confirmPassword: z.string().min(1, t('validation.required', { field: t('parents.confirmPassword') })),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordsMismatch'),
      path: ['confirmPassword'],
    });

export const linkParentSchema = (t: TFunction) =>
  z.object({
    parentUserId: z.string().min(1, t('validation.required', { field: t('parents.selectParent') })),
    relation: z.enum(['Father', 'Mother', 'Guardian'], {
      message: t('validation.required', { field: t('parents.relation') }),
    }),
  });

export type CreateParentFormData = z.infer<ReturnType<typeof createParentSchema>>;
export type LinkParentFormData = z.infer<ReturnType<typeof linkParentSchema>>;
