const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PromoCode = sequelize.define('PromoCode', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: /^[A-Z0-9-]+$/
        }
    },
    discount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0 }
    },
    type: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        defaultValue: 'percentage'
    },
    expiryDate: {
        type: DataTypes.DATE
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    minOrderAmount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0 }
    },
    maxUses: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        validate: { min: 1 }
    },
    usedCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0 }
    }
});

module.exports = PromoCode;
