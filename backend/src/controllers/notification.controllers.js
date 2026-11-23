import notificationServices from '../sevices/notification.services.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const listNotifications = asyncHandler(async (req, res) => {
  const data = await notificationServices.listForUser(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Notifications fetched successfully', data));
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationServices.countUnread(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Unread count fetched successfully', { count }));
});

const markRead = asyncHandler(async (req, res) => {
  const data = await notificationServices.markRead(req.user, req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Notification marked as read', data));
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationServices.markAllRead(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, 'All notifications marked as read'));
});

export default {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
};
