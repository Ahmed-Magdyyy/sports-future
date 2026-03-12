const Championship = require("./championship.model");
const { ApiError } = require("../../utils/ApiError");
const {
  validateImageFile,
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} = require("../../utils/imageUpload");

/**
 * Get all championships, optionally filtered by month and year.
 * @param {number} month - 1-12
 * @param {number} year - Full year (e.g. 2025)
 * @returns {Promise<Array>} List of championships
 */
const findAll = async (month, year) => {
  let query = {};

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    query.date = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const championships = await Championship.find(query)
    .sort({ position: 1, date: 1 })
    .populate("sport", "name")
    .lean();
  return championships.map(c => ({
    ...c,
    image: c.image?.url || null,
  }));
};

/**
 * Get the nearest upcoming championship.
 * @returns {Promise<Object>} Single championship object or null
 */
const findUpcoming = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = await Championship.findOne({
    date: { $gte: today },
  })
    .sort({ date: 1 })
    .populate("sport", "name")
    .lean();

  if (!upcoming) return null;

  return {
    ...upcoming,
    image: upcoming.image?.url || null,
  };
};

/**
 * Create a new championship.
 * @param {Object} data - Championship data
 * @param {Object} file - Uploaded Multer file
 * @returns {Promise<Object>} Created championship
 */
const create = async (payload, file) => {
  let imageObj;

  if (file) {
    validateImageFile(file);
    const result = await uploadImageToCloudinary(file, {
      folder: "sportfuture/championships",
      publicId: `championship_${Date.now()}`,
    });
    imageObj = {
      url: result.url,
      public_id: result.public_id,
    };
  }

  try {
    const championship = await Championship.create({
      ...payload,
      ...(imageObj && { image: imageObj }), // Only set if provided
    });
    return {
      ...championship.toObject(),
      image: championship.image?.url || null,
    };
  } catch (err) {
    if (imageObj?.public_id) {
      await deleteImageFromCloudinary(imageObj.public_id);
    }
    throw err;
  }
};

/**
 * Update positions for multiple championships via bulk write.
 * @param {Array} items - Array of { id, position }
 */
const updatePositions = async (items) => {
  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { position: item.position },
    },
  }));
  await Championship.bulkWrite(bulkOps);
};

/**
 * Update an existing championship.
 * @param {string} id - Championship ID
 * @param {Object} data - Updated data
 * @param {Object} file - New image file (optional)
 * @returns {Promise<Object>} Updated championship
 */
const update = async (id, payload, file) => {
  const championship = await Championship.findById(id);
  if (!championship) {
    throw new ApiError(404, "Championship not found");
  }

  let newImageObj;
  if (file) {
    validateImageFile(file);
    const result = await uploadImageToCloudinary(file, {
      folder: "sportfuture/championships",
      publicId: `championship_${Date.now()}`,
    });
    newImageObj = {
      url: result.url,
      public_id: result.public_id,
    };
  }

  try {
    const updated = await Championship.findByIdAndUpdate(
      id,
      {
        ...payload,
        ...(newImageObj && { image: newImageObj }),
      },
      { new: true }
    );

    // If new image uploaded and old image existed, delete old image
    if (newImageObj && championship.image?.public_id) {
      await deleteImageFromCloudinary(championship.image.public_id).catch(console.error);
    }

    return {
      ...updated.toObject(),
      image: updated.image?.url || null,
    };
  } catch (err) {
    if (newImageObj) {
      await deleteImageFromCloudinary(newImageObj.public_id).catch(console.error);
    }
    throw err;
  }
};

/**
 * Delete a championship.
 * @param {string} id - Championship ID
 */
const remove = async (id) => {
  const championship = await Championship.findById(id);
  if (!championship) {
    throw new ApiError(404, "Championship not found");
  }

  if (championship.image?.public_id) {
    await deleteImageFromCloudinary(championship.image.public_id).catch(
      console.error
    );
  }

  await Championship.findByIdAndDelete(id);
};

module.exports = {
  findAll,
  findUpcoming,
  create,
  update,
  remove,
  updatePositions,
};
