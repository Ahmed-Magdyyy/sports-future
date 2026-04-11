const letterService = require("./letter.service");

// @desc    Get letters (by type optionally)
// @route   GET /api/letters
// @access  Private (Admin)
const getLetters = async (req, res) => {
  try {
    const letters = await letterService.getLetters(req.query);
    res.json(letters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single letter
// @route   GET /api/letters/:id
// @access  Private (Admin)
const getLetterById = async (req, res) => {
  try {
    const letter = await letterService.getLetterById(req.params.id);
    res.json(letter);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// @desc    Create a letter
// @route   POST /api/letters
// @access  Private (Admin)
const createLetter = async (req, res) => {
  try {
    const newLetter = await letterService.createLetter(req.body, req.file || null);
    res.status(201).json(newLetter);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

// @desc    Update a letter
// @route   PUT /api/letters/:id
// @access  Private (Admin)
const updateLetter = async (req, res) => {
  try {
    const updatedLetter = await letterService.updateLetter(
      req.params.id,
      req.body,
      req.file || null
    );
    res.json(updatedLetter);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

// @desc    Delete a letter
// @route   DELETE /api/letters/:id
// @access  Private (Admin)
const deleteLetter = async (req, res) => {
  try {
    await letterService.deleteLetter(req.params.id);
    res.json({ message: "Letter deleted successfully" });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

module.exports = {
  getLetters,
  getLetterById,
  createLetter,
  updateLetter,
  deleteLetter,
};
