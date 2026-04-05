const crypto = require('crypto');

const csrfProtection = (req, res, next) => {
    // Skip CSRF for GET, HEAD, OPTIONS (safe methods)
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Skip in development mode
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }

    const tokenFromHeader = req.headers['x-xsrf-token'];
    const tokenFromCookie = req.cookies['XSRF-TOKEN'];

    if (!tokenFromHeader || !tokenFromCookie) {
        return res.status(403).json({ message: 'Token CSRF manquant' });
    }

    const headerBuf = Buffer.from(tokenFromHeader);
    const cookieBuf = Buffer.from(tokenFromCookie);

    if (headerBuf.length !== cookieBuf.length || !crypto.timingSafeEqual(headerBuf, cookieBuf)) {
        return res.status(403).json({ message: 'Token CSRF invalide' });
    }

    next();
};

// Middleware to set CSRF token cookie
const setCsrfToken = (req, res, next) => {
    if (!req.cookies['XSRF-TOKEN']) {
        const token = crypto.randomBytes(32).toString('hex');
        res.cookie('XSRF-TOKEN', token, {
            httpOnly: false, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 
        });
    }
    next();
};

module.exports = {
    csrfProtection,
    setCsrfToken
};
