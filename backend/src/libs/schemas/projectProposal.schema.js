import { z } from 'zod';
import { MONGODB_OBJECT_ID_REGEX } from '../../constants/index.js';

export const createProjectProposalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Project title is required')
    .max(150, 'Title cannot exceed 150 characters'),

  description: z.string().trim().min(1, 'Project description is required'),

  wardId: z.string().regex(MONGODB_OBJECT_ID_REGEX, 'Invalid ward ID'),

  category: z.string().trim().min(1, 'Project category is required'),

  location: z.string().trim().min(1, 'Project location is required'),

  estimatedBudget: z
    .number()
    .finite('Budget must be a valid number')
    .min(0, 'Budget cannot be negative'),

  fiscalYear: z.string().trim().min(1, 'Fiscal year is required'),

  justification: z.string().trim().min(1, 'Project justification is required'),

  proposedBy: z
    .string()
    .regex(MONGODB_OBJECT_ID_REGEX, 'Invalid user ID')
    .optional(),
});

// Fields a ward chair or admin may edit. wardId and proposedBy are not editable.
export const updateProjectProposalSchema = createProjectProposalSchema
  .omit({ wardId: true, proposedBy: true })
  .partial();
