const { sequelize } = require('../config/db');

const Product = require('./Product');
const Category = require('./Category');
const User = require('./User');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const PromoCode = require('./PromoCode');
const Notification = require('./Notification');

// Associations
// Category <-> Product
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Product <-> OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order <-> Notification
Order.hasMany(Notification, { foreignKey: 'orderId', onDelete: 'SET NULL' });
Notification.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

module.exports = {
    sequelize,
    Product,
    Category,
    User,
    Order,
    OrderItem,
    PromoCode,
    Notification
};
