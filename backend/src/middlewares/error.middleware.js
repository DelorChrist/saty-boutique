// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Not found error handler
const notFound = (req, res, next) => {
    const error = new AppError(`Route non trouvée - ${req.originalUrl}`, 404);
    next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    } else {
        // Log only essential error info in production
        console.error(`Error ${err.statusCode || 500}: ${err.message}`);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Ressource non trouvée';
        error = new AppError(message, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Données en double détectées';
        error = new AppError(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(e => e.message).join(', ');
        error = new AppError(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Token invalide';
        error = new AppError(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expiré';
        error = new AppError(message, 401);
    }

    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        const message = err.errors.map(e => e.message).join(', ');
        error = new AppError(message, 400);
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        const message = 'Cette valeur existe déjà dans la base de données';
        error = new AppError(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erreur serveur',
        // Only include stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = {
    AppError,
    notFound,
    errorHandler
};
