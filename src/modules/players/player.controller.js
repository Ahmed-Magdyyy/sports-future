const playerService = require("./player.service");

// @desc    Get all players
// @route   GET /api/players
// @access  Public
const getPlayers = async (req, res) => {
  try {
    const players = await playerService.getAllPlayers();
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single player
// @route   GET /api/players/:id
// @access  Public
const getPlayerById = async (req, res) => {
  try {
    const player = await playerService.getPlayerById(req.params.id);
    res.json(player);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// @desc    Create a player
// @route   POST /api/players
// @access  Private (Admin)
const createPlayer = async (req, res) => {
  try {
    const newPlayer = await playerService.createPlayer(req.body, req.file || null);
    res.status(201).json(newPlayer);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

// @desc    Update a player
// @route   PUT /api/players/:id
// @access  Private (Admin)
const updatePlayer = async (req, res) => {
  try {
    const updatedPlayer = await playerService.updatePlayer(
      req.params.id,
      req.body,
      req.file || null
    );
    res.json(updatedPlayer);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

// @desc    Delete a player
// @route   DELETE /api/players/:id
// @access  Private (Admin)
const deletePlayer = async (req, res) => {
  try {
    await playerService.deletePlayer(req.params.id);
    res.json({ message: "Player deleted successfully" });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// @desc    Reorder players
// @route   POST /api/players/reorder
// @access  Private (Admin)
const reorderPlayers = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Items must be an array" });
    }
    await playerService.reorderPlayers(items);
    res.json({ message: "Players reordered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  reorderPlayers,
};
