const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, isAdmin } = require('../middlewares/auth');
const { createOrderValidation, paginationValidation } = require('../middlewares/validation');
const { orderLimiter } = require('../middlewares/rate-limit');

// Authenticated routes
router.post('/', authenticate, orderLimiter, createOrderValidation, orderController.createOrder);
router.get('/', authenticate, paginationValidation, orderController.getOrders); // User's orders or all (if admin)
router.get('/:id', authenticate, orderController.getOrderById);
router.put('/:id/cancel', authenticate, orderController.cancelOrder);

// Admin only
router.put('/:id/status', authenticate, isAdmin, orderController.updateOrderStatus);

module.exports = router;
