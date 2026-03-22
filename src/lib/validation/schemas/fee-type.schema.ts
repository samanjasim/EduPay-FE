import { z } from 'zod';

export const createFeeTypeSchema = z.object({
  name: z
    .string()
    .min(1, 'Fee type name is required')
    .max(100, 'Fee type name must be 100 characters or less'),
});

export const updateFeeTypeSchema = z.object({
  name: z
    .string()
    .min(1, 'Fee type name is required')
    .max(100, 'Fee type name must be 100 characters or less'),
});

export type CreateFeeTypeFormData = z.infer<typeof createFeeTypeSchema>;
export type UpdateFeeTypeFormData = z.infer<typeof updateFeeTypeSchema>;
