const mongoose = require('mongoose');
const Product = require('../models/product.model');

// Sample initial products for quick seeding & testing
const sampleProducts = [
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with tactile blue switches and detachable USB-C cable.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
    stock: 15,
  },
  {
    name: 'Noise Cancelling Headphones',
    description: 'Wireless over-ear headphones with active noise cancellation and 30-hour battery life.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    stock: 25,
  },
  {
    name: 'Classic Denim Jacket',
    description: 'Vintage wash denim trucker jacket crafted from 100% premium organic cotton.',
    price: 3499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    stock: 18,
  },
  {
    name: 'Ultralight Running Shoes',
    description: 'Breathable lightweight performance sneakers with responsive cushioning soles.',
    price: 3899,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    stock: 12,
  },
  {
    name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    description: 'Essential programming classic by Robert C. Martin on software craftsmanship and best practices.',
    price: 1299,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    stock: 40,
  },
  {
    name: 'Designing Data-Intensive Applications',
    description: 'The definitive architectural guide to reliable, scalable, and maintainable systems by Martin Kleppmann.',
    price: 1899,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80',
    stock: 22,
  },
  {
    name: 'Smart Pour-Over Coffee Maker',
    description: 'Precision temperature control coffee brewer with integrated scale and smartphone app integration.',
    price: 5499,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
    stock: 8,
  },
  {
    name: 'Ergonomic Memory Foam Chair Pillow',
    description: 'High-density orthopedic lumbar support cushion designed for prolonged desk working hours.',
    price: 1499,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    stock: 30,
  },
];

// Helper to seed initial products if catalog is empty
exports.seedInitialProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(sampleProducts);
      console.log('Seeded initial products catalog');
    }
  } catch (err) {
    console.warn('Initial product seeding skipped:', err.message);
  }
};

// Task 2: Create Product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Check missing fields
    if (
      name === undefined ||
      description === undefined ||
      price === undefined ||
      category === undefined ||
      image === undefined ||
      stock === undefined ||
      name.toString().trim() === '' ||
      description.toString().trim() === '' ||
      category.toString().trim() === '' ||
      image.toString().trim() === ''
    ) {
      return res.status(400).json({ message: 'All fields (name, description, price, category, image, stock) are required' });
    }

    // Validate price
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ message: 'Invalid price: price must be greater than 0' });
    }

    // Validate stock
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      return res.status(400).json({ message: 'Invalid stock: stock must be a non-negative integer' });
    }

    const newProduct = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numStock,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error creating product' });
  }
};

// Task 3, 5 & Bonus: Get All Products with Search, Category Filter, and Sorting
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const query = {};

    // Search by name (case-insensitive)
    if (search && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by category
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      query.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    // Sorting (Bonus Challenge)
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    }

    const products = await Product.find(query)
      .select('_id name description price category image stock createdAt')
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching products' });
  }
};

// Task 4: Get Single Product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id).select(
      '_id name description price category image stock createdAt'
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching product' });
  }
};
