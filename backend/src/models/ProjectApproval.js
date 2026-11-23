
import mongoose from "mongoose";
import {
  APPROVAL_ACTION,
  APPROVAL_DECISION,
} from "../constants/index.js";
export { APPROVAL_ACTION, APPROVAL_DECISION };

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
