const jwt = require('jsonwebtoken');

const isDevelopment = process.env.NODE_ENV !== 'production';

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }
    return secret;
};

// Export getJwtSecret for use in controllers
exports.getJwtSecret = getJwtSecret;

// Middleware to verify JWT token
exports.authenticate = (req, res, next) => {
    try {
        if (isDevelopment) {
            console.log(`[AUTH] Authenticating request to ${req.url}`);
        }
        const authHeader = req.headers.authorization;

        const token = authHeader?.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        const decoded = jwt.verify(token, getJwtSecret());
        req.user = decoded; // { id, email, role }
        next();
    } catch (error) {
        if (isDevelopment) {
            console.error(`[AUTH] Token invalid: ${error.message}`);
        }
        return res.status(401).json({ message: 'Token invalide' });
    }
};

// Middleware to check if user has specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (isDevelopment) {
            console.log(`[AUTH] Authorization check - Required roles: ${roles.join(', ')}, User: ${JSON.stringify(req.user)}`);
        }
        
        if (!req.user || !roles.includes(req.user.role)) {
            if (isDevelopment) {
                console.error(`[AUTH] Authorization DENIED - User role: ${req.user?.role}, Required: ${roles.join(', ')}`);
            }
            return res.status(403).json({ 
                message: 'Accès refusé. Autorisation insuffisante.'
            });
        }
        
        if (isDevelopment) {
            console.log(`[AUTH] Authorization SUCCESS`);
        }
        next();
    };
};

// Middleware to check if user is admin (keep for compatibility)
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Accès refusé. Admin uniquement.' });
    }
};
