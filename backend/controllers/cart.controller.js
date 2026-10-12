// backend/controllers/cart.controller.js
const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// Helper to populate cart items with current product information
const getPopulatedCart = async (userId) => {
  const customer = await Customer.findById(userId).populate({
    path: 'cart.product',
    select: '_id name description price category image stock createdAt',
  });

  if (!customer) return [];

  // Filter out any cart entries whose referenced product no longer exists
  return (customer.cart || []).filter((item) => item.product !== null);
};

/**
 * Task 2: Add Product to Cart API
 * POST /cart/:productId
 * Protected
 */
exports.addToCart = async (req, res) => {
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

    // Ensure user cart array exists
    if (!Array.isArray(req.user.cart)) {
      req.user.cart = [];
    }

    const existingItem = req.user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!existingItem) {
      // Product not in cart: check if at least 1 unit is available
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: 'Product is out of stock',
        });
      }

      req.user.cart.push({
        product: productId,
        quantity: 1,
      });
    } else {
      // Product already in cart: increment by 1
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (${product.stock} available)`,
        });
      }

      existingItem.quantity = newQuantity;
    }

    await req.user.save();
    const updatedCart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding to cart',
    });
  }
};

/**
 * Task 3: Get Current User Cart
 * GET /cart
 * Protected
 */
exports.getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching cart',
    });
  }
};

/**
 * Task 4: Update Product Quantity
 * PATCH /cart/:productId
 * Protected
 */
exports.updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Validate quantity is a number
    if (quantity === undefined || quantity === null || isNaN(Number(quantity))) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid number',
      });
    }

    const numQuantity = Number(quantity);

    // Quantity must be at least 1
    if (numQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    // Check if product exists in catalog
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if product is in user's cart
    if (!Array.isArray(req.user.cart)) {
      req.user.cart = [];
    }

    const existingItem = req.user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    // Validate against product stock
    if (numQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds available stock (${product.stock} available)`,
      });
    }

    existingItem.quantity = numQuantity;
    await req.user.save();

    const updatedCart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating cart quantity',
    });
  }
};

/**
 * Task 5: Remove Product from Cart
 * DELETE /cart/:productId
 * Protected
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    if (!Array.isArray(req.user.cart)) {
      req.user.cart = [];
    }

    const itemIndex = req.user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    req.user.cart.splice(itemIndex, 1);
    await req.user.save();

    const updatedCart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error removing from cart',
    });
  }
};

/**
 * Clear Entire Cart
 * DELETE /cart
 * Protected
 */
exports.clearCart = async (req, res) => {
  try {
    req.user.cart = [];
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: [],
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error clearing cart',
    });
  }
};
