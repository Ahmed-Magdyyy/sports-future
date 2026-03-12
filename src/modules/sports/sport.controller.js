const sportService = require("./sport.service");

// @desc    Get all sports
// @route   GET /api/sports
// @access  Public
const getSports = async (req, res) => {
  try {
    const sports = await sportService.getAllSports();
    res.json(sports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get a single sport by name, including all coaches and players
// @route   GET /api/sports/:name
// @access  Public
const getSportByName = async (req, res) => {
  try {
    const sportData = await sportService.getSportByName(req.params.name);

    if (!sportData) {
      return res.status(404).json({ message: "Sport not found" });
    }

    res.json(sportData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a new sport
// @route   POST /api/sports
// @access  Private (Admin)
const createSport = async (req, res) => {
  try {
    const savedSport = await sportService.createSport(req.body, req.file || null);
    res.status(201).json(savedSport);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

// @desc    Update a sport
// @route   PUT /api/sports/:name
// @access  Private (Admin)
const updateSport = async (req, res) => {
  try {
    const updatedSport = await sportService.updateSport(
      req.params.name,
      req.body,
      req.file || null
    );
    res.json(updatedSport);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

// @desc    Reorder sports
// @route   POST /api/sports/reorder
// @access  Private (Admin)
const reorderSports = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Items must be an array" });
    }
    await sportService.reorderSports(items);
    res.json({ message: "Sports reordered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSports,
  getSportByName,
  createSport,
  updateSport,
  reorderSports,
};
