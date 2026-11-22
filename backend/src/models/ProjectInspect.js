
import mongoose from "mongoose";

// Inspection quality results
export const QUALITY_STATUS = Object.freeze({
  PASS: "PASS",
  NEEDS_IMPROVEMENT: "NEEDS_IMPROVEMENT",
  FAIL: "FAIL",
  NOT_ASSESSED: "NOT_ASSESSED",
});

const projectInspectionSchema = new mongoose.Schema(
  {
    // Related project
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    // Progress report being inspected
    progressUpdateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectUpdate",
      required: true,
      index: true,
    },

    // Responsible department
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },

    // Department official conducting inspection
    inspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Independently verified physical progress
    verifiedProgress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // Quality assessment
    qualityStatus: {
      type: String,
      enum: Object.values(QUALITY_STATUS),
      required: true,
      default: QUALITY_STATUS.NOT_ASSESSED,
    },

    // Inspection findings
    observations: {
      type: String,
      required: true,
      trim: true,
    },

    // Inspection evidence
    evidenceUrls: {
      type: [String],
      default: [],
    },

    // Actual inspection date
    inspectionDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Retrieve inspection history for a project
projectInspectionSchema.index({
  projectId: 1,
  inspectionDate: -1,
});

const ProjectInspection = mongoose.model(
  "ProjectInspection",
  projectInspectionSchema
);

export default ProjectInspection;
