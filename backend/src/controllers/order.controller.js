const { Order, OrderItem, Product, User } = require('../models');
const { sequelize } = require('../models');
const { createNotification } = require('./notification.controller');

// Creer une nouvelle commande
exports.createOrder = async (req, res, next) => {
    // Commaencer une transaction
    const transaction = await sequelize.transaction();

    try {
        if (!req.user?.id) {
            await transaction.rollback();
            return res.status(401).json({ message: 'Authentification requise' });
        }

        const { items, shippingAddress, paymentMethod, shippingCost, discount, customerNote } = req.body;
        const userId = req.user.id;

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction });
            if (!product) {
                await transaction.rollback();
                return res.status(404).json({ message: `Produit ${item.productId} non trouvé` });
            }

            // Check stock availability
            if (product.stock < item.quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    message: `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}`
                });
            }

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                productId: product.id,
                productName: product.name,
                variant: item.variant || { size: item.size || null, color: item.color || null },
                image: Array.isArray(product.images) ? product.images[0] : null,
                quantity: item.quantity,
                price: product.price
            });

            // Decrease stock
            await product.update(
                { stock: product.stock - item.quantity },
                { transaction }
            );
        }

        const normalizedShippingCost = Number.isFinite(Number(shippingCost)) ? Number(shippingCost) : 0;
        const normalizedDiscount = Number.isFinite(Number(discount)) ? Number(discount) : 0;
        const totalAmount = subtotal + normalizedShippingCost - normalizedDiscount;

        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

        // Create order
        const order = await Order.create({
            userId,
            guestInfo: null,
            subtotal,
            shippingCost: normalizedShippingCost,
            discount: normalizedDiscount,
            totalAmount,
            shippingAddress,
            customerNote: customerNote || null,
            paymentMethod,
            status: 'pending',
            paymentStatus: 'pending',
            estimatedDelivery
        }, { transaction });

        // Create order items
        for (const item of orderItems) {
            await OrderItem.create({
                orderId: order.id,
                ...item
            }, { transaction });
        }

        // Commit the transaction
        await transaction.commit();

        // Fetch complete order with items (outside transaction)
        const completeOrder = await Order.findByPk(order.id, {
            include: [{ model: OrderItem, as: 'items' }]
        });

        res.status(201).json(completeOrder);
    } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        next(error);
    }
};

// @desc    Get all orders (admin) or user's orders
// @route   GET /api/orders
exports.getOrders = async (req, res) => {
    try {
        const isAdmin = req.user?.role === 'admin';
        const userId = req.user?.id;
        const { page = 1, limit = 20, status } = req.query;

        const whereClause = isAdmin ? {} : { userId };
        if (status) {
            whereClause.status = status;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: orders } = await Order.findAndCountAll({
            where: whereClause,
            include: [
                { model: OrderItem, as: 'items' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        res.json({
            orders,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: OrderItem, as: 'items' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        // Check authorization
        const isAdmin = req.user?.role === 'admin';
        const isOwner = order.userId === req.user?.id;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status (admin only)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        const previousStatus = order.status;

        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        const now = new Date();
        if (status === 'confirmed') order.confirmedAt = now;
        if (status === 'processing') order.processingAt = now;
        if (status === 'shipped') order.shippedAt = now;
        if (status === 'delivered') {
            order.deliveredAt = now;
            order.paymentStatus = 'paid';
        }
        if (status === 'cancelled') order.cancelledAt = now;
        if (status === 'refunded') order.paymentStatus = 'refunded';

        await order.save();

        // Fetch complete order with items and user info
        const completeOrder = await Order.findByPk(order.id, {
            include: [
                { model: OrderItem, as: 'items' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ]
        });

        // Create notification for status changes
        if (status && status !== previousStatus && order.userId) {
            let notificationTitle = '';
            let notificationMessage = '';
            let notificationType = '';

            switch (status) {
                case 'confirmed':
                    notificationType = 'order_confirmed';
                    notificationTitle = '✅ Commande validée';
                    notificationMessage = `Votre commande #${order.orderNumber} a été confirmée ! Elle sera préparée dans les plus brefs délais. Date de livraison estimée : ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('fr-FR') : 'À définir'}`;
                    break;
                case 'processing':
                    notificationType = 'order_confirmed';
                    notificationTitle = '📦 Commande en préparation';
                    notificationMessage = `Votre commande #${order.orderNumber} est en cours de préparation.`;
                    break;
                case 'shipped':
                    notificationType = 'order_shipped';
                    notificationTitle = '🚚 Commande expédiée';
                    notificationMessage = `Votre commande #${order.orderNumber} a été expédiée ! Vous la recevrez bientôt.`;
                    break;
                case 'delivered':
                    notificationType = 'order_delivered';
                    notificationTitle = '🎉 Commande livrée';
                    notificationMessage = `Votre commande #${order.orderNumber} a été livrée avec succès ! Merci pour votre confiance.`;
                    break;
                case 'cancelled':
                    notificationType = 'order_cancelled';
                    notificationTitle = '❌ Commande annulée';
                    notificationMessage = `Votre commande #${order.orderNumber} a été annulée. Pour plus d'informations, contactez le service client.`;
                    break;
            }

            if (notificationTitle) {
                await createNotification(
                    order.userId,
                    order.id,
                    notificationType,
                    notificationTitle,
                    notificationMessage,
                    {
                        orderNumber: order.orderNumber,
                        totalAmount: order.totalAmount,
                        estimatedDelivery: order.estimatedDelivery
                    }
                );
            }
        }

        res.json(completeOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel order (owner)
// @route   PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        const isOwner = order.userId === req.user?.id;
        if (!isOwner) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        if (!['pending', 'confirmed', 'processing'].includes(order.status)) {
            return res.status(400).json({ message: 'Cette commande ne peut pas être annulée' });
        }

        order.status = 'cancelled';
        order.cancelledAt = new Date();

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
