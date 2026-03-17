const Gallery = require("./gallery.model");
const sharp = require("sharp");
const { cloudinary } = require("../../utils/cloudinary");

// Helper to stream upload to Cloudinary
const uploadStream = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
const getGalleryImages = async (req, res) => {
  try {
    const { filter, homeOnly } = req.query; 
    let query = {};
    
    if (homeOnly === 'true') {
      query.showInHome = true;
    } else {
      if (filter === 'general') {
        query.isGeneral = true;
      } else if (filter && filter !== 'all') {
        query.sport = filter;
        query.isGeneral = false;
      }
    }

    const images = await Gallery.find(query).sort({ createdAt: -1 }).populate('sport', 'name');
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
    if (!req.file && !req.body.imageUrl) {
      return res.status(400).json({ message: "Image is required" });
    }

    let imageUrl = req.body.imageUrl;
    let public_id = null;

    if (req.file) {
      // Process with Sharp directly from the memory buffer
      const processedBuffer = await sharp(req.file.buffer)
        .resize({ width: 1200, withoutEnlargement: true }) // Max width 1200px
        .webp({ quality: 80 }) // Convert to WEBP
        .toBuffer();

      const result = await uploadStream(processedBuffer, "sport-future-2/gallery");
      imageUrl = result.secure_url;
      public_id = result.public_id;
    }

    // Default to general if not specified
    const isGeneral = req.body.isGeneral === undefined ? true : (req.body.isGeneral === 'true' || req.body.isGeneral === true);
    // Be careful with 'null' string from FormData
    const sport = (!req.body.sport || req.body.sport === 'null') ? null : req.body.sport;

    const image = await Gallery.create({ 
      imageUrl, 
      public_id,
      isGeneral: sport ? false : isGeneral,
      sport
    });

    res.status(201).json(image);
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a gallery image
// @route   DELETE /api/gallery/:id
// @access  Private
const deleteGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Clean up from Cloudinary
    if (image.public_id) {
       await cloudinary.uploader.destroy(image.public_id);
    }
    
    await Gallery.findByIdAndDelete(req.params.id);

    res.json({ message: "Image removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Toggle showInHome
// @route   PUT /api/gallery/:id/toggle-home
// @access  Private
const toggleShowInHome = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Enforce 6 images max for home
    if (!image.showInHome) {
      const homeImagesCount = await Gallery.countDocuments({ showInHome: true });
      if (homeImagesCount >= 6) {
        return res.status(400).json({ message: "لا يمكن إضافة أكثر من 6 صور للصفحة الرئيسية." });
      }
    }

    image.showInHome = !image.showInHome;
    await image.save();

    res.json(image);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getGalleryImages,
  createGalleryImage,
  deleteGalleryImage,
  toggleShowInHome,
};
