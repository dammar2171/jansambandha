import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const qualityStatusSchema = z.enum([
  'PASS',
  'NEEDS_IMPROVEMENT',
  'FAIL',
  'NOT_ASSESSED',
]);

export const createProjectInspectionSchema = z.object({
  projectId: objectIdSchema,

  progressUpdateId: objectIdSchema,

  departmentId: objectIdSchema,

  verifiedProgress: z.number().min(0).max(100),

  qualityStatus: qualityStatusSchema,

  observations: z.string().trim().min(5).max(3000),

  evidenceUrls: z.array(z.string().url()).max(10).default([]),

  inspectionDate: z.coerce.date(),
});

// Department verifies a progress update (projectId/progressUpdateId/departmentId come from the server)
export const verifyProgressSchema = z.object({
  verifiedProgress: z.number().min(0).max(100),

  qualityStatus: qualityStatusSchema,

  observations: z.string().trim().min(5).max(3000),

  evidenceUrls: z.array(z.string().url()).max(10).default([]),

  inspectionDate: z.coerce.date().optional(),
});

// Department asks the contractor for a correction
export const requestCorrectionSchema = z.object({
  note: z.string().trim().min(5).max(2000),
});
