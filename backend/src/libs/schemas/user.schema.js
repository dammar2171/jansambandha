
import { z } from "zod";

export const userRoleSchema = z.enum([
  "CITIZEN",
  "WARD_CHAIR",
  "DEPARTMENT",
  "GENERAL_ADMIN",
  "CAO",
  "CONTRACTOR",
]);

export const accountStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
]);

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

  role: userRoleSchema.exclude(["CITIZEN"]),

  municipalityId: objectIdSchema,

  wardId: objectIdSchema.optional(),

  departmentId: objectIdSchema.optional(),
}).superRefine((data, ctx) => {
  if (
    ["WARD_CHAIR"].includes(data.role) &&
    !data.wardId
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["wardId"],
      message: "wardId is required for WARD_CHAIR",
    });
  }

  if (
    data.role === "DEPARTMENT" &&
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
