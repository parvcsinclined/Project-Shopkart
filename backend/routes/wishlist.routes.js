// backend/routes/wishlist.routes.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const protect = require('../middlewares/auth.middleware');

// All Wishlist endpoints are protected
router.use(protect);

// Specific routes first
router.get('/', wishlistController.getWishlist);
router.get('/count', wishlistController.getWishlistCount);

// Parametric routes
router.post('/:productId', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);
router.patch('/:productId/toggle', wishlistController.toggleWishlist);

module.exports = router;
