import { z } from 'zod';

export const createSchoolSchema = z.object({
  name: z
    .string()
    .min(1, 'School name is required')
    .min(2, 'School name must be at least 2 characters')
    .max(200, 'School name must be at most 200 characters'),
  code: z
    .string()
    .min(1, 'School code is required')
    .min(2, 'School code must be at least 2 characters')
    .max(20, 'School code must be at most 20 characters'),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be at most 100 characters'),
  subscriptionPlan: z.enum(['Basic', 'Standard', 'Premium'], {
    message: 'Subscription plan is required',
  }),
  academicYearStart: z
    .number({ message: 'Academic year start is required' })
    .int()
    .min(2000, 'Invalid year')
    .max(2100, 'Invalid year'),
  academicYearEnd: z
    .number({ message: 'Academic year end is required' })
    .int()
    .min(2000, 'Invalid year')
    .max(2100, 'Invalid year'),
  address: z.string().max(500, 'Address must be at most 500 characters').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
}).refine((data) => data.academicYearEnd === data.academicYearStart + 1, {
  message: 'Academic year end must be exactly one year after start',
  path: ['academicYearEnd'],
});

export const updateSchoolSchema = z.object({
  name: z
    .string()
    .min(1, 'School name is required')
    .min(2, 'School name must be at least 2 characters')
    .max(200, 'School name must be at most 200 characters'),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be at most 100 characters'),
  address: z.string().max(500, 'Address must be at most 500 characters').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const updateSchoolSettingsSchema = z.object({
  currency: z.string().min(1, 'Currency is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  defaultLanguage: z.string().min(1, 'Default language is required'),
  allowPartialPayments: z.boolean(),
  allowInstallments: z.boolean(),
  maxInstallments: z
    .number()
    .int()
    .min(1, 'Minimum 1 installment')
    .max(24, 'Maximum 24 installments'),
  lateFeePercentage: z
    .number()
    .min(0, 'Late fee cannot be negative'),
});

export type CreateSchoolFormData = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolFormData = z.infer<typeof updateSchoolSchema>;
export type UpdateSchoolSettingsFormData = z.infer<typeof updateSchoolSettingsSchema>;
