// backend/routes/cart.routes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const protect = require('../middlewares/auth.middleware');

// All cart endpoints are protected
router.use(protect);

// Base cart routes
router.get('/', cartController.getCart);
router.delete('/', cartController.clearCart);

// Parametric cart routes
router.post('/:productId', cartController.addToCart);
router.patch('/:productId', cartController.updateQuantity);
router.delete('/:productId', cartController.removeFromCart);

module.exports = router;
