const { PromoCode } = require('../models');

// @desc    Get all promo codes
// @route   GET /api/promos
exports.getPromoCodes = async (req, res, next) => {
    try {
        const promos = await PromoCode.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(promos);
    } catch (error) {
        next(error);
    }
};

// @desc    Get active promo codes (for customers)
// @route   GET /api/promos/active
exports.getActivePromoCodes = async (req, res, next) => {
    try {
        const promos = await PromoCode.findAll({
            where: { 
                isActive: true 
            },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'code', 'type', 'discount', 'minOrderAmount', 'expiryDate']
        });
        
        // Filter out expired promos
        const validPromos = promos.filter(promo => {
            if (!promo.expiryDate) return true;
            return new Date(promo.expiryDate) >= new Date();
        });
        
        res.json(validPromos);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a promo code
// @route   POST /api/promos
exports.createPromoCode = async (req, res, next) => {
    try {
        const { code, type, discount, minOrderAmount, expiryDate, isActive } = req.body;
        
        // Validate discount value based on type
        if (type === 'percentage' && discount > 100) {
            return res.status(400).json({ message: 'La réduction en pourcentage ne peut pas dépasser 100%' });
        }
        
        const promo = await PromoCode.create({
            code: code.toUpperCase(),
            type,
            discount,
            minOrderAmount: minOrderAmount || 0,
            expiryDate: expiryDate || null,
            isActive: isActive !== undefined ? isActive : true
        });
        
        res.status(201).json(promo);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Ce code promo existe déjà' });
        }
        next(error);
    }
};

// @desc    Update a promo code
// @route   PUT /api/promos/:id
exports.updatePromoCode = async (req, res, next) => {
    try {
        const promo = await PromoCode.findByPk(req.params.id);
        if (!promo) {
            return res.status(404).json({ message: 'Code promo non trouvé' });
        }
        
        const { code, type, discount, minOrderAmount, expiryDate, isActive } = req.body;
        
        // Validate discount value based on type
        if (type === 'percentage' && discount > 100) {
            return res.status(400).json({ message: 'La réduction en pourcentage ne peut pas dépasser 100%' });
        }
        
        await promo.update({
            code: code ? code.toUpperCase() : promo.code,
            type: type || promo.type,
            discount: discount !== undefined ? discount : promo.discount,
            minOrderAmount: minOrderAmount !== undefined ? minOrderAmount : promo.minOrderAmount,
            expiryDate: expiryDate !== undefined ? expiryDate : promo.expiryDate,
            isActive: isActive !== undefined ? isActive : promo.isActive
        });
        
        res.json(promo);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Ce code promo existe déjà' });
        }
        next(error);
    }
};

// @desc    Delete a promo code
// @route   DELETE /api/promos/:id
exports.deletePromoCode = async (req, res, next) => {
    try {
        const promo = await PromoCode.findByPk(req.params.id);
        if (!promo) {
            return res.status(404).json({ message: 'Code promo non trouvé' });
        }
        
        await promo.destroy();
        res.json({ message: 'Code promo supprimé avec succès' });
    } catch (error) {
        next(error);
    }
};

// @desc    Validate a promo code
// @route   POST /api/promos/validate
exports.validatePromoCode = async (req, res, next) => {
    try {
        const { code, amount } = req.body;

        if (!code || typeof code !== 'string') {
            return res.status(400).json({ message: 'Code promo invalide' });
        }

        const sanitizedCode = code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');

        const promo = await PromoCode.findOne({
            where: { code: sanitizedCode, isActive: true }
        });

        if (!promo) {
            return res.status(404).json({ message: 'Code promo invalide ou inactif' });
        }

        if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
            return res.status(400).json({ message: 'Ce code promo a expiré' });
        }

        if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
            return res.status(400).json({ message: 'Ce code promo a atteint sa limite d\'utilisation' });
        }

        if (amount < promo.minOrderAmount) {
            return res.status(400).json({
                message: `Le montant minimum pour ce code est de ${promo.minOrderAmount} FCFA`
            });
        }

        res.json(promo);
    } catch (error) {
        next(error);
    }
};
