
import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const projectUpdateStatusSchema = z.enum([
  "SUBMITTED",
  "NEEDS_CORRECTION",
  "VERIFIED",
  "REJECTED",
]);

const dateSchema = z.coerce.date();

export const createProjectUpdateSchema = z.object({
  reportedProgress: z.number().min(0).max(100),

  workDescription: z.string().trim().min(10).max(3000),

  evidenceUrls: z.array(
    z.string().url()
  ).max(10).default([]),

  periodFrom: dateSchema,

  periodTo: dateSchema,
}).superRefine((data, ctx) => {
  if (data.periodTo < data.periodFrom) {
    ctx.addIssue({
      code: "custom",
      path: ["periodTo"],
      message: "Period end date cannot be before start date",
    });
  }
});
