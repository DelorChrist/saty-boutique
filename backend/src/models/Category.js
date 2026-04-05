const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Category = sequelize.define('Category', {
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
        type: DataTypes.TEXT
    },
    imageUrl: {
        type: DataTypes.STRING
    },
    parentId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    hooks: {
        beforeSave: (category) => {
            if (category.changed('name') && !category.slug) {
                category.slug = category.name
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }
        }
    }
});

module.exports = Category;
