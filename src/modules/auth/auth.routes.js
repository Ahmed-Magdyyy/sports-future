const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const protect = require("../../middlewares/auth.middleware");

// @route   POST /api/auth/login
// @desc    Admin login
// @access  Public
router.post("/login", authController.login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post("/refresh", authController.refreshToken);

// @route   POST /api/auth/register
// @desc    Create new user
// @access  Private (Admin)
router.post("/register", protect, authController.register);

module.exports = router;
