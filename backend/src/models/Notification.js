import mongoose from 'mongoose';
import { NOTIFICATION_TYPE } from '../constants/index.js';
export { NOTIFICATION_TYPE };

const notificationSchema = new mongoose.Schema(
  {
    // User who should see this notification
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Category of the event (used for icons / grouping on the client)
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      default: NOTIFICATION_TYPE.GENERAL,
    },

    // Human-readable message shown in the notifications list
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // In-app link the notification points to (e.g. /citizen/complaints)
    link: {
      type: String,
      default: null,
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Newest-first lookups for a given recipient
notificationSchema.index({ recipientId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
