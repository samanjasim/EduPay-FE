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
  address: z.string().max(500, 'Address must be at most 500 characters').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
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
});

export type CreateSchoolFormData = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolFormData = z.infer<typeof updateSchoolSchema>;
export type UpdateSchoolSettingsFormData = z.infer<typeof updateSchoolSettingsSchema>;
