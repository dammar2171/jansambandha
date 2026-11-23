import express from 'express';
import notificationControllers from '../controllers/notification.controllers.js';
import authMiddleware from '../middlewares/authenticate.js';
import validateObjectId from '../middlewares/validateObjectId.js';

const router = express.Router();

// Any authenticated user: their own notifications
router.get('/', authMiddleware.protect, notificationControllers.listNotifications);

// Unread count (for the sidebar badge)
router.get(
  '/unread-count',
  authMiddleware.protect,
  notificationControllers.getUnreadCount,
);

// Mark every notification as read
router.patch(
  '/read-all',
  authMiddleware.protect,
  notificationControllers.markAllRead,
);

// Mark a single notification as read
router.patch(
  '/:id/read',
  authMiddleware.protect,
  validateObjectId('id'),
  notificationControllers.markRead,
);

export default router;
