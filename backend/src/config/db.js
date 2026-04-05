const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'saty_boutique',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '1234',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false,
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Connected using Sequelize.');

        // Synch models (removed alter: true to prevent too many keys error)
        // Use migrations in production instead
        await sequelize.sync();
        console.log('Database Synced.');

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, connectDB };
