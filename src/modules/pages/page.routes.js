const express = require("express");
const router = express.Router();
const { getPageSections, upsertPageSection } = require("./page.controller");
const protect = require("../../middlewares/auth.middleware");
const { uploadSingleImage } = require("../../middlewares/upload.middleware");

router.get("/:pageName", getPageSections);
router.put("/:pageName/:key", protect, uploadSingleImage("image"), upsertPageSection);

module.exports = router;
