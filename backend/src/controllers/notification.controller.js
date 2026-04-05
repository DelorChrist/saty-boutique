const { Notification, Order, OrderItem } = require('../models');

// @desc    Get user notifications
// @route   GET /api/notifications
exports.getUserNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'orderNumber', 'totalAmount', 'status'],
                    include: [
                        { model: OrderItem, as: 'items', attributes: ['productName', 'quantity', 'price'] }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(notifications);
    } catch (error) {
        next(error);
    }
};

exports.getUnreadCount = async (req, res, next) => {
    try {
        const count = await Notification.count({
            where: { 
                userId: req.user.id,
                isRead: false
            }
        });
        
        res.json({ count });
    } catch (error) {
        next(error);
    }
};

// Marquer les notifs comme lues 
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({
            where: { 
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification non trouvée' });
        }

        await notification.update({
            isRead: true,
            readAt: new Date()
        });

        res.json(notification);
    } catch (error) {
        next(error);
    }
};

// Marquer les notifs comme lues
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.update(
            { 
                isRead: true,
                readAt: new Date()
            },
            { 
                where: { 
                    userId: req.user.id,
                    isRead: false
                }
            }
        );

        res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({
            where: { 
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification non trouvée' });
        }

        await notification.destroy();
        res.json({ message: 'Notification supprimée' });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a notification (internal helper)
exports.createNotification = async (userId, orderId, type, title, message, data = {}) => {
    try {
        const notification = await Notification.create({
            userId,
            orderId,
            type,
            title,
            message,
            data
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};
