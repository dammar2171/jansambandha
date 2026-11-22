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
