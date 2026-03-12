const express = require("express");
const router = express.Router();
const protect = require("../../middlewares/auth.middleware");
const { upload } = require("../../utils/cloudinary");

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private
router.post("/", protect, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    res.json({ imageUrl: req.file.path });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
