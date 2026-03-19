const Championship = require("./championship.model");
const { ApiError } = require("../../utils/ApiError");

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

    // An event overlaps with the month if:
    // It starts before or during the month AND ends after or during the month
    query.$or = [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      },
      // Fallback for events that might not have an endDate (if any)
      {
        startDate: { $gte: startDate, $lte: endDate },
        endDate: { $exists: false }
      }
    ];
  }

  const championships = await Championship.find(query)
    .sort({ position: 1, startDate: 1 })
    .populate("sport", "name")
    .populate("coach", "name")
    .lean();
  return championships;
};

/**
 * Get the nearest upcoming championship.
 * @returns {Promise<Object>} Single championship object or null
 */
const findUpcoming = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = await Championship.findOne({
    startDate: { $gte: today },
  })
    .sort({ startDate: 1 })
    .populate("sport", "name")
    .populate("coach", "name image")
    .lean();

  if (!upcoming) return null;

  return upcoming;
};

/**
 * Get organized matches for a specific sport (Previous, Next, After Next)
 * @param {string} sportId - The ID of the sport
 * @returns {Promise<Object>} { previous, next, afterNext }
 */
const findMatchesBySport = async (sportId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the next upcoming match
  const nextMatch = await Championship.findOne({
    sport: sportId,
    startDate: { $gte: today },
  })
    .sort({ startDate: 1 })
    .populate("coach", "name image")
    .lean();

  let afterNextMatch = null;
  if (nextMatch) {
    // Find the one right after nextMatch
    afterNextMatch = await Championship.findOne({
      sport: sportId,
      startDate: { $gte: nextMatch.startDate },
      _id: { $ne: nextMatch._id },
    })
      .sort({ startDate: 1 })
      .populate("coach", "name image")
      .lean();
  }

  // Find the most recent previous match
  const previousMatchQuery = nextMatch
    ? {
        sport: sportId,
        startDate: { $lte: nextMatch.startDate },
        _id: { $ne: nextMatch._id },
      }
    : { sport: sportId, startDate: { $lt: today } };

  const previousMatch = await Championship.findOne(previousMatchQuery)
    .sort({ startDate: -1 })
    .populate("coach", "name image")
    .lean();

  return {
    previous: previousMatch,
    next: nextMatch,
    afterNext: afterNextMatch,
  };
};

/**
 * Create a new championship.
 * @param {Object} data - Championship data
 * @param {Object} file - Uploaded Multer file
 * @returns {Promise<Object>} Created championship
 */
const create = async (payload) => {
  try {
    const championship = await Championship.create(payload);
    return championship.toObject();
  } catch (err) {
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
const update = async (id, payload) => {
  const championship = await Championship.findById(id);
  if (!championship) {
    throw new ApiError(404, "Championship not found");
  }

  try {
    const updated = await Championship.findByIdAndUpdate(id, payload, {
      new: true,
    });

    return updated.toObject();
  } catch (err) {
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

  await Championship.findByIdAndDelete(id);
};

module.exports = {
  findAll,
  findUpcoming,
  create,
  update,
  remove,
  updatePositions,
  findMatchesBySport,
};
