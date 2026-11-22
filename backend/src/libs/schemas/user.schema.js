import { z } from 'zod';
import {
  ACCOUNT_STATUS,
  MONGODB_OBJECT_ID_REGEX,
  ROLES,
} from '../../constants/index.js';
import { isValidFullName } from '../../helper/validate.js';

export const userRoleSchema = z.enum(Object.values(ROLES));

export const accountStatusSchema = z.enum(Object.values(ACCOUNT_STATUS));

const objectIdSchema = z
  .string()
  .regex(MONGODB_OBJECT_ID_REGEX, 'Invalid MongoDB ObjectId');

const fullNameSchema = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .refine(isValidFullName, 'Invalid full name');

// Public citizen registration
export const citizenRegisterSchema = z.object({
  fullName: fullNameSchema,

  email: z.string().trim().email().toLowerCase(),

  password: z.string().min(8).max(72),

  municipalityId: objectIdSchema,

  wardId: objectIdSchema,
});

// Citizen login
export const citizenLoginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),

  password: z.string().min(1, 'Password is required'),
});

// Official / contractor login
export const officialLoginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),

  password: z.string().min(1, 'Password is required'),
});

// Change password (authenticated user)
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),

  newPassword: z.string().min(8).max(72),
});

// Official account creation
export const createOfficialUserSchema = z
  .object({
    fullName: fullNameSchema,

    email: z.string().trim().email().toLowerCase(),

    password: z.string().min(8).max(72),

    role: userRoleSchema.exclude([ROLES.CITIZEN]),

    // municipalityId is taken from the authenticated creator, not the client
    wardId: objectIdSchema.optional(),

    departmentId: objectIdSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === ROLES.WARD_CHAIR && !data.wardId) {
      ctx.addIssue({
        code: 'custom',
        path: ['wardId'],
        message: 'wardId is required for ward chair',
      });
    }

    if (data.role === ROLES.DEPARTMENT && !data.departmentId) {
      ctx.addIssue({
        code: 'custom',
        path: ['departmentId'],
        message: 'departmentId is required for DEPARTMENT',
      });
    }
  });

// Update account status
export const updateAccountStatusSchema = z.object({
  accountStatus: accountStatusSchema,
});
