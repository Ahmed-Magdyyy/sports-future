const express = require("express");
const router = express.Router();
const {
  getSports,
  getSportByName,
  createSport,
  updateSport,
  reorderSports,
} = require("./sport.controller");
const protect = require("../../middlewares/auth.middleware");
const { uploadSingleImage } = require("../../middlewares/upload.middleware");

router.get("/", getSports);
router.post("/", protect, uploadSingleImage("bgImg"), createSport);
router.post("/reorder", protect, reorderSports);

router.get("/:name", getSportByName);
router.put("/:name", protect, uploadSingleImage("bgImg"), updateSport);

module.exports = router;
