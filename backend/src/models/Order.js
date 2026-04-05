const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true // Nullable for guest checkout
    },
    guestInfo: {
        type: DataTypes.JSON, // { name, email, phone } if guest
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
        defaultValue: 'pending'
    },
    subtotal: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    shippingCost: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    discount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalAmount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    shippingAddress: {
        type: DataTypes.JSON, // Snapshot of address at time of order
        allowNull: false
    },
    customerNote: {
        type: DataTypes.TEXT
    },
    internalNote: {
        type: DataTypes.TEXT
    },
    paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    trackingNumber: {
        type: DataTypes.STRING(100)
    },
    estimatedDelivery: {
        type: DataTypes.DATE
    },
    confirmedAt: {
        type: DataTypes.DATE
    },
    processingAt: {
        type: DataTypes.DATE
    },
    shippedAt: {
        type: DataTypes.DATE
    },
    deliveredAt: {
        type: DataTypes.DATE
    },
    cancelledAt: {
        type: DataTypes.DATE
    }
});

module.exports = Order;
