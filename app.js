// app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // <-- Import cors
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Import your route modules
const productRoutes = require('./routes/productRoutes');
const productImageRoutes = require('./routes/productImageRoutes');
const cartRoutes = require('./routes/cartRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');



app.use(cors({
    origin: ['http://localhost:3000', 'https://www.phulkaribagh.com'],
    credentials: true
}));
  

// Middleware to parse JSON request bodies and cookies

app.use(cookieParser());

// Mount the routes

// Product routes for basic CRUD and PATCH endpoints
// Example endpoints: GET /api/products, POST /api/products, etc.
app.use('/api/products', productRoutes);

// Product image upload route (e.g., POST /api/products/upload)
app.use('/api/products', productImageRoutes);

// Cart routes: endpoints like GET /api/cart and POST /api/cart, etc.
app.use('/api/cart', cartRoutes);

// User routes for creating/updating user records (e.g., POST /api/users)
app.use('/api/users', userRoutes);

// Admin routes (e.g., POST /admin/login)
app.use('/admin', adminRoutes);

// A simple health-check or test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// (Optional) Global error handler middleware could be added here
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

module.exports = app;
