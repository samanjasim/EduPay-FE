import { z } from 'zod';

export const createFeeStructureSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(500).nullable().optional(),
  feeTypeId: z.string().min(1, 'Fee type is required'),
  amount: z.number({ message: 'Amount is required' }).positive('Amount must be positive'),
  currency: z.string().min(1, 'Currency is required').max(10),
  academicYearId: z.string().min(1, 'Academic year is required'),
  frequency: z.enum(['OneTime', 'Monthly', 'Quarterly', 'Semester', 'Annual']),
  applicableGradeId: z.string().nullable().optional(),
  applicableSectionId: z.string().nullable().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  lateFeePercentage: z.number().min(0).max(100).optional().default(0),
});

export type CreateFeeStructureFormData = z.infer<typeof createFeeStructureSchema>;
