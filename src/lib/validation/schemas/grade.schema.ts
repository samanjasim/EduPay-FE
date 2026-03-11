import { z } from 'zod';

const sectionInputSchema = z.object({
  name: z
    .string()
    .min(1, 'Section name is required')
    .max(20, 'Section name must be 20 characters or less'),
  capacity: z
    .number()
    .int()
    .min(1, 'Capacity must be at least 1')
    .nullable()
    .optional(),
});

export const createGradeSchema = z.object({
  name: z
    .string()
    .min(1, 'Grade name is required')
    .max(50, 'Grade name must be 50 characters or less'),
  sortOrder: z
    .number({ message: 'Sort order is required' })
    .int()
    .min(0, 'Sort order must be 0 or greater'),
  sections: z.array(sectionInputSchema).optional(),
});

export const updateGradeSchema = z.object({
  name: z
    .string()
    .min(1, 'Grade name is required')
    .max(50, 'Grade name must be 50 characters or less'),
  sortOrder: z
    .number({ message: 'Sort order is required' })
    .int()
    .min(0, 'Sort order must be 0 or greater'),
});

export const sectionSchema = z.object({
  name: z
    .string()
    .min(1, 'Section name is required')
    .max(20, 'Section name must be 20 characters or less'),
  capacity: z
    .number()
    .int()
    .min(1, 'Capacity must be at least 1')
    .nullable()
    .optional(),
});

export type CreateGradeFormData = z.infer<typeof createGradeSchema>;
export type UpdateGradeFormData = z.infer<typeof updateGradeSchema>;
export type SectionFormData = z.infer<typeof sectionSchema>;
