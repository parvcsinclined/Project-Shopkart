const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
} = require('../controllers/product.controller');

// Task 2 & 3 & 5: Create and List/Search/Filter products
router.post('/', createProduct);
router.get('/', getAllProducts);

// Task 4: Get single product by id
router.get('/:id', getProductById);

module.exports = router;
