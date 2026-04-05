const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth');

// Get user notifications
router.get('/', authenticate, notificationController.getUserNotifications);

// Get unread count
router.get('/unread/count', authenticate, notificationController.getUnreadCount);

// Mark all as read
router.put('/read-all', authenticate, notificationController.markAllAsRead);

// Mark one as read
router.put('/:id/read', authenticate, notificationController.markAsRead);

// Delete notification
router.delete('/:id', authenticate, notificationController.deleteNotification);

module.exports = router;
