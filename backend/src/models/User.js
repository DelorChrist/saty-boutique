const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(191),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('customer', 'admin'),
        defaultValue: 'customer'
    },
    phone: {
        type: DataTypes.STRING(50)
    },
    addresses: {
        type: DataTypes.JSON, // Stores array of address objects
        defaultValue: []
    },
    status: {
        type: DataTypes.ENUM('pending', 'active', 'suspended'),
        defaultValue: 'pending'
    },
    lastLogin: {
        type: DataTypes.DATE
    }
});

module.exports = User;
