const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Erreur de validation',
            errors: errors.array() 
        });
    }
    next();
};

// Auth validation rules
const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('Le prénom est requis')
        .isLength({ max: 50 })
        .withMessage('Le prénom ne doit pas dépasser 50 caractères'),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Le nom est requis')
        .isLength({ max: 50 })
        .withMessage('Le nom ne doit pas dépasser 50 caractères'),
    handleValidationErrors
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Le mot de passe est requis'),
    handleValidationErrors
];

// Product validation rules
const createProductValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Le nom du produit est requis')
        .isLength({ max: 200 })
        .withMessage('Le nom ne doit pas dépasser 200 caractères'),
    body('description')
        .trim()
        .optional()
        .isLength({ max: 2000 })
        .withMessage('La description ne doit pas dépasser 2000 caractères'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Le prix doit être un nombre positif'),
    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Le stock doit être un nombre entier positif'),
    body('categoryId')
        .optional()
        .isUUID()
        .withMessage('ID de catégorie invalide'),
    handleValidationErrors
];

const updateProductValidation = [
    param('id')
        .isUUID()
        .withMessage('ID de produit invalide'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Le nom doit contenir entre 1 et 200 caractères'),
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Le prix doit être un nombre positif'),
    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Le stock doit être un nombre entier positif'),
    handleValidationErrors
];

// Order validation rules
const createOrderValidation = [
    body('items')
        .isArray({ min: 1 })
        .withMessage('La commande doit contenir au moins un article'),
    body('items.*.productId')
        .notEmpty()
        .withMessage('ID de produit requis'),
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('La quantité doit être au moins 1'),
    body('shippingAddress.address')
        .trim()
        .notEmpty()
        .withMessage('L\'adresse de livraison est requise'),
    body('shippingAddress.city')
        .trim()
        .notEmpty()
        .withMessage('La ville est requise'),
    body('paymentMethod')
        .isIn(['cash', 'mobile_money', 'card'])
        .withMessage('Méthode de paiement invalide'),
    handleValidationErrors
];

// Category validation rules
const createCategoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Le nom de la catégorie est requis')
        .isLength({ max: 100 })
        .withMessage('Le nom ne doit pas dépasser 100 caractères'),
    body('slug')
        .trim()
        .notEmpty()
        .withMessage('Le slug est requis')
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets'),
    handleValidationErrors
];

// Promo code validation rules
const createPromoValidation = [
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Le code promo est requis')
        .isLength({ min: 3, max: 20 })
        .withMessage('Le code doit contenir entre 3 et 20 caractères')
        .matches(/^[A-Z0-9-]+$/)
        .withMessage('Le code doit contenir uniquement des lettres majuscules, chiffres et tirets'),
    body('discountType')
        .isIn(['percentage', 'fixed'])
        .withMessage('Type de réduction invalide'),
    body('discountValue')
        .isFloat({ min: 0 })
        .withMessage('La valeur de réduction doit être positive'),
    body('minOrderValue')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La valeur minimale de commande doit être positive'),
    body('maxUses')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Le nombre maximum d\'utilisations doit être au moins 1'),
    handleValidationErrors
];

// Pagination validation
const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Le numéro de page doit être au moins 1'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('La limite doit être entre 1 et 100'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    registerValidation,
    loginValidation,
    createProductValidation,
    updateProductValidation,
    createOrderValidation,
    createCategoryValidation,
    createPromoValidation,
    paginationValidation
};
