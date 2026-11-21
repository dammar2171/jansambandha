
import { z } from "zod";
import { ACCOUNT_STATUS, ROLES } from "../../helper/constants.js";

export const userRoleSchema = z.enum(Object.values(ROLES));

export const accountStatusSchema = z.enum(Object.values(ACCOUNT_STATUS));

const objectIdSchema = z.string().regex(
  /^[0-9a-fA-F]{24}$/,
  "Invalid MongoDB ObjectId"
);

// Public citizen registration
export const citizenRegisterSchema = z.object({
  fullName: z.string().trim().min(2).max(100),

  email: z.string().trim().email().toLowerCase(),

  password: z.string().min(8).max(72),

  municipalityId: objectIdSchema,

  wardId: objectIdSchema,
});

// Official account creation
export const createOfficialUserSchema = z.object({
  fullName: z.string().trim().min(2).max(100),

  email: z.string().trim().email().toLowerCase(),

  password: z.string().min(8).max(72),

  role: userRoleSchema.exclude([ROLES.CITIZEN]),

  municipalityId: objectIdSchema,

  wardId: objectIdSchema.optional(),

  departmentId: objectIdSchema.optional(),
}).superRefine((data, ctx) => {
  if (
    data.role === ROLES.WARD_CHAIR &&
    !data.wardId
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["wardId"],
      message: "wardId is required for ward chair",
    });
  }

  if (
    data.role === ROLES.DEPARTMENT &&
    !data.departmentId
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["departmentId"],
      message: "departmentId is required for DEPARTMENT",
    });
  }
});

// Update account status
export const updateAccountStatusSchema = z.object({
  accountStatus: accountStatusSchema,
});
