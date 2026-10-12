const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const { seedInitialProducts } = require('./controllers/product.controller');

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow request if no origin (e.g. mobile/curl) or if origin matches localhost/127.0.0.1 on any port
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.warn('MongoDB Atlas connection failed/timed out:', err.message);
    try {
      console.log('Trying local MongoDB fallback (mongodb://127.0.0.1:27017/shopkart)...');
      await mongoose.connect('mongodb://127.0.0.1:27017/shopkart', { serverSelectionTimeoutMS: 3000 });
      console.log('Connected to Local MongoDB');
    } catch (localErr) {
      console.warn('Local MongoDB unavailable:', localErr.message);
      try {
        console.log('Initializing in-memory Mongo server...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri());
        console.log('Connected to In-Memory MongoDB');
      } catch (memErr) {
        console.error('Could not initialize fallback DB:', memErr.message);
      }
    }
  }
};

connectDB()
  .then(async () => {
    await seedInitialProducts();
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });