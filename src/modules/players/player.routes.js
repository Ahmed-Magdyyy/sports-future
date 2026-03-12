const express = require("express");
const router = express.Router();
const protect = require("../../middlewares/auth.middleware");
const { uploadSingleImage } = require("../../middlewares/upload.middleware");
const {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  reorderPlayers,
} = require("./player.controller");

router
  .route("/")
  .get(getPlayers)
  .post(protect, uploadSingleImage("image"), createPlayer);

router.post("/reorder", protect, reorderPlayers);

router
  .route("/:id")
  .get(getPlayerById)
  .put(protect, uploadSingleImage("image"), updatePlayer)
  .delete(protect, deletePlayer);

module.exports = router;
