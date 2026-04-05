const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res) => {
    try {
        const { categoryId, isActive, isFeatured, isNew, isBestSeller, page = 1, limit = 20 } = req.query;
        const where = {};

        if (categoryId) where.categoryId = categoryId;
        if (isActive !== undefined) where.isActive = isActive === 'true';
        if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';
        if (isNew !== undefined) where.isNew = isNew === 'true';
        if (isBestSeller !== undefined) where.isBestSeller = isBestSeller === 'true';

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: products } = await Product.findAndCountAll({
            where,
            include: [{ model: Category, as: 'category' }],
            limit: parseInt(limit),
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            products,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{ model: Category, as: 'category' }]
        });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Produit non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product by slug
// @route   GET /api/products/slug/:slug
exports.getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({
            where: { slug: req.params.slug },
            include: [{ model: Category, as: 'category' }]
        });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Produit non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search products
// @route   GET /api/products/search?q=...
exports.searchProducts = async (req, res) => {
    try {
        const query = (req.query.q || '').trim();
        const { page = 1, limit = 20 } = req.query;

        if (!query) {
            return res.json({ products: [], pagination: { total: 0, page: 1, limit: parseInt(limit), totalPages: 0 } });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: products } = await Product.findAndCountAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${query}%` } },
                    { description: { [Op.like]: `%${query}%` } },
                    { brand: { [Op.like]: `%${query}%` } }
                ]
            },
            include: [{ model: Category, as: 'category' }],
            limit: parseInt(limit),
            offset: offset
        });

        res.json({
            products,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
    try {
        const productData = { ...req.body };

        // Mapper 'category' vers 'categoryId' si nécessaire
        if (productData.category && !productData.categoryId) {
            productData.categoryId = productData.category;
        }

        // Convertir les nombres (FormData envoie des chaînes)
        if (productData.price) productData.price = parseInt(productData.price, 10);
        if (productData.stock) productData.stock = parseInt(productData.stock, 10);
        if (productData.oldPrice) productData.oldPrice = parseInt(productData.oldPrice, 10);

        // Gestion des images
        if (req.files && req.files.length > 0) {
            const images = req.files.map(file => `/uploads/${file.filename}`);
            productData.images = images;
        } else {
            productData.images = [];
        }

        // Parsing JSON strings back to objects for Sequelize JSON columns
        if (typeof productData.variants === 'string') {
            try { productData.variants = JSON.parse(productData.variants); } catch (e) { productData.variants = []; }
        }
        if (typeof productData.features === 'string') {
            try { productData.features = JSON.parse(productData.features); } catch (e) { productData.features = []; }
        }

        productData.isActive = productData.isActive === 'true' || productData.isActive === true;
        productData.isFeatured = productData.isFeatured === 'true' || productData.isFeatured === true;
        productData.isBestSeller = productData.isBestSeller === 'true' || productData.isBestSeller === true;
        productData.isNew = productData.isNew === 'true' || productData.isNew === true;

        // Remove id if empty string
        if (!productData.id) delete productData.id;

        const product = await Product.create(productData);
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({
            message: 'Erreur lors de la création du produit',
            error: error.message,
            details: error.errors ? error.errors.map(e => e.message) : null
        });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (product) {
            const updateData = { ...req.body };

            if (updateData.category && !updateData.categoryId) {
                updateData.categoryId = updateData.category;
            }

            // Convertir les nombres
            if (updateData.price) updateData.price = parseInt(updateData.price, 10);
            if (updateData.stock) updateData.stock = parseInt(updateData.stock, 10);
            if (updateData.oldPrice) updateData.oldPrice = parseInt(updateData.oldPrice, 10);

            // Images
            if (req.files && req.files.length > 0) {
                const newImages = req.files.map(file => `/uploads/${file.filename}`);
                const currentImages = product.images || [];
                updateData.images = [...currentImages, ...newImages];
            }

            // Parsing JSON fields
            if (typeof updateData.variants === 'string') {
                try { updateData.variants = JSON.parse(updateData.variants); } catch (e) { }
            }
            if (typeof updateData.features === 'string') {
                try { updateData.features = JSON.parse(updateData.features); } catch (e) { }
            }

            // Booleans
            if (updateData.isActive !== undefined) updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
            if (updateData.isFeatured !== undefined) updateData.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;
            if (updateData.isBestSeller !== undefined) updateData.isBestSeller = updateData.isBestSeller === 'true' || updateData.isBestSeller === true;

            await product.update(updateData);
            res.json(product);
        } else {
            res.status(404).json({ message: 'Produit non trouvé' });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({
            message: 'Erreur lors de la mise à jour',
            error: error.message,
            details: error.errors ? error.errors.map(e => e.message) : null
        });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (product) {
            await product.destroy();
            res.json({ message: 'Produit supprimé' });
        } else {
            res.status(404).json({ message: 'Produit non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
