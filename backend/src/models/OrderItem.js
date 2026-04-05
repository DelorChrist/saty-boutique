const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: true // Product might be deleted later, keep record
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false // Snapshot of name
    },
    variant: {
        type: DataTypes.JSON, // { size: 'M', color: 'Red' }
        allowNull: true
    },
    image: {
        type: DataTypes.STRING
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER, // Unit price at puurchase
        allowNull: false
    }
});

module.exports = OrderItem;
