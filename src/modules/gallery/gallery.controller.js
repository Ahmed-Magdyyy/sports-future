const Gallery = require("./gallery.model");

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
const getGalleryImages = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Add a gallery image
// @route   POST /api/gallery
// @access  Private
const createGalleryImage = async (req, res) => {
  try {
    const imageUrl = req.file?.path || req.body.imageUrl;
    if (!imageUrl) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Enforce max 6 images limit
    const count = await Gallery.countDocuments();
    if (count >= 6 && !req.body.ignoreLimit) {
      return res.status(400).json({ message: "Maximum of 6 images allowed in the gallery. Please delete an image first." });
    }

    const image = await Gallery.create({ imageUrl });
    res.status(201).json(image);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a gallery image
// @route   DELETE /api/gallery/:id
// @access  Private
const deleteGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    // Note: To fully clean up, we should also delete the image from Cloudinary here 
    // using cloudinary.uploader.destroy if we extract the public_id, but keeping it simple for now.
    res.json({ message: "Image removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getGalleryImages,
  createGalleryImage,
  deleteGalleryImage,
};
