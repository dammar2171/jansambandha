
import mongoose from "mongoose";
import { PROJECT_STATUS, PROJECT_VISIBILITY } from "../constants/index.js";
export { PROJECT_STATUS, PROJECT_VISIBILITY };

const projectSchema = new mongoose.Schema(
  {
    // Original approved proposal (null for permitted direct creation)
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectProposal",
      default: null,
      index: true,
    },

    // Project information
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

    // Organizational scope
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ward",
      required: true,
      index: true,
    },

    municipalityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Municipality",
      required: true,
      index: true,
    },

    fiscalYear: {
      type: String,
      required: true,
      trim: true,
    },

    // Approved financial amount
    approvedBudget: {
      type: Number,
      required: true,
      min: 0,
    },

    // Project assignment
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    // Planned implementation dates
    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    // Project lifecycle
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.APPROVED,
      index: true,
    },

    // Who can view this project
    visibility: {
      type: String,
      enum: Object.values(PROJECT_VISIBILITY),
      default: PROJECT_VISIBILITY.PUBLIC,
    },
  },
  {
    timestamps: true,
  }
);

// Useful for municipality-level and ward-level project filtering
projectSchema.index({
  municipalityId: 1,
  wardId: 1,
  status: 1,
  fiscalYear: 1,
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
