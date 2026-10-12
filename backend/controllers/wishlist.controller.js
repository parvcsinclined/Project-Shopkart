// backend/controllers/wishlist.controller.js
const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

/**
 * Task 2: Add Product to Wishlist
 * POST /wishlist/:productId
 * Protected
 */
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Verify product exists in catalog
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if already in user's wishlist
    const isAlreadyWishlisted = req.user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    // Add product reference and persist
    req.user.wishlist.push(productId);
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding to wishlist',
    });
  }
};

/**
 * Task 3: Get Current User's Wishlist
 * GET /wishlist
 * Protected
 */
exports.getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: '_id name description price category image stock createdAt',
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Exclude any deleted or null references
    const populatedWishlist = (customer.wishlist || []).filter(
      (item) => item !== null
    );

    return res.status(200).json({
      success: true,
      count: populatedWishlist.length,
      wishlist: populatedWishlist,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching wishlist',
    });
  }
};

/**
 * Task 4: Remove Product from Wishlist
 * DELETE /wishlist/:productId
 * Protected
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Check if product is currently in wishlist
    const index = req.user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    // Remove product reference and persist
    req.user.wishlist.splice(index, 1);
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error removing from wishlist',
    });
  }
};

/**
 * Bonus Task 23: Wishlist Toggle API
 * PATCH /wishlist/:productId/toggle
 * Protected
 */
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const index = req.user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (index !== -1) {
      // Product exists -> remove it
      req.user.wishlist.splice(index, 1);
      await req.user.save();
      return res.status(200).json({
        success: true,
        saved: false,
        message: 'Product removed from wishlist',
      });
    } else {
      // Product does not exist -> add it
      req.user.wishlist.push(productId);
      await req.user.save();
      return res.status(200).json({
        success: true,
        saved: true,
        message: 'Product added to wishlist',
      });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error toggling wishlist',
    });
  }
};

/**
 * Bonus Task 24: Get Wishlist Count
 * GET /wishlist/count
 * Protected
 */
exports.getWishlistCount = async (req, res) => {
  try {
    const count = Array.isArray(req.user.wishlist) ? req.user.wishlist.length : 0;
    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error getting wishlist count',
    });
  }
};
