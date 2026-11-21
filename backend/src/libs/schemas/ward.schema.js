
import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const createWardSchema = z.object({
  name: z.string().trim().min(1).max(100),

  wardNumber: z.number().int().positive(),

  municipalityId: objectIdSchema,

  wardChairUserId: objectIdSchema.nullable().optional(),

  isActive: z.boolean().default(true),
});

export const updateWardSchema = createWardSchema
  .omit({ municipalityId: true })
  .partial();
