
import mongoose from "mongoose";

// Types of actions performed during the proposal approval workflow
export const APPROVAL_ACTION = Object.freeze({
  TECHNICAL_REVIEW: "TECHNICAL_REVIEW",
  ADMIN_REVIEW: "ADMIN_REVIEW",
  ASSEMBLY_DECISION: "ASSEMBLY_DECISION",
  ADMIN_APPROVAL: "ADMIN_APPROVAL",
  RETURN: "RETURN",
  REJECTION: "REJECTION",
});

// Possible decisions recorded for an action
export const APPROVAL_DECISION = Object.freeze({
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RETURNED: "RETURNED",
  NOTED: "NOTED",
});

const projectApprovalSchema = new mongoose.Schema(
  {
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectProposal",
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: Object.values(APPROVAL_ACTION),
      required: true,
    },

    decision: {
      type: String,
      enum: Object.values(APPROVAL_DECISION),
      required: true,
    },

    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    authorityBasis: {
      type: String,
      trim: true,
      default: "",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    decisionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Retrieve a proposal's approval history chronologically
projectApprovalSchema.index({
  proposalId: 1,
  decisionDate: 1,
});

const ProjectApproval = mongoose.model(
  "ProjectApproval",
  projectApprovalSchema
);

export default ProjectApproval;
