const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promo.controller');
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

const promoValidation = [
    body('code').trim().notEmpty().withMessage('Le code promo est requis')
        .isLength({ min: 3, max: 50 }).withMessage('Le code doit contenir entre 3 et 50 caractères')
        .matches(/^[A-Z0-9_-]+$/).withMessage('Le code ne peut contenir que des lettres majuscules, chiffres, tirets et underscores'),
    body('type').isIn(['percentage', 'fixed']).withMessage('Le type de réduction doit être "percentage" ou "fixed"'),
    body('discount').isFloat({ min: 0 }).withMessage('La valeur de réduction doit être un nombre positif'),
    body('minOrderAmount').optional().isFloat({ min: 0 }).withMessage('Le montant minimum doit être un nombre positif'),
    body('expiryDate').optional().isISO8601().withMessage('La date d\'expiration doit être une date valide'),
    body('isActive').optional().isBoolean().withMessage('isActive doit être un booléen'),
    handleValidationErrors
];

const promoIdValidation = [
    param('id').isUUID().withMessage('ID de code promo invalide'),
    handleValidationErrors
];

const validatePromoValidation = [
    body('code').trim().notEmpty().withMessage('Le code promo est requis'),
    body('amount').isFloat({ min: 0 }).withMessage('Le montant de la commande doit être un nombre positif'),
    handleValidationErrors
];

router.route('/')
    .get(authenticate, authorize('admin'), promoController.getPromoCodes)
    .post(authenticate, authorize('admin'), promoValidation, promoController.createPromoCode);

// Route publique pour les codes promo actifs (clients)
router.get('/active', promoController.getActivePromoCodes);

router.post('/validate', validatePromoValidation, promoController.validatePromoCode);

router.route('/:id')
    .put(authenticate, authorize('admin'), promoIdValidation, promoValidation, promoController.updatePromoCode)
    .delete(authenticate, authorize('admin'), promoIdValidation, promoController.deletePromoCode);

module.exports = router;
