const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");

// @route   POST /api/auth/login
// @desc    Admin login
// @access  Public
router.post("/login", authController.login);

module.exports = router;
