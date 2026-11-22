import Notification from '../models/Notification.js';
import { AppError } from '../utils/AppError.js';
import { NOTIFICATION_TYPE } from '../constants/index.js';

// Create a single notification. Safe to call from other services: failures are
// swallowed so a side-effect notification never breaks the main operation.
const notify = async ({ recipientId, type, message, link }) => {
  try {
    if (!recipientId || !message) return null;
    return await Notification.create({
      recipientId,
      type: type ?? NOTIFICATION_TYPE.GENERAL,
      message,
      link: link ?? null,
    });
  } catch (err) {
    console.error('[notification] failed to create:', err.message);
    return null;
  }
};

// Create the same notification for many recipients at once.
const notifyMany = async (recipientIds, { type, message, link }) => {
  try {
    const ids = [...new Set((recipientIds || []).map((id) => String(id)))];
    if (ids.length === 0 || !message) return;
    await Notification.insertMany(
      ids.map((recipientId) => ({
        recipientId,
        type: type ?? NOTIFICATION_TYPE.GENERAL,
        message,
        link: link ?? null,
      })),
    );
  } catch (err) {
    console.error('[notification] failed to create many:', err.message);
  }
};

const listForUser = async (user) =>
  Notification.find({ recipientId: user._id }).sort({ createdAt: -1 }).limit(50);

const countUnread = async (user) =>
  Notification.countDocuments({ recipientId: user._id, isRead: false });

const markRead = async (user, id) => {
  const notification = await Notification.findOne({
    _id: id,
    recipientId: user._id,
  });
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  if (!notification.isRead) {
    notification.isRead = true;
    await notification.save();
  }
  return notification;
};

const markAllRead = async (user) => {
  await Notification.updateMany(
    { recipientId: user._id, isRead: false },
    { $set: { isRead: true } },
  );
};

export default {
  notify,
  notifyMany,
  listForUser,
  countUnread,
  markRead,
  markAllRead,
};
