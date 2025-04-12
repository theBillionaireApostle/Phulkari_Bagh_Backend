// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const dbConnect = require('../config/db');
const Product = require('../models/Product');

// GET: Fetch all products
router.get('/', async (req, res) => {
  try {
    await dbConnect();
    const products = await Product.find({});
    return res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch products" });
  }
});

// POST: Create a new product
router.post('/', async (req, res) => {
  try {
    await dbConnect();
    const data = req.body;
    const product = new Product(data);
    await product.save();
    return res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ error: error.message || "Failed to create product" });
  }
});

// GET: Fetch a product by ID
router.get('/:id', async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch product" });
  }
});

// PUT: Update a product by ID
router.put('/:id', async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const data = req.body;
    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ error: error.message || "Failed to update product" });
  }
});

// DELETE: Delete a product by ID
router.delete('/:id', async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ error: error.message || "Failed to delete product" });
  }
});

// PATCH: Update product published status (toggle published field)
router.patch('/:id', async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const { published } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(id, { published }, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product published status:", error);
    return res.status(500).json({ error: error.message || "Failed to toggle product" });
  }
});

// PATCH: Toggle product "published" status by ID, i.e. flip true <-> false
router.patch('/:id/toggle', async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;

    // 1) Find the product first
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 2) Flip the 'published' field
    const newPublishedStatus = !product.published;
    product.published = newPublishedStatus;

    // 3) Save the product
    await product.save();

    return res.json(product);
  } catch (error) {
    console.error("Error toggling product published status:", error);
    return res.status(500).json({ error: error.message || "Failed to toggle product" });
  }
});

module.exports = router;
