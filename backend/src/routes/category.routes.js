const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { upload, verifyMagicNumber } = require('../middlewares/upload');
const { optimizeImage } = require('../middlewares/image-optimizer');
const { authenticate, authorize } = require('../middlewares/auth');
const { body, param, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const categoryValidation = [
    body('name').trim().notEmpty().withMessage('Le nom de la catégorie est requis')
        .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
    body('slug').optional().trim().isSlug().withMessage('Le slug doit être valide (lettres, chiffres, tirets)'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('La description ne peut dépasser 500 caractères'),
    body('displayOrder').optional().isInt({ min: 0 }).withMessage('L\'ordre d\'affichage doit être un nombre entier positif'),
    handleValidationErrors
];

const categoryIdValidation = [
    param('id').isUUID().withMessage('ID de catégorie invalide'),
    handleValidationErrors
];

router.route('/')
    .get(categoryController.getCategories)
    .post(authenticate, authorize('admin'), upload.single('image'), verifyMagicNumber, optimizeImage, categoryValidation, categoryController.createCategory);

router.route('/:id')
    .put(authenticate, authorize('admin'), upload.single('image'), verifyMagicNumber, optimizeImage, categoryIdValidation, categoryValidation, categoryController.updateCategory)
    .delete(authenticate, authorize('admin'), categoryIdValidation, categoryController.deleteCategory);

router.get('/slug/:slug', categoryController.getCategoryBySlug);

module.exports = router;
