const pageService = require("./page.service");

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
    const { value } = req.body;
    if (!value) {
      return res.status(400).json({ message: "Value is required" });
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
