const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbConnect = require('../config/db');
const User = require('../models/User');

const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  throw new Error("Missing JWT_SECRET environment variable");
}

/**
 * POST /admin/login
 * Expects a JSON body with "username" and "password".
 */
router.post('/login', async (req, res) => {
  try {
    // Connect to the database
    await dbConnect();

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Look up the admin user by email (assuming 'username' is the email) and role.
    const user = await User.findOne({ email: username, role: "admin" });
    if (!user) {
      console.log("User not found for email:", username);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // For debugging: log the stored hashed password (remove or disable in production)
    console.log("Stored hash:", user.password);

    // Compare the provided password with the stored hashed password.
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      console.log("Password mismatch for user:", username);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create a JWT that includes the admin's UID and role.
    const token = jwt.sign({ uid: user.uid, role: "admin" }, SECRET_KEY, {
      expiresIn: "1d",
      algorithm: "HS256",
    });

    // Set the token in an HTTP-only cookie
    res.cookie("admin_jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 1000, // maxAge is in milliseconds (1 day)
      sameSite: "strict",
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;