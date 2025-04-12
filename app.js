// app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // <-- Import cors

// Import your route modules
const productRoutes = require('./routes/productRoutes');
const productImageRoutes = require('./routes/productImageRoutes');
const cartRoutes = require('./routes/cartRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Setup CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://www.phulkaribagh.com'],
  credentials: true
}));

// Increase request body limits for JSON & urlencoded
// so large base64 images won't fail with 413
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Parse cookies
app.use(cookieParser());

// Mount the routes
app.use('/api/products', productRoutes);
app.use('/api/products', productImageRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/admin', adminRoutes);

// A simple health-check route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Optional global error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

module.exports = app;
