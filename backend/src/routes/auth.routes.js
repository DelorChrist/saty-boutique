const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const { registerValidation, loginValidation } = require('../middlewares/validation');
const { authLimiter } = require('../middlewares/rate-limit');

// Apply strict rate limiting to authentication endpoints
router.post('/signup', authLimiter, registerValidation, authController.signup);
router.post('/login', authLimiter, loginValidation, authController.login);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);
router.delete('/profile', authenticate, authController.deleteProfile);

module.exports = router;
