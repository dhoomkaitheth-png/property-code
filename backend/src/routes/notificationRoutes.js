const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, getUnreadCount, deleteNotification } = require('../controllers/notificationController');
const { authenticateUser } = require('../middleware/userAuth');

// All routes require authentication
router.use(authenticateUser);

// GET /api/notifications - Get user's notifications
router.get('/', getNotifications);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', getUnreadCount);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', markAllAsRead);

// PUT /api/notifications/:id/read - Mark single notification as read
router.put('/:id/read', markAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', deleteNotification);

module.exports = router;