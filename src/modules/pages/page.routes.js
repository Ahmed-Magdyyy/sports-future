const express = require("express");
const router = express.Router();
const { getPageSections, upsertPageSection } = require("./page.controller");
const protect = require("../../middlewares/auth.middleware");

router.get("/:pageName", getPageSections);
router.put("/:pageName/:key", protect, upsertPageSection);

module.exports = router;
