const coachService = require("./coach.service");

// @desc    Get all coaches
// @route   GET /api/coaches
// @access  Public
const getCoaches = async (req, res) => {
  try {
    const coaches = await coachService.getAllCoaches();
    res.json(coaches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single coach
// @route   GET /api/coaches/:id
// @access  Public
const getCoachById = async (req, res) => {
  try {
    const coach = await coachService.getCoachById(req.params.id);
    res.json(coach);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// @desc    Create a coach
// @route   POST /api/coaches
// @access  Private (Admin)
const createCoach = async (req, res) => {
  try {
    const newCoach = await coachService.createCoach(req.body, req.file || null);
    res.status(201).json(newCoach);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

// @desc    Update a coach
// @route   PUT /api/coaches/:id
// @access  Private (Admin)
const updateCoach = async (req, res) => {
  try {
    const updatedCoach = await coachService.updateCoach(
      req.params.id,
      req.body,
      req.file || null
    );
    res.json(updatedCoach);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

// @desc    Delete a coach
// @route   DELETE /api/coaches/:id
// @access  Private (Admin)
const deleteCoach = async (req, res) => {
  try {
    await coachService.deleteCoach(req.params.id);
    res.json({ message: "Coach deleted successfully" });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// @desc    Reorder coaches
// @route   POST /api/coaches/reorder
// @access  Private (Admin)
const reorderCoaches = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Items must be an array" });
    }
    await coachService.reorderCoaches(items);
    res.json({ message: "Coaches reordered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCoaches,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach,
  reorderCoaches,
};
