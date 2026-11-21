
import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const projectStatusSchema = z.enum([
  "APPROVED",
  "ASSIGNED",
  "ONGOING",
  "DELAYED",
  "COMPLETED",
  "CANCELLED",
]);

export const projectVisibilitySchema = z.enum([
  "PUBLIC",
  "INTERNAL",
]);

const dateSchema = z.coerce.date();

export const createProjectSchema = z.object({
  proposalId: objectIdSchema.nullable().optional(),

  title: z.string().trim().min(3).max(150),

  description: z.string().trim().min(10),

  wardId: objectIdSchema,

  municipalityId: objectIdSchema,

  fiscalYear: z.string().trim().min(4),

  approvedBudget: z.number().min(0),

  contractorId: objectIdSchema.nullable().optional(),

  departmentId: objectIdSchema.nullable().optional(),

  startDate: dateSchema.nullable().optional(),

  endDate: dateSchema.nullable().optional(),

  visibility: projectVisibilitySchema.default("PUBLIC"),
}).superRefine((data, ctx) => {
  if (
    data.startDate &&
    data.endDate &&
    data.endDate < data.startDate
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "End date cannot be before start date",
    });
  }
});

// Update permitted project information
export const updateProjectSchema = createProjectSchema
  .omit({ proposalId: true, municipalityId: true, wardId: true })
  .partial();

// Separate status update
export const updateProjectStatusSchema = z.object({
  status: projectStatusSchema,
});
