import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const complaintStatusSchema = z.enum([
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
]);

// Citizen submits a complaint
export const createComplaintSchema = z.object({
  title: z.string().trim().min(3).max(150),

  description: z.string().trim().min(10).max(3000),

  category: z.string().trim().min(2).max(100),

  wardId: objectIdSchema,

  location: z.string().trim().min(3).max(200),
});

// Citizen edits their own complaint before it is reviewed (ward cannot change)
export const editComplaintSchema = z.object({
  title: z.string().trim().min(3).max(150),

  description: z.string().trim().min(10).max(3000),

  category: z.string().trim().min(2).max(100),

  location: z.string().trim().min(3).max(200),
});

// Official updates complaint status and assignment
export const updateComplaintSchema = z.object({
  status: complaintStatusSchema.optional(),

  assignedTo: objectIdSchema.nullable().optional(),
});

// Official sends a response
export const createComplaintResponseSchema = z.object({
  message: z.string().trim().min(2).max(2000),
});
