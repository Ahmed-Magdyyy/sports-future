const express = require("express");
const router = express.Router();
const controller = require("./championship.controller");
const protect = require("../../middlewares/auth.middleware");

router.get("/", controller.getChampionships);
router.get("/upcoming", controller.getUpcomingChampionship);
router.get("/sport/:sportId", controller.getMatchesBySport);
router.post("/", protect, controller.createChampionship);
router.post("/reorder", protect, controller.reorderChampionships);
router.put("/:id", protect, controller.updateChampionship);
router.delete("/:id", protect, controller.deleteChampionship);

module.exports = router;
