const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_MAGIC = {
    'ffd8ff': 'image/jpeg',
    '89504e47': 'image/png',
    '52494646': 'image/webp',
    '47494638': 'image/gif'
};

const checkMagicNumber = (filePath) => {
    const buffer = Buffer.alloc(4);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);
    const hex = buffer.toString('hex').toLowerCase();
    return Object.keys(ALLOWED_MAGIC).some(magic => hex.startsWith(magic));
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
    }
});

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
        return cb(new Error('Type de fichier non autorisé'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Middleware post-upload pour vérifier le magic number réel
const verifyMagicNumber = (req, res, next) => {
    if (!req.file) return next();
    if (!checkMagicNumber(req.file.path)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Fichier invalide ou corrompu' });
    }
    next();
};

module.exports = { upload, verifyMagicNumber };
