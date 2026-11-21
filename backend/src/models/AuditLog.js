
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    // User who performed the action
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Action performed
    action: {
      type: String,
      required: true,
      trim: true,
    },

    // Type of affected entity
    entityType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // ID of the affected document
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Previous values before the action
    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // New values after the action
    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Retrieve audit history for a particular entity
auditLogSchema.index({
  entityType: 1,
  entityId: 1,
  createdAt: -1,
});

// Retrieve actions performed by a particular user
auditLogSchema.index({
  actorUserId: 1,
  createdAt: -1,
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
