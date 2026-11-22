import { z } from 'zod';

// wardId and proposedBy are derived from the authenticated ward chair on the
// server, never trusted from the client.
export const createProjectProposalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Project title is required')
    .max(150, 'Title cannot exceed 150 characters'),

  description: z.string().trim().min(1, 'Project description is required'),

  category: z.string().trim().min(1, 'Project category is required'),

  location: z.string().trim().min(1, 'Project location is required'),

  estimatedBudget: z
    .number()
    .finite('Budget must be a valid number')
    .min(0, 'Budget cannot be negative'),

  fiscalYear: z.string().trim().min(1, 'Fiscal year is required'),

  justification: z.string().trim().min(1, 'Project justification is required'),
});

// Fields a ward chair or admin may edit.
export const updateProjectProposalSchema =
  createProjectProposalSchema.partial();
