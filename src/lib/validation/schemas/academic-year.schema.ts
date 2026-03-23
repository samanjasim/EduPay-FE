import { z } from 'zod';

export const createAcademicYearSchema = z.object({
  startYear: z
    .number({ message: 'Start year is required' })
    .int()
    .min(2001, 'Start year must be 2001 or later')
    .max(2099, 'Start year must be 2099 or earlier'),
  endYear: z
    .number({ message: 'End year is required' })
    .int(),
  isCurrent: z.boolean(),
}).refine((data) => data.endYear === data.startYear + 1, {
  message: 'End year must be exactly start year + 1',
  path: ['endYear'],
});

export const updateAcademicYearSchema = z.object({
  startYear: z
    .number({ message: 'Start year is required' })
    .int()
    .min(2001, 'Start year must be 2001 or later')
    .max(2099, 'Start year must be 2099 or earlier'),
  endYear: z
    .number({ message: 'End year is required' })
    .int(),
}).refine((data) => data.endYear === data.startYear + 1, {
  message: 'End year must be exactly start year + 1',
  path: ['endYear'],
});

export const linkSchoolSchema = z.object({
  schoolId: z.string().min(1, 'School is required'),
  isCurrent: z.boolean().default(true),
});

export type CreateAcademicYearFormData = z.infer<typeof createAcademicYearSchema>;
export type UpdateAcademicYearFormData = z.infer<typeof updateAcademicYearSchema>;
export type LinkSchoolFormData = z.infer<typeof linkSchoolSchema>;
