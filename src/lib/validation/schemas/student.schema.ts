import { z } from 'zod';

export const createStudentSchema = z.object({
  fullNameAr: z
    .string()
    .min(1, 'Arabic name is required')
    .max(100, 'Arabic name must be 100 characters or less'),
  fullNameEn: z
    .string()
    .min(1, 'English name is required')
    .max(100, 'English name must be 100 characters or less'),
  nationalId: z
    .string()
    .max(20, 'National ID must be 20 characters or less')
    .optional()
    .or(z.literal('')),
  studentCode: z
    .string()
    .min(1, 'Student code is required')
    .max(30, 'Student code must be 30 characters or less'),
  gradeId: z
    .string()
    .min(1, 'Grade is required'),
  sectionId: z
    .string()
    .optional()
    .or(z.literal('')),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(
      (val) => !val || new Date(val) <= new Date(),
      'Date of birth cannot be in the future'
    ),
  gender: z.enum(['Male', 'Female'], {
    message: 'Gender is required',
  }),
  enrollmentAcademicYearId: z
    .string()
    .min(1, 'Academic year is required'),
});

export const updateStudentSchema = z.object({
  fullNameAr: z
    .string()
    .min(1, 'Arabic name is required')
    .max(100, 'Arabic name must be 100 characters or less'),
  fullNameEn: z
    .string()
    .min(1, 'English name is required')
    .max(100, 'English name must be 100 characters or less'),
  nationalId: z
    .string()
    .max(20, 'National ID must be 20 characters or less')
    .optional()
    .or(z.literal('')),
  studentCode: z
    .string()
    .min(1, 'Student code is required')
    .max(30, 'Student code must be 30 characters or less'),
  gradeId: z
    .string()
    .min(1, 'Grade is required'),
  sectionId: z
    .string()
    .optional()
    .or(z.literal('')),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(
      (val) => !val || new Date(val) <= new Date(),
      'Date of birth cannot be in the future'
    ),
  gender: z.enum(['Male', 'Female'], {
    message: 'Gender is required',
  }),
});

export type CreateStudentFormData = z.infer<typeof createStudentSchema>;
export type UpdateStudentFormData = z.infer<typeof updateStudentSchema>;
