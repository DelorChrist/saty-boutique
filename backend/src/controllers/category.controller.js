const { Category } = require('../models');

// @desc    Get all categories
// @route   GET /api/categories
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll({
            order: [['displayOrder', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a category
// @route   POST /api/categories
exports.createCategory = async (req, res, next) => {
    try {
        const { name, slug, description, displayOrder } = req.body;
        const categoryData = { name, slug, description, displayOrder };
        
        if (req.file) {
            categoryData.image = `/uploads/${req.file.filename}`;
        }
        
        const category = await Category.create(categoryData);
        res.status(201).json(category);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Une catégorie avec ce nom ou slug existe déjà' });
        }
        next(error);
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }
        
        const { name, slug, description, displayOrder } = req.body;
        const updateData = { name, slug, description, displayOrder };
        
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }
        
        await category.update(updateData);
        res.json(category);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Une catégorie avec ce nom ou slug existe déjà' });
        }
        next(error);
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }
        
        await category.destroy();
        res.json({ message: 'Catégorie supprimée avec succès' });
    } catch (error) {
        next(error);
    }
};
// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
exports.getCategoryBySlug = async (req, res, next) => {
    try {
        const category = await Category.findOne({
            where: { slug: req.params.slug }
        });
        if (!category) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }
        res.json(category);
    } catch (error) {
        next(error);
    }
};
