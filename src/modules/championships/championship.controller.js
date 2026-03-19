const championshipService = require("./championship.service");

const getChampionships = async (req, res) => {
  try {
    const { month, year } = req.query;
    const championships = await championshipService.findAll(month, year);
    res.json(championships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUpcomingChampionship = async (req, res) => {
  try {
    const upcoming = await championshipService.findUpcoming();
    res.json(upcoming || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMatchesBySport = async (req, res) => {
  try {
    const { sportId } = req.params;
    const matches = await championshipService.findMatchesBySport(sportId);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createChampionship = async (req, res) => {
  try {
    const savedChampionship = await championshipService.create(req.body);
    res.status(201).json(savedChampionship);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

const reorderChampionships = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Items must be an array" });
    }
    await championshipService.updatePositions(items);
    res.json({ message: "Championships reordered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateChampionship = async (req, res) => {
  try {
    const updatedChampionship = await championshipService.update(
      req.params.id,
      req.body
    );
    res.json(updatedChampionship);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

const deleteChampionship = async (req, res) => {
  try {
    await championshipService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

module.exports = {
  getChampionships,
  getUpcomingChampionship,
  getMatchesBySport,
  createChampionship,
  reorderChampionships,
  updateChampionship,
  deleteChampionship,
};
