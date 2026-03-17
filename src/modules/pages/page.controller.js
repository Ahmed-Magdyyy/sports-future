const pageService = require("./page.service");
const sharp = require("sharp");
const { cloudinary } = require("../../utils/cloudinary");

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

// @desc    Get all text sections for a specific page (e.g., "home")
// @route   GET /api/pages/:pageName
// @access  Public
const getPageSections = async (req, res) => {
  try {
    const formattedData = await pageService.getSectionsByPage(
      req.params.pageName,
    );
    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update or create a text section for a page
// @route   PUT /api/pages/:pageName/:key
// @access  Private (Admin)
const upsertPageSection = async (req, res) => {
  try {
    let { value } = req.body;
    
    // Check if an image is uploaded
    if (req.file) {
      // Process with Sharp directly from the memory buffer
      const processedBuffer = await sharp(req.file.buffer)
        .resize({ width: 1200, withoutEnlargement: true }) // Max width 1200px
        .webp({ quality: 80 }) // Convert to WEBP
        .toBuffer();

      const result = await uploadStream(processedBuffer, "sport-future-2/pages");
      value = result.secure_url;
    }

    if (!value && !req.file) {
      return res.status(400).json({ message: "Value or image is required" });
    }

    const section = await pageService.upsertSection(
      req.params.pageName,
      req.params.key,
      value,
    );
    res.json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getPageSections,
  upsertPageSection,
};
