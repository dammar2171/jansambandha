import { z } from 'zod';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

export const projectStatusSchema = z.enum([
  'APPROVED',
  'ASSIGNED',
  'ONGOING',
  'DELAYED',
  'COMPLETED',
  'CANCELLED',
]);

export const projectVisibilitySchema = z.enum(['PUBLIC', 'INTERNAL']);

const dateSchema = z.coerce.date();

// Base fields. municipalityId is derived from the creator, never the client.
const projectBaseSchema = z.object({
  proposalId: objectIdSchema.optional(),

  title: z.string().trim().min(3).max(150).optional(),

  description: z.string().trim().min(10).optional(),

  wardId: objectIdSchema.optional(),

  fiscalYear: z.string().trim().min(4).optional(),

  approvedBudget: z.number().min(0),

  contractorId: objectIdSchema.optional(),

  departmentId: objectIdSchema,

  startDate: dateSchema.optional(),

  endDate: dateSchema.optional(),

  visibility: projectVisibilitySchema.optional(),
});

export const createProjectSchema = projectBaseSchema.superRefine(
  (data, ctx) => {
    // Without a proposal, the core fields must be provided directly
    if (!data.proposalId) {
      for (const field of ['title', 'description', 'wardId', 'fiscalYear']) {
        if (!data[field]) {
          ctx.addIssue({
            code: 'custom',
            path: [field],
            message: `${field} is required when no proposalId is given`,
          });
        }
      }
    }

    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'End date cannot be before start date',
      });
    }
  },
);

// Update permitted project info (derived from the base object, not the refined one)
export const updateProjectSchema = projectBaseSchema
  .omit({ proposalId: true })
  .partial();

// Separate status update
export const updateProjectStatusSchema = z.object({
  status: projectStatusSchema,
});
