// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const dbConnect = require('../config/db');
const Cart = require('../models/Cart');
const Product = require('../models/Product'); // Import Product model

// GET: Fetch the cart for a given user, including product images
router.get('/', async (req, res) => {
  try {
    await dbConnect();

    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Find the cart. Using .lean() for a plain JS object.
    const cart = await Cart.findOne({ userId }).lean();

    // If no cart found, return empty
    if (!cart) {
      return res.json({ userId, items: [] });
    }

    // For each item in cart, look up the product to retrieve an image or more details
    const updatedItems = [];
    for (const item of cart.items) {
      // Find the product by its ID
      const product = await Product.findById(item.productId).lean();

      // If found, attach its image (assuming your Product has defaultImage.url)
      if (product && product.defaultImage && product.defaultImage.url) {
        item.image = product.defaultImage.url;
      }
      // If your product schema or naming is different, adjust accordingly.
      // e.g., item.image = product.images[0]?.url || "No Image"

      updatedItems.push(item);
    }

    // Overwrite the original items with updated ones
    cart.items = updatedItems;

    return res.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch cart" });
  }
});

// POST: Save or update the cart for a user.
router.post('/', async (req, res) => {
  try {
    await dbConnect();

    const { userId, items } = req.body;
    if (!userId || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid data: userId and items array are required." });
    }

    // If the items array is empty, remove the cart document completely.
    if (items.length === 0) {
      await Cart.deleteOne({ userId });
      return res.json({ userId, items: [] });
    }

    // Validate each item in the items array.
    const isValidItems = items.every(
      (item) =>
        item.productId &&
        typeof item.productId === "string" &&
        item.name &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.quantity === "number" &&
        Number.isInteger(item.quantity)
    );

    if (!isValidItems) {
      return res.status(400).json({ error: "Invalid items structure." });
    }

    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { items, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json(updatedCart);
  } catch (error) {
    console.error("Error updating cart:", error);
    return res.status(500).json({ error: error.message || "Failed to update cart" });
  }
});

module.exports = router;
