
import mongoose from "mongoose";
import {
  FEEDBACK_REACTION,
  MODERATION_STATUS,
} from "../constants/index.js";
export { FEEDBACK_REACTION, MODERATION_STATUS };

const projectFeedbackSchema = new mongoose.Schema(
  {
    // Project receiving the feedback
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // User who submitted the feedback
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // LIKE or DISLIKE; null for comment-only feedback
    reaction: {
      type: String,
      enum: Object.values(FEEDBACK_REACTION),
      default: null,
    },

    // Comment text; null for reaction-only feedback
    comment: {
      type: String,
      trim: true,
      default: null,
      maxlength: 1000,
    },

    // Moderation status of the feedback
    moderationStatus: {
      type: String,
      enum: Object.values(MODERATION_STATUS),
      default: MODERATION_STATUS.VISIBLE,
    },
  },
  {
    timestamps: true,
  }
);

// One feedback document per user for each project
projectFeedbackSchema.index(
  { projectId: 1, userId: 1 },
  { unique: true }
);

// Prevent completely empty feedback records
projectFeedbackSchema.pre("validate", function () {
  const hasReaction = this.reaction !== null;
  const hasComment =
    typeof this.comment === "string" && this.comment.trim().length > 0;

  if (!hasReaction && !hasComment) {
    this.invalidate(
      "comment",
      "Feedback must contain a reaction or a comment."
    );
  }
});

const ProjectFeedback = mongoose.model(
  "ProjectFeedback",
  projectFeedbackSchema
);

export default ProjectFeedback;
