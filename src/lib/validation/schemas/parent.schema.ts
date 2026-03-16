import { z } from 'zod';

export const createParentSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(100, 'First name must be at most 100 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(100, 'Last name must be at most 100 characters'),
    username: z
      .string()
      .min(1, 'Username is required')
      .max(100, 'Username must be at most 100 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address')
      .max(256, 'Email must be at most 256 characters'),
    phoneNumber: z
      .string()
      .regex(/^\+?[1-9]\d{6,14}$/, 'Phone number must be in E.164 format (e.g., +9647701234567)')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm the password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const linkParentSchema = z.object({
  parentUserId: z.string().min(1, 'Please select a parent'),
  relation: z.enum(['Father', 'Mother', 'Guardian'], {
    message: 'Please select a relation',
  }),
});

export type CreateParentFormData = z.infer<typeof createParentSchema>;
export type LinkParentFormData = z.infer<typeof linkParentSchema>;
