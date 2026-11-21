
import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const auditEntityTypeSchema = z.enum([
  "User",
  "Ward",
  "Department",
  "ProjectProposal",
  "ProjectApproval",
  "Project",
  "ProjectFeedback",
  "Complaint",
  "ProjectUpdate",
  "ProjectInspection",
]);

export const createAuditLogSchema = z.object({
  action: z.string().trim().min(2).max(100),

  entityType: auditEntityTypeSchema,

  entityId: objectIdSchema,

  before: z.record(z.string(), z.unknown()).nullable().optional(),

  after: z.record(z.string(), z.unknown()).nullable().optional(),
});
