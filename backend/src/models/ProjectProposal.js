import mongoose from "mongoose";
import { PROPOSAL_STATUS } from "../constants/index.js";

const projectProposalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ward",
      required: true,
      index: true,
    },

    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    // User manually enters the project location
    location: {
      type: String,
      required: true,
      trim: true,
    },

    estimatedBudget: {
      type: Number,
      required: true,
      min: 0,
    },

    fiscalYear: {
      type: String,
      required: true,
      trim: true,
    },

    justification: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(PROPOSAL_STATUS),
      default: PROPOSAL_STATUS.DRAFT,
      index: true,
    },

    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for ward-wise proposal filtering
projectProposalSchema.index({
  wardId: 1,
  status: 1,
  fiscalYear: 1,
});

const ProjectProposal = mongoose.model(
  "ProjectProposal",
  projectProposalSchema
);

export default ProjectProposal;