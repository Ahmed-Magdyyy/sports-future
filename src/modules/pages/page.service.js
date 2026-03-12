const PageSection = require("./pageSection.model");

class PageService {
  async getSectionsByPage(pageNameInput) {
    const pageName = pageNameInput.trim().toLowerCase();
    const sections = await PageSection.find({ page: pageName });

    // Group into an object
    const formattedData = {};
    sections.forEach((sec) => {
      formattedData[sec.key] = sec.value;
    });

    return formattedData;
  }

  async upsertSection(pageNameInput, keyInput, value) {
    const pageName = pageNameInput.trim().toLowerCase();
    const keyName = keyInput.trim();

    const section = await PageSection.findOneAndUpdate(
      { page: pageName, key: keyName },
      { value },
      { new: true, upsert: true },
    );

    return section;
  }
}

module.exports = new PageService();
