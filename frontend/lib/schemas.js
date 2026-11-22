import { z } from 'zod';

// Shared Zod schemas for frontend form validation (used with react-hook-form).

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name.'),
    email: z.string().trim().email('Enter a valid email address.'),
    wardId: z.string().min(1, 'Select your ward.'),
    password: z.string().min(8, 'Use at least 8 characters.'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match.',
  });

export const complaintResponseSchema = z.object({
  status: z.string(),
  message: z
    .string()
    .trim()
    .min(
      10,
      'Write a response of at least 10 characters. The citizen will read it.',
    ),
});

export const complaintSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Give the problem a short title, at least 5 characters.'),
  description: z
    .string()
    .trim()
    .min(
      20,
      'Describe the problem in at least 20 characters so the ward can act on it.',
    ),
  location: z.string().trim().optional(),
});

export const proposalSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters.'),
  category: z.string().min(1, 'Choose a category.'),
  place: z.string().trim().min(1, 'Enter a location.'),
  budget: z.coerce.number().min(0, 'Budget cannot be negative.'),
  households: z.coerce.number().min(0, 'Households cannot be negative.'),
  justification: z
    .string()
    .trim()
    .min(20, 'Justification must be at least 20 characters.'),
  benefits: z.string().trim().optional(),
});

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, 'Enter your current password.'),
    next: z
      .string()
      .min(8, 'New password must be at least 8 characters.')
      .max(72, 'New password must be at most 72 characters.'),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match.',
  });

// CAO "create municipal account" form. role is a UI label (OFFICIAL_ROLES);
// wardId / departmentId are required only for the roles that are scoped to one.
export const officialSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter the full name.'),
    email: z.string().trim().email('Enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    role: z.string().min(1, 'Choose a role.'),
    wardId: z.string().optional(),
    departmentId: z.string().optional(),
  })
  .refine((d) => d.role !== 'Ward Chair' || !!d.wardId, {
    path: ['wardId'],
    message: 'Select a ward for the ward chair.',
  })
  .refine((d) => d.role !== 'Department' || !!d.departmentId, {
    path: ['departmentId'],
    message: 'Select a department.',
  });
