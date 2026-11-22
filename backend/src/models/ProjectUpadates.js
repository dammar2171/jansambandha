
import mongoose from "mongoose";

// Progress report statuses
export const UPDATE_STATUS = Object.freeze({
  SUBMITTED: "SUBMITTED",
  NEEDS_CORRECTION: "NEEDS_CORRECTION",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
});

const projectUpdateSchema = new mongoose.Schema(
  {
    // Related project
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    // Contractor submitting the report
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Contractor-reported progress percentage
    reportedProgress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // Work completed during reporting period
    workDescription: {
      type: String,
      required: true,
      trim: true,
    },

    // Photo/document links
    evidenceUrls: {
      type: [String],
      default: [],
    },

    // Reporting period
    periodFrom: {
      type: Date,
      required: true,
    },

    periodTo: {
      type: Date,
      required: true,
    },

    // Verification status
    status: {
      type: String,
      enum: Object.values(UPDATE_STATUS),
      default: UPDATE_STATUS.SUBMITTED,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validate reporting period
projectUpdateSchema.pre("validate", function () {
  if (
    this.periodFrom &&
    this.periodTo &&
    this.periodTo < this.periodFrom
  ) {
    this.invalidate(
      "periodTo",
      "Period end date cannot be before start date."
    );
  }
});

// Project-wise progress history
projectUpdateSchema.index({
  projectId: 1,
  createdAt: -1,
});

const ProjectUpdate = mongoose.model(
  "ProjectUpdate",
  projectUpdateSchema
);

export default ProjectUpdate;
