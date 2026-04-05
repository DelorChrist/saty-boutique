const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const { apiLimiter } = require('./middlewares/rate-limit');
const { setCsrfToken, csrfProtection } = require('./middlewares/csrf');

const app = express();

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images from different origins
}));

// Cookie parser (needed for CSRF)
app.use(cookieParser());

const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
    const allowedOrigins = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean);

    if (allowedOrigins.length === 0) {
        console.warn('CORS_ORIGINS is empty. No cross-origin requests will be allowed in production.');
    }

    app.use(cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error('Not allowed by CORS'));
        }
    }));
} else {
    app.use(cors());
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Set CSRF token cookie for all requests
app.use(setCsrfToken);

// Apply CSRF protection to state-changing operations (only in production)
if (isProd) {
    app.use('/api/', csrfProtection);
}

// Request Logger (only in development)
if (!isProd) {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} [REQ] ${req.method} ${req.url}`);
        next();
    });
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const authRoutes = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');
const promoRoutes = require('./routes/promo.routes');
const customerRoutes = require('./routes/customer.routes');
const notificationRoutes = require('./routes/notification.routes');

app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Saty Boutique API' });
});

// Error handling middlewares (must be after all routes)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
