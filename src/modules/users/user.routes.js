const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const protect = require("../../middlewares/auth.middleware");

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin)
router.get("/", protect, userController.getUsers);

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private (Admin)
router.delete("/:id", protect, userController.deleteUser);

module.exports = router;
