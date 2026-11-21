
import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2).max(100),

  municipalityId: objectIdSchema,

  headUserId: objectIdSchema.nullable().optional(),

  isActive: z.boolean().default(true),
});

export const updateDepartmentSchema = createDepartmentSchema
  .omit({ municipalityId: true })
  .partial();
