
import mongoose from "mongoose";

// Complaint lifecycle statuses
export const COMPLAINT_STATUS = Object.freeze({
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
});

// Embedded schema for official responses
const responseSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    // Unique complaint tracking reference
    trackingCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Citizen who submitted the complaint
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Responsible ward
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ward",
      required: true,
      index: true,
    },

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

    category: {
      type: String,
      required: true,
      trim: true,
    },

    // Manually entered location, not a public home address
    location: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
      default: COMPLAINT_STATUS.SUBMITTED,
      index: true,
    },

    // Official responsible for handling the complaint
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Multiple official responses
    responses: {
      type: [responseSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Ward-wise complaint filtering
complaintSchema.index({
  wardId: 1,
  status: 1,
  createdAt: -1,
});

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
