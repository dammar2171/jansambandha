
import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const approvalActionSchema = z.enum([
  "TECHNICAL_REVIEW",
  "ADMIN_REVIEW",
  "ASSEMBLY_DECISION",
  "ADMIN_APPROVAL",
  "RETURN",
  "REJECTION",
]);

export const approvalDecisionSchema = z.enum([
  "APPROVED",
  "REJECTED",
  "RETURNED",
  "NOTED",
]);

export const createProjectApprovalSchema = z.object({
  proposalId: objectIdSchema,

  action: approvalActionSchema,

  decision: approvalDecisionSchema,

  authorityBasis: z.string().trim().max(500).optional(),

  remarks: z.string().trim().max(2000).optional(),
});

export const updateProjectApprovalSchema =
  createProjectApprovalSchema.partial();
