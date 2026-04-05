const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Category = require('./Category');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(191),
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    brand: {
        type: DataTypes.STRING,
        defaultValue: 'Saty Collection'
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    oldPrice: {
        type: DataTypes.INTEGER
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    images: {
        type: DataTypes.JSON, // Stores array of strings
        defaultValue: []
    },
    variants: {
        type: DataTypes.JSON, // Stores array of objects {size, stock, ...}
        defaultValue: []
    },
    features: {
        type: DataTypes.JSON, // Stores array of strings
        defaultValue: []
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isNew: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    reviewsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isBestSeller: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    categoryId: {
        type: DataTypes.CHAR(36),
        references: {
            model: 'Categories',
            key: 'id'
        }
    }
}, {
    hooks: {
        beforeSave: (product) => {
            if (product.changed('name') && !product.slug) {
                product.slug = product.name
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }
        }
    }
});

module.exports = Product;
