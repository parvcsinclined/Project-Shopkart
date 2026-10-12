// backend/routes/order.routes.js
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth.middleware');
const orderController = require('../controllers/order.controller');

// All order routes require authentication
router.use(protect);

// Task 4: Create order and Razorpay order
router.post('/create-payment-order', orderController.createPaymentOrder);
router.post('/', orderController.createPaymentOrder); // Alias for Postman test plan

// Step 12: Verify Razorpay payment signature and clear cart
router.post('/verify-payment', orderController.verifyPayment);

// Task 7: Get all orders for logged-in user
router.get('/', orderController.getOrders);

// Task 8 / Section 17: Get single order by ID
router.get('/:id', orderController.getOrderById);

// Bonus Challenge (+10 Marks): Update order status progression
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
