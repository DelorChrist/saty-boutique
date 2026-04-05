const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const upload = require('../middlewares/upload');
const { optimizeImage } = require('../middlewares/image-optimizer');
const { authenticate, authorize } = require('../middlewares/auth');
const { createProductValidation, updateProductValidation, paginationValidation } = require('../middlewares/validation');

router.get('/search', paginationValidation, productController.searchProducts);
router.get('/slug/:slug', productController.getProductBySlug);

router.route('/')
    .get(paginationValidation, productController.getProducts)
    .post(authenticate, authorize('admin'), upload.array('images', 5), optimizeImage, createProductValidation, productController.createProduct);

router.route('/:id')
    .get(productController.getProductById)
    .put(authenticate, authorize('admin'), upload.array('images', 5), optimizeImage, updateProductValidation, productController.updateProduct)
    .delete(authenticate, authorize('admin'), productController.deleteProduct);

module.exports = router;
