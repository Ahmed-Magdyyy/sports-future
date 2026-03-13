const express = require("express");
const router = express.Router();
const controller = require("./championship.controller");
const protect = require("../../middlewares/auth.middleware");
const { uploadSingleImage } = require("../../middlewares/upload.middleware");

router.get("/", controller.getChampionships);
router.get("/upcoming", controller.getUpcomingChampionship);
router.get("/sport/:sportId", controller.getMatchesBySport);
router.post("/", protect, uploadSingleImage("image"), controller.createChampionship);
router.post("/reorder", protect, controller.reorderChampionships);
router.put("/:id", protect, uploadSingleImage("image"), controller.updateChampionship);
router.delete("/:id", protect, controller.deleteChampionship);

module.exports = router;
